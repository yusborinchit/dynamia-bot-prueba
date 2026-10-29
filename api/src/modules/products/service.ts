import type { Product, ProductBody } from '@wsp/contracts';
import { asc, eq } from 'drizzle-orm';
import { db, type Tx } from '#/db/client';
import { productAliases, products } from '#/db/schema';
import { conflict, notFound } from '#/lib/http-error';
import { normalizeText } from '#/lib/text';

export async function listProducts(): Promise<Product[]> {
  const rows = await db.query.products.findMany({
    with: { aliases: { columns: { alias: true } } },
    orderBy: asc(products.name),
  });
  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    aliases: row.aliases.map((alias) => alias.alias).sort(),
  }));
}

async function findProduct(id: number): Promise<Product> {
  const product = (await listProducts()).find((item) => item.id === id);
  if (!product) {
    throw notFound('Producto no encontrado.');
  }
  return product;
}

async function replaceAliases(tx: Tx, productId: number, aliases: string[]): Promise<void> {
  await tx.delete(productAliases).where(eq(productAliases.productId, productId));
  const unique = [...new Set(aliases.map(normalizeText))].filter(Boolean);
  if (unique.length === 0) {
    return;
  }
  const inserted = await tx
    .insert(productAliases)
    .values(unique.map((alias) => ({ productId, alias })))
    .onConflictDoNothing()
    .returning({ alias: productAliases.alias });
  if (inserted.length !== unique.length) {
    const taken = unique.filter((alias) => !inserted.some((row) => row.alias === alias));
    throw conflict(`Alias ya usados por otro producto: ${taken.join(', ')}.`);
  }
}

export async function createProduct(body: ProductBody): Promise<Product> {
  const id = await db.transaction(async (tx) => {
    const [product] = await tx
      .insert(products)
      .values({ name: body.name })
      .onConflictDoNothing()
      .returning({ id: products.id });
    if (!product) {
      throw conflict('Ya existe un producto con ese nombre.');
    }
    await replaceAliases(tx, product.id, body.aliases);
    return product.id;
  });
  return findProduct(id);
}

export async function updateProduct(id: number, body: ProductBody): Promise<Product> {
  await findProduct(id);
  await db.transaction(async (tx) => {
    const [existing] = await tx
      .select({ id: products.id })
      .from(products)
      .where(eq(products.name, body.name));
    if (existing && existing.id !== id) {
      throw conflict('Ya existe un producto con ese nombre.');
    }
    await tx.update(products).set({ name: body.name }).where(eq(products.id, id));
    await replaceAliases(tx, id, body.aliases);
  });
  return findProduct(id);
}

export async function deleteProduct(id: number): Promise<void> {
  const deleted = await db.delete(products).where(eq(products.id, id)).returning();
  if (deleted.length === 0) {
    throw notFound('Producto no encontrado.');
  }
}

export async function learnAlias(tx: Tx, productId: number, rawText: string): Promise<void> {
  const alias = normalizeText(rawText);
  if (!alias) {
    return;
  }
  const names = await tx.select({ name: products.name }).from(products);
  if (names.some((product) => normalizeText(product.name) === alias)) {
    return;
  }
  await tx.insert(productAliases).values({ productId, alias }).onConflictDoNothing();
}
