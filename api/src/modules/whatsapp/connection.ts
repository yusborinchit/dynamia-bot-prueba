import type { ConnectionStatus, WhatsappGroup } from '@wsp/contracts';
import makeWASocket, {
  Browsers,
  DisconnectReason,
  makeCacheableSignalKeyStore,
  type WASocket,
} from 'baileys';
import type { FastifyBaseLogger } from 'fastify';
import pino from 'pino';
import qrcode from 'qrcode-terminal';
import { clearAuthState, loadAuthState } from './auth-state';
import { ingestMessage } from './ingest';

const RECONNECT_DELAY_MS = 5_000;

export type WhatsappConnection = {
  status: () => { connection: ConnectionStatus; waitingForQr: boolean };
  groups: () => Promise<WhatsappGroup[]>;
  stop: () => void;
};

function disconnectCode(error: Error | undefined): number | undefined {
  const output = (error as { output?: { statusCode?: number } } | undefined)?.output;
  return output?.statusCode;
}

export function startWhatsapp(
  logger: FastifyBaseLogger,
  groupJid: string | undefined,
): WhatsappConnection {
  const baileysLogger = pino({ level: 'silent' });
  let socket: WASocket | null = null;
  let connection: ConnectionStatus = 'connecting';
  let waitingForQr = false;
  let stopped = false;

  if (!groupJid) {
    logger.warn('WHATSAPP_GROUP_JID is not set: messages will not be stored');
  }

  async function connect(): Promise<void> {
    const { state, saveCreds } = await loadAuthState();
    const current = makeWASocket({
      auth: {
        creds: state.creds,
        keys: makeCacheableSignalKeyStore(state.keys, baileysLogger),
      },
      logger: baileysLogger,
      browser: Browsers.ubuntu('Chrome'),
      markOnlineOnConnect: false,
      syncFullHistory: false,
    });
    socket = current;

    current.ev.on('creds.update', () => {
      void saveCreds();
    });

    current.ev.on('connection.update', (update) => {
      if (update.qr) {
        waitingForQr = true;
        logger.info('WhatsApp waiting for QR scan');
        qrcode.generate(update.qr, { small: true });
      }
      if (update.connection === 'open') {
        connection = 'open';
        waitingForQr = false;
        logger.info('WhatsApp connected');
      }
      if (update.connection === 'close') {
        connection = 'close';
        const code = disconnectCode(update.lastDisconnect?.error);
        if (stopped) {
          return;
        }
        if (code === DisconnectReason.loggedOut) {
          logger.warn('WhatsApp session logged out: clearing session, a new QR is required');
          void clearAuthState().then(() => scheduleReconnect());
          return;
        }
        logger.warn({ code }, 'WhatsApp disconnected: reconnecting');
        scheduleReconnect();
      }
    });

    current.ev.on('messages.upsert', ({ messages }) => {
      if (!groupJid) {
        return;
      }
      for (const message of messages) {
        ingestMessage(message, groupJid).catch((error: unknown) => {
          logger.error({ err: error }, 'Failed to store WhatsApp message');
        });
      }
    });
  }

  function scheduleReconnect(): void {
    connection = 'connecting';
    setTimeout(() => {
      connect().catch((error: unknown) => {
        logger.error({ err: error }, 'WhatsApp reconnection failed');
        scheduleReconnect();
      });
    }, RECONNECT_DELAY_MS);
  }

  connect().catch((error: unknown) => {
    logger.error({ err: error }, 'WhatsApp connection failed');
    scheduleReconnect();
  });

  return {
    status: () => ({ connection, waitingForQr }),
    groups: async () => {
      if (!socket || connection !== 'open') {
        return [];
      }
      const groups = await socket.groupFetchAllParticipating();
      return Object.values(groups).map((group) => ({
        jid: group.id,
        subject: group.subject,
        size: group.size ?? group.participants.length,
      }));
    },
    stop: () => {
      stopped = true;
      socket?.end(undefined);
    },
  };
}
