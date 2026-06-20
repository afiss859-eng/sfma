import { pgTable, text, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const groupsTable = pgTable("groups", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text("name").notNull(),
  emoji: text("emoji").notNull().default("💬"),
  description: text("description").notNull().default(""),
  writePermission: text("write_permission").notNull().default("all"),
  order: integer("order").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  lastMessageAt: timestamp("last_message_at", { withTimezone: true }),
});

export const insertGroupSchema = createInsertSchema(groupsTable).omit({ id: true, createdAt: true });
export type InsertGroup = z.infer<typeof insertGroupSchema>;
export type Group = typeof groupsTable.$inferSelect;
