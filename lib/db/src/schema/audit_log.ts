import { pgTable, text, timestamp } from "drizzle-orm/pg-core";

export const auditLogTable = pgTable("audit_log", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  actorId: text("actor_id").notNull(),
  actorUsername: text("actor_username").notNull(),
  action: text("action").notNull(),
  targetType: text("target_type").notNull(),
  targetId: text("target_id"),
  targetName: text("target_name"),
  details: text("details"),
  timestamp: timestamp("timestamp", { withTimezone: true }).notNull().defaultNow(),
});

export type AuditEntry = typeof auditLogTable.$inferSelect;
