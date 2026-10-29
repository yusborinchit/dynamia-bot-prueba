import { relations } from 'drizzle-orm';
import {
  boolean,
  index,
  integer,
  numeric,
  pgEnum,
  pgTable,
  serial,
  text,
  timestamp,
  unique,
} from 'drizzle-orm/pg-core';

const createdAt = () => timestamp({ withTimezone: true }).notNull().defaultNow();

export const unitEnum = pgEnum('unit', ['crate', 'bag', 'kg', 'unit', 'bunch', 'dozen']);
export const confidenceEnum = pgEnum('confidence', ['high', 'medium', 'low']);
export const messageKindEnum = pgEnum('message_kind', ['text', 'media']);
export const batchStatusEnum = pgEnum('batch_status', ['processing', 'done']);
export const orderStatusEnum = pgEnum('order_status', [
  'processing',
  'draft',
  'failed',
  'approved',
]);

export const users = pgTable('users', {
  id: serial().primaryKey(),
  email: text().notNull().unique(),
  passwordHash: text().notNull(),
  createdAt: createdAt(),
});

export const authTokens = pgTable('auth_tokens', {
  id: serial().primaryKey(),
  userId: integer()
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  tokenHash: text().notNull().unique(),
  createdAt: createdAt(),
});

export const waAuthState = pgTable('wa_auth_state', {
  key: text().primaryKey(),
  value: text().notNull(),
});

export const buyers = pgTable('buyers', {
  id: serial().primaryKey(),
  waJid: text().notNull().unique(),
  phone: text(),
  waName: text(),
  displayName: text(),
  createdAt: createdAt(),
});

export const batches = pgTable('batches', {
  id: serial().primaryKey(),
  status: batchStatusEnum().notNull().default('processing'),
  createdAt: createdAt(),
  finishedAt: timestamp({ withTimezone: true }),
});

export const messages = pgTable(
  'messages',
  {
    id: serial().primaryKey(),
    waMessageId: text().notNull().unique(),
    buyerId: integer()
      .notNull()
      .references(() => buyers.id),
    kind: messageKindEnum().notNull(),
    body: text(),
    quotedBody: text(),
    sentAt: timestamp({ withTimezone: true }).notNull(),
    deletedAt: timestamp({ withTimezone: true }),
    batchId: integer().references(() => batches.id),
    createdAt: createdAt(),
  },
  (table) => [index().on(table.batchId, table.buyerId)],
);

export const products = pgTable('products', {
  id: serial().primaryKey(),
  name: text().notNull().unique(),
  createdAt: createdAt(),
});

export const productAliases = pgTable('product_aliases', {
  id: serial().primaryKey(),
  productId: integer()
    .notNull()
    .references(() => products.id, { onDelete: 'cascade' }),
  alias: text().notNull().unique(),
});

export const orders = pgTable(
  'orders',
  {
    id: serial().primaryKey(),
    batchId: integer()
      .notNull()
      .references(() => batches.id),
    buyerId: integer()
      .notNull()
      .references(() => buyers.id),
    status: orderStatusEnum().notNull().default('processing'),
    hasUnprocessedMedia: boolean().notNull().default(false),
    error: text(),
    approvedAt: timestamp({ withTimezone: true }),
    approvedBy: integer().references(() => users.id),
    createdAt: createdAt(),
  },
  (table) => [unique().on(table.batchId, table.buyerId)],
);

export const orderItems = pgTable('order_items', {
  id: serial().primaryKey(),
  orderId: integer()
    .notNull()
    .references(() => orders.id, { onDelete: 'cascade' }),
  productId: integer().references(() => products.id, { onDelete: 'set null' }),
  rawText: text().notNull(),
  quantity: numeric({ precision: 10, scale: 2, mode: 'number' }).notNull(),
  unit: unitEnum().notNull(),
  confidence: confidenceEnum(),
});

export const productsRelations = relations(products, ({ many }) => ({
  aliases: many(productAliases),
}));

export const productAliasesRelations = relations(productAliases, ({ one }) => ({
  product: one(products, { fields: [productAliases.productId], references: [products.id] }),
}));

export const ordersRelations = relations(orders, ({ one, many }) => ({
  buyer: one(buyers, { fields: [orders.buyerId], references: [buyers.id] }),
  items: many(orderItems),
}));

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, { fields: [orderItems.orderId], references: [orders.id] }),
  product: one(products, { fields: [orderItems.productId], references: [products.id] }),
}));

export const buyersRelations = relations(buyers, ({ many }) => ({
  orders: many(orders),
}));
