import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const membersTable = pgTable("members", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  username: text("username").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  grade: text("grade").notNull().default("Nouveau_Membre"),
  memberId: text("member_id").notNull().unique(),
  country: text("country"),
  whatsapp: text("whatsapp"),
  avatarUrl: text("avatar_url"),
  bio: text("bio"),
  reputation: integer("reputation").notNull().default(0),
  isBanned: boolean("is_banned").notNull().default(false),
  joinedAt: timestamp("joined_at", { withTimezone: true }).notNull().defaultNow(),
  lastSeenAt: timestamp("last_seen_at", { withTimezone: true }),
});

export const insertMemberSchema = createInsertSchema(membersTable).omit({ id: true, joinedAt: true, lastSeenAt: true });
export type InsertMember = z.infer<typeof insertMemberSchema>;
export type Member = typeof membersTable.$inferSelect;
