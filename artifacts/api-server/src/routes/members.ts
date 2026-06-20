import { Router } from "express";
import { db, membersTable, auditLogTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { requireAuth, requireLord, AuthRequest } from "../middlewares/auth";
import { formatMember } from "./auth";

const router = Router();

router.get("/", async (req, res) => {
  const members = await db.select().from(membersTable).where(eq(membersTable.isBanned, false));
  res.json(members.map(formatMember));
});

router.get("/:id", async (req, res) => {
  const [member] = await db.select().from(membersTable).where(eq(membersTable.id, req.params.id)).limit(1);
  if (!member) {
    res.status(404).json({ error: "Not found" });
    return;
  }
  res.json(formatMember(member));
});

router.patch("/:id", requireAuth, requireLord, async (req: AuthRequest, res) => {
  const { grade, bio, country } = req.body;
  const updates: any = {};
  if (grade !== undefined) updates.grade = grade;
  if (bio !== undefined) updates.bio = bio;
  if (country !== undefined) updates.country = country;

  const [updated] = await db.update(membersTable).set(updates).where(eq(membersTable.id, req.params.id)).returning();
  if (!updated) {
    res.status(404).json({ error: "Not found" });
    return;
  }

  // Log action
  const actor = await db.select().from(membersTable).where(eq(membersTable.id, req.memberId!)).limit(1);
  if (grade) {
    await db.insert(auditLogTable).values({
      actorId: req.memberId!,
      actorUsername: actor[0]?.username || "Unknown",
      action: `Grade changé → ${grade}`,
      targetType: "member",
      targetId: req.params.id,
      targetName: updated.username,
    });
  }

  res.json(formatMember(updated));
});

router.post("/:id/ban", requireAuth, requireLord, async (req: AuthRequest, res) => {
  const [banned] = await db.update(membersTable).set({ isBanned: true }).where(eq(membersTable.id, req.params.id)).returning();
  if (!banned) {
    res.status(404).json({ error: "Not found" });
    return;
  }
  const actor = await db.select().from(membersTable).where(eq(membersTable.id, req.memberId!)).limit(1);
  await db.insert(auditLogTable).values({
    actorId: req.memberId!,
    actorUsername: actor[0]?.username || "Unknown",
    action: "Membre banni",
    targetType: "member",
    targetId: req.params.id,
    targetName: banned.username,
  });
  res.json({ success: true });
});

router.post("/:id/avatar", requireAuth, async (req: AuthRequest, res) => {
  const { avatarUrl } = req.body;
  if (!avatarUrl) {
    res.status(400).json({ error: "avatarUrl required" });
    return;
  }
  const [updated] = await db.update(membersTable).set({ avatarUrl }).where(eq(membersTable.id, req.params.id)).returning();
  if (!updated) {
    res.status(404).json({ error: "Not found" });
    return;
  }
  res.json(formatMember(updated));
});

export default router;
