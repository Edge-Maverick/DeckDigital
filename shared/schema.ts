import { pgTable, text, serial, integer, json, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User model
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  gems: integer("gems").default(1000).notNull(),
  lastDailyReward: timestamp("last_daily_reward"),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

// Card model
export const cards = pgTable("cards", {
  id: serial("id").primaryKey(),
  cardId: text("card_id").notNull().unique(),
  name: text("name").notNull(),
  number: text("number").notNull(),
  image: text("image").notNull(),
  type: text("type").notNull(),
  rarity: text("rarity").notNull(),
  set: text("set").notNull(),
  description: text("description"),
  releaseDate: text("release_date"),
  abilities: json("abilities").$type<{
    name: string;
    damage?: string;
    description?: string;
  }[]>(),
});

export const insertCardSchema = createInsertSchema(cards).pick({
  cardId: true,
  name: true,
  number: true,
  image: true,
  type: true,
  rarity: true,
  set: true,
  description: true,
  releaseDate: true,
  abilities: true,
});

// Collection model (user owns cards)
export const collection = pgTable("collection", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  cardId: integer("card_id").notNull().references(() => cards.id),
  dateAcquired: timestamp("date_acquired").defaultNow().notNull(),
  isFavorite: boolean("is_favorite").default(false).notNull(),
});

export const insertCollectionSchema = createInsertSchema(collection).pick({
  userId: true,
  cardId: true,
  isFavorite: true,
});

// Pack model
export const packs = pgTable("packs", {
  id: serial("id").primaryKey(),
  packId: text("pack_id").notNull().unique(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  price: integer("price").notNull(),
  image: text("image").notNull(),
  cardsPerPack: integer("cards_per_pack").default(5).notNull(),
});

export const insertPackSchema = createInsertSchema(packs).pick({
  packId: true,
  name: true,
  description: true,
  price: true,
  image: true,
  cardsPerPack: true,
});

// User pack inventory
export const packInventory = pgTable("pack_inventory", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  packId: integer("pack_id").notNull().references(() => packs.id),
  quantity: integer("quantity").default(0).notNull(),
});

export const insertPackInventorySchema = createInsertSchema(packInventory).pick({
  userId: true,
  packId: true,
  quantity: true,
});

// Types based on the schemas
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertCard = z.infer<typeof insertCardSchema>;
export type Card = typeof cards.$inferSelect;

export type InsertCollection = z.infer<typeof insertCollectionSchema>;
export type Collection = typeof collection.$inferSelect;

export type InsertPack = z.infer<typeof insertPackSchema>;
export type Pack = typeof packs.$inferSelect;

export type InsertPackInventory = z.infer<typeof insertPackInventorySchema>;
export type PackInventory = typeof packInventory.$inferSelect;
