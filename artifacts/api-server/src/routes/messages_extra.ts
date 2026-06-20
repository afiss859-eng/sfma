import { Router } from "express";
import { db, messagesTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { requireAuth, AuthRequest } from "../middlewares/auth";

const router = Router();

router.delete("/:id", requireAuth, async (req: AuthRequest, res) => {
  const [msg] = await db.select().from(messagesTable).where(eq(messagesTable.id, req.params.id)).limit(1);
  if (!msg) {
    res.status(404).json({ error: "Not found" });
    return;
  }
  const lordGrades = ["Fondateur_Suprême", "Co-Fondateur", "Lord", "Administrateur"];
  if (msg.authorId !== req.memberId && !lordGrades.includes(req.memberGrade || "")) {
    res.status(403).json({ error: "Forbidden" });
    return;
  }
  await db.delete(messagesTable).where(eq(messagesTable.id, req.params.id));
  res.json({ success: true });
});

router.post("/:id/reactions", requireAuth, async (req: AuthRequest, res) => {
  const { emoji } = req.body;
  if (!emoji) {
    res.status(400).json({ error: "emoji required" });
    return;
  }
  const [msg] = await db.select().from(messagesTable).where(eq(messagesTable.id, req.params.id)).limit(1);
  if (!msg) {
    res.status(404).json({ error: "Not found" });
    return;
  }

  const reactions: any[] = Array.isArray(msg.reactions) ? [...msg.reactions] : [];
  const existing = reactions.find((r: any) => r.emoji === emoji);
  if (existing) {
    const idx = existing.userIds.indexOf(req.memberId!);
    if (idx >= 0) {
      existing.userIds.splice(idx, 1);
      existing.count = existing.userIds.length;
      if (existing.count === 0) {
        const ri = reactions.indexOf(existing);
        reactions.splice(ri, 1);
      }
    } else {
      existing.userIds.push(req.memberId!);
      existing.count = existing.userIds.length;
    }
  } else {
    reactions.push({ emoji, count: 1, userIds: [req.memberId!] });
  }

  const [updated] = await db.update(messagesTable).set({ reactions }).where(eq(messagesTable.id, req.params.id)).returning();
  res.json({ ...updated, reactions });
});

export default router;
