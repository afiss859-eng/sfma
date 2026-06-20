import { pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const galleryTable = pgTable("gallery", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  url: text("url").notNull(),
  caption: text("caption"),
  submittedBy: text("submitted_by").notNull(),
  status: text("status").notNull().default("pending"),
  submittedAt: timestamp("submitted_at", { withTimezone: true }).notNull().defaultNow(),
  approvedAt: timestamp("approved_at", { withTimezone: true }),
});

export const insertGallerySchema = createInsertSchema(galleryTable).omit({ id: true, submittedAt: true });
export type InsertGallery = z.infer<typeof insertGallerySchema>;
export type GalleryPhoto = typeof galleryTable.$inferSelect;
