import { pgTable, text, serial, integer, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  price: integer("price").notNull(), // in Korean Won
  originalPrice: integer("original_price"), // in Korean Won
  rating: real("rating").notNull().default(0),
  imageUrl: text("image_url").notNull(),
  category: text("category").notNull(),
  badge: text("badge"), // e.g., "🔥 인기", "⚡ 빠른배송", etc.
  purchaseLinks: text("purchase_links").array().notNull(), // JSON array of purchase links
  isActive: integer("is_active").notNull().default(1), // 1 for active, 0 for inactive
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertProductSchema = createInsertSchema(products).omit({
  id: true,
});

export const updateProductSchema = createInsertSchema(products).omit({
  id: true,
}).partial();

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type Product = typeof products.$inferSelect;
export type InsertProduct = z.infer<typeof insertProductSchema>;
export type UpdateProduct = z.infer<typeof updateProductSchema>;
