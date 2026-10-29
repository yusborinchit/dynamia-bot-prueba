import type { Buyer, BuyerUpdateBody } from '@wsp/contracts';
import { desc, eq } from 'drizzle-orm';
import { db } from '#/db/client';
import { buyers } from '#/db/schema';
import { toIso } from '#/lib/dates';
import { notFound } from '#/lib/http-error';

type BuyerRow = typeof buyers.$inferSelect;

export function buyerName(row: Pick<BuyerRow, 'displayName' | 'waName' | 'phone'>): string {
  return row.displayName ?? row.waName ?? row.phone ?? 'Sin nombre';
}

function toBuyer(row: BuyerRow): Buyer {
  return {
    id: row.id,
    name: buyerName(row),
    wa_name: row.waName,
    display_name: row.displayName,
    phone: row.phone,
    created_at: toIso(row.createdAt),
  };
}

export async function listBuyers(): Promise<Buyer[]> {
  const rows = await db.select().from(buyers).orderBy(desc(buyers.createdAt));
  return rows.map(toBuyer);
}

export async function updateBuyer(id: number, body: BuyerUpdateBody): Promise<Buyer> {
  const [row] = await db
    .update(buyers)
    .set({ displayName: body.display_name })
    .where(eq(buyers.id, id))
    .returning();
  if (!row) {
    throw notFound('Comprador no encontrado.');
  }
  return toBuyer(row);
}

export async function upsertBuyer(input: {
  waJid: string;
  phone: string | null;
  waName: string | null;
}): Promise<number> {
  const [row] = await db
    .insert(buyers)
    .values(input)
    .onConflictDoUpdate({
      target: buyers.waJid,
      set: {
        ...(input.waName ? { waName: input.waName } : {}),
        ...(input.phone ? { phone: input.phone } : {}),
      },
    })
    .returning({ id: buyers.id });
  if (!row) {
    throw new Error('Buyer upsert returned no row');
  }
  return row.id;
}
