import { pgTable, text, jsonb, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const messagesTable = pgTable("messages", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  groupId: text("group_id").notNull(),
  authorId: text("author_id").notNull(),
  content: text("content").notNull(),
  replyToId: text("reply_to_id"),
  reactions: jsonb("reactions").default([]),
  mentions: jsonb("mentions").default([]),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertMessageSchema = createInsertSchema(messagesTable).omit({ id: true, createdAt: true });
export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type Message = typeof messagesTable.$inferSelect;
