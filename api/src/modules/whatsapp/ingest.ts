import {
  getContentType,
  isPnUser,
  normalizeMessageContent,
  proto,
  toNumber,
  type WAMessage,
} from 'baileys';
import { and, eq, isNull } from 'drizzle-orm';
import { db } from '#/db/client';
import { messages } from '#/db/schema';
import { upsertBuyer } from '#/modules/buyers/service';

type Content = proto.IMessage;

const MEDIA_TYPES = new Set<keyof Content>([
  'imageMessage',
  'audioMessage',
  'videoMessage',
  'stickerMessage',
  'documentMessage',
  'documentWithCaptionMessage',
  'ptvMessage',
]);

function textOf(content: Content | null | undefined): string | null {
  const normalized = normalizeMessageContent(content);
  if (!normalized) {
    return null;
  }
  const text =
    normalized.conversation ??
    normalized.extendedTextMessage?.text ??
    normalized.imageMessage?.caption ??
    normalized.videoMessage?.caption ??
    normalized.documentMessage?.caption ??
    null;
  return text?.trim() || null;
}

function quotedTextOf(content: Content): string | null {
  const contextInfo =
    content.extendedTextMessage?.contextInfo ??
    content.imageMessage?.contextInfo ??
    content.videoMessage?.contextInfo ??
    content.audioMessage?.contextInfo ??
    null;
  return textOf(contextInfo?.quotedMessage);
}

function phoneOf(...jids: (string | null | undefined)[]): string | null {
  const jid = jids.find((candidate) => isPnUser(candidate ?? undefined));
  return jid ? (jid.split('@')[0]?.split(':')[0] ?? null) : null;
}

function sentAtOf(message: WAMessage): Date {
  const seconds = toNumber(message.messageTimestamp);
  return seconds > 0 ? new Date(seconds * 1000) : new Date();
}

async function applyProtocolMessage(protocol: proto.Message.IProtocolMessage): Promise<void> {
  const targetId = protocol.key?.id;
  if (!targetId) {
    return;
  }
  const pending = and(eq(messages.waMessageId, targetId), isNull(messages.batchId));
  if (protocol.type === proto.Message.ProtocolMessage.Type.MESSAGE_EDIT) {
    const body = textOf(protocol.editedMessage);
    if (body) {
      await db.update(messages).set({ body }).where(pending);
    }
  }
  if (protocol.type === proto.Message.ProtocolMessage.Type.REVOKE) {
    await db.update(messages).set({ deletedAt: new Date() }).where(pending);
  }
}

export async function ingestMessage(message: WAMessage, groupJid: string): Promise<void> {
  const { key } = message;
  if (key.remoteJid !== groupJid || key.fromMe || !key.id || !key.participant) {
    return;
  }
  const content = normalizeMessageContent(message.message);
  if (!content) {
    return;
  }
  if (content.protocolMessage) {
    await applyProtocolMessage(content.protocolMessage);
    return;
  }
  const type = getContentType(content);
  const isText = type === 'conversation' || type === 'extendedTextMessage';
  const isMedia = type !== undefined && MEDIA_TYPES.has(type);
  if (!isText && !isMedia) {
    return;
  }

  const buyerId = await upsertBuyer({
    waJid: key.participant,
    phone: phoneOf(key.participant, key.participantAlt),
    waName: message.pushName?.trim() || null,
  });

  await db
    .insert(messages)
    .values({
      waMessageId: key.id,
      buyerId,
      kind: isText ? 'text' : 'media',
      body: textOf(content),
      quotedBody: quotedTextOf(content),
      sentAt: sentAtOf(message),
    })
    .onConflictDoNothing();
}
