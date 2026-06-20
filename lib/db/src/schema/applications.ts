import { pgTable, text, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const applicationsTable = pgTable("applications", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  pseudo: text("pseudo").notNull(),
  age: integer("age").notNull(),
  country: text("country").notNull(),
  whatsapp: text("whatsapp").notNull(),
  previousClan: text("previous_clan"),
  previousClanLeaveReason: text("previous_clan_leave_reason"),
  availability: text("availability").notNull(),
  reason: text("reason").notNull(),
  valueContribution: text("value_contribution").notNull(),
  respectAnswer: text("respect_answer").notNull(),
  conflictAnswer: text("conflict_answer").notNull(),
  desiredPassword: text("desired_password").notNull(),
  status: text("status").notNull().default("pending"),
  submittedAt: timestamp("submitted_at", { withTimezone: true }).notNull().defaultNow(),
  reviewedAt: timestamp("reviewed_at", { withTimezone: true }),
  reviewedBy: text("reviewed_by"),
});

export const insertApplicationSchema = createInsertSchema(applicationsTable).omit({ id: true, submittedAt: true });
export type InsertApplication = z.infer<typeof insertApplicationSchema>;
export type Application = typeof applicationsTable.$inferSelect;
