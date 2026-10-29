import {
  type AuthenticationCreds,
  type AuthenticationState,
  BufferJSON,
  initAuthCreds,
  proto,
  type SignalDataTypeMap,
} from 'baileys';
import { eq, inArray, sql } from 'drizzle-orm';
import { db } from '#/db/client';
import { waAuthState } from '#/db/schema';

const CREDS_KEY = 'creds';

function serialize(value: unknown): string {
  return JSON.stringify(value, BufferJSON.replacer);
}

function deserialize(value: string): unknown {
  return JSON.parse(value, BufferJSON.reviver);
}

async function writeEntries(entries: { key: string; value: string }[]): Promise<void> {
  if (entries.length === 0) {
    return;
  }
  await db
    .insert(waAuthState)
    .values(entries)
    .onConflictDoUpdate({
      target: waAuthState.key,
      set: { value: sql`excluded.value` },
    });
}

export async function loadAuthState(): Promise<{
  state: AuthenticationState;
  saveCreds: () => Promise<void>;
}> {
  const [stored] = await db.select().from(waAuthState).where(eq(waAuthState.key, CREDS_KEY));
  const creds = stored ? (deserialize(stored.value) as AuthenticationCreds) : initAuthCreds();

  return {
    state: {
      creds,
      keys: {
        async get<T extends keyof SignalDataTypeMap>(type: T, ids: string[]) {
          const keys = ids.map((id) => `${type}-${id}`);
          const rows =
            keys.length === 0
              ? []
              : await db.select().from(waAuthState).where(inArray(waAuthState.key, keys));
          const byKey = new Map(rows.map((row) => [row.key, row.value]));
          const result: { [id: string]: SignalDataTypeMap[T] } = {};
          for (const id of ids) {
            const raw = byKey.get(`${type}-${id}`);
            if (raw === undefined) {
              continue;
            }
            const value = deserialize(raw);
            result[id] = (
              type === 'app-state-sync-key'
                ? proto.Message.AppStateSyncKeyData.fromObject(value as object)
                : value
            ) as SignalDataTypeMap[T];
          }
          return result;
        },
        async set(data) {
          const upserts: { key: string; value: string }[] = [];
          const removals: string[] = [];
          for (const [type, entries] of Object.entries(data)) {
            for (const [id, value] of Object.entries(entries ?? {})) {
              const key = `${type}-${id}`;
              if (value) {
                upserts.push({ key, value: serialize(value) });
              } else {
                removals.push(key);
              }
            }
          }
          await writeEntries(upserts);
          if (removals.length > 0) {
            await db.delete(waAuthState).where(inArray(waAuthState.key, removals));
          }
        },
      },
    },
    saveCreds: () => writeEntries([{ key: CREDS_KEY, value: serialize(creds) }]),
  };
}

export async function clearAuthState(): Promise<void> {
  await db.delete(waAuthState);
}
