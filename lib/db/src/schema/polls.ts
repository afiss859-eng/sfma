import { pgTable, text, jsonb, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const pollsTable = pgTable("polls", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  question: text("question").notNull(),
  options: jsonb("options").notNull().default([]),
  votes: jsonb("votes").notNull().default({}),
  createdBy: text("created_by").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  closedAt: timestamp("closed_at", { withTimezone: true }),
});

export const insertPollSchema = createInsertSchema(pollsTable).omit({ id: true, createdAt: true });
export type InsertPoll = z.infer<typeof insertPollSchema>;
export type Poll = typeof pollsTable.$inferSelect;
