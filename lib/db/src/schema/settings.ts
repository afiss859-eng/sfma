import { pgTable, text, integer, timestamp } from "drizzle-orm/pg-core";

export const settingsTable = pgTable("settings", {
  id: integer("id").primaryKey().default(1),
  siteName: text("site_name").notNull().default("SUPRÊME FAMILLE MUZAN AMPIROUS"),
  slogan: text("slogan").notNull().default("L'Empire du Sang et de l'Or"),
  description: text("description").notNull().default("Une communauté d'élite forgée dans l'ombre et la gloire. SFMA — où les légendes naissent."),
  logoUrl: text("logo_url"),
  backgroundImageUrl: text("background_image_url"),
  primaryColor: text("primary_color").notNull().default("#CC0000"),
  accentColor: text("accent_color").notNull().default("#C9A227"),
  backgroundColor: text("background_color").notNull().default("#0A0A0F"),
  fontFamily: text("font_family").notNull().default("Inter"),
  whatsappGroupLink: text("whatsapp_group_link"),
  whatsappGroupPhoto: text("whatsapp_group_photo"),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export type Settings = typeof settingsTable.$inferSelect;
