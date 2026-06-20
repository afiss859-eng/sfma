import { Router } from "express";
import { db, settingsTable, membersTable, messagesTable, groupsTable, auditLogTable } from "@workspace/db";
import { eq, count } from "drizzle-orm";
import { requireAuth, requireLord, AuthRequest } from "../middlewares/auth";

const router = Router();

router.get("/", async (req, res) => {
  const [s] = await db.select().from(settingsTable).limit(1);
  if (!s) {
    res.json({
      siteName: "SUPRÊME FAMILLE MUZAN AMPIROUS",
      slogan: "L'Empire du Sang et de l'Or",
      description: "Une communauté d'élite forgée dans l'ombre et la gloire.",
      logoUrl: null, backgroundImageUrl: null,
      primaryColor: "#CC0000", accentColor: "#C9A227",
      backgroundColor: "#0A0A0F", fontFamily: "Inter",
      whatsappGroupLink: null, whatsappGroupPhoto: null,
    });
    return;
  }
  res.json({
    siteName: s.siteName, slogan: s.slogan, description: s.description,
    logoUrl: s.logoUrl, backgroundImageUrl: s.backgroundImageUrl,
    primaryColor: s.primaryColor, accentColor: s.accentColor,
    backgroundColor: s.backgroundColor, fontFamily: s.fontFamily,
    whatsappGroupLink: s.whatsappGroupLink, whatsappGroupPhoto: s.whatsappGroupPhoto,
  });
});

router.patch("/", requireAuth, requireLord, async (req: AuthRequest, res) => {
  const allowed = ["siteName", "slogan", "description", "logoUrl", "backgroundImageUrl",
    "primaryColor", "accentColor", "backgroundColor", "fontFamily", "whatsappGroupLink", "whatsappGroupPhoto"];
  const updates: any = { updatedAt: new Date() };
  for (const key of allowed) {
    if (req.body[key] !== undefined) updates[key] = req.body[key];
  }

  const existing = await db.select().from(settingsTable).limit(1);
  let result: any;
  if (existing.length === 0) {
    [result] = await db.insert(settingsTable).values({ id: 1, ...updates }).returning();
  } else {
    [result] = await db.update(settingsTable).set(updates).where(eq(settingsTable.id, 1)).returning();
  }

  const actor = await db.select().from(membersTable).where(eq(membersTable.id, req.memberId!)).limit(1);
  await db.insert(auditLogTable).values({
    actorId: req.memberId!,
    actorUsername: actor[0]?.username || "Unknown",
    action: "Paramètres du site modifiés",
    targetType: "settings",
  });

  res.json(result);
});

export default router;
