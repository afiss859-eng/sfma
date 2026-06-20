import { Router } from "express";
import { db, galleryTable, auditLogTable, membersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { requireAuth, requireLord, AuthRequest } from "../middlewares/auth";

const router = Router();

function formatPhoto(p: any) {
  return {
    id: p.id,
    url: p.url,
    caption: p.caption || null,
    submittedBy: p.submittedBy,
    status: p.status,
    submittedAt: p.submittedAt?.toISOString(),
    approvedAt: p.approvedAt?.toISOString() || null,
  };
}

router.get("/", async (req, res) => {
  const photos = await db.select().from(galleryTable).where(eq(galleryTable.status, "approved"));
  res.json(photos.map(formatPhoto));
});

router.post("/", requireAuth, async (req: AuthRequest, res) => {
  const { url, caption } = req.body;
  if (!url) {
    res.status(400).json({ error: "url required" });
    return;
  }
  const [photo] = await db.insert(galleryTable).values({
    url, caption: caption || null,
    submittedBy: req.memberId!, status: "pending",
  }).returning();
  res.status(201).json(formatPhoto(photo));
});

router.post("/:id/approve", requireAuth, requireLord, async (req: AuthRequest, res) => {
  const [photo] = await db.update(galleryTable).set({
    status: "approved", approvedAt: new Date(),
  }).where(eq(galleryTable.id, req.params.id)).returning();

  if (!photo) {
    res.status(404).json({ error: "Not found" });
    return;
  }

  const actor = await db.select().from(membersTable).where(eq(membersTable.id, req.memberId!)).limit(1);
  await db.insert(auditLogTable).values({
    actorId: req.memberId!,
    actorUsername: actor[0]?.username || "Unknown",
    action: "Photo approuvée",
    targetType: "gallery",
    targetId: photo.id,
  });

  res.json(formatPhoto(photo));
});

export default router;
