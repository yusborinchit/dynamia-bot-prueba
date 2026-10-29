import { db, sql } from '#/db/client';
import { productAliases, products } from '#/db/schema';
import { normalizeText } from '#/lib/text';

const CATALOG: Record<string, string[]> = {
  'Tomate redondo': ['tomate', 'tomates'],
  'Tomate perita': ['perita', 'tomate pera'],
  'Tomate cherry': ['cherry'],
  'Papa blanca': ['papa', 'papas'],
  'Papa negra': ['negra'],
  Boniato: ['boniatos', 'batata'],
  Cebolla: ['cebollas'],
  'Cebolla colorada': ['colorada', 'cebolla morada'],
  Zanahoria: ['zanahorias', 'zana'],
  Zapallo: ['zapallos', 'calabaza'],
  Zapallito: ['zapallitos', 'zuchini', 'zucchini'],
  'Morrón rojo': ['morron', 'morrones', 'morron rojo'],
  'Morrón verde': ['morron verde'],
  Lechuga: ['lechugas'],
  Acelga: [],
  Espinaca: [],
  Ajo: ['ajos'],
  Limón: ['limon', 'limones'],
  Naranja: ['naranjas'],
  Manzana: ['manzanas'],
  Banana: ['bananas'],
};

for (const [name, aliases] of Object.entries(CATALOG)) {
  const [product] = await db
    .insert(products)
    .values({ name })
    .onConflictDoUpdate({ target: products.name, set: { name } })
    .returning({ id: products.id });
  if (!product || aliases.length === 0) {
    continue;
  }
  await db
    .insert(productAliases)
    .values(aliases.map((alias) => ({ productId: product.id, alias: normalizeText(alias) })))
    .onConflictDoNothing();
}

console.info(`Catálogo cargado: ${Object.keys(CATALOG).length} productos.`);
await sql.end();
