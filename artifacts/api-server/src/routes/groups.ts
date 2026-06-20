import { Router } from "express";
import { db, groupsTable, messagesTable, auditLogTable, membersTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import { requireAuth, requireLord, AuthRequest } from "../middlewares/auth";

const router = Router();

router.get("/", async (req, res) => {
  const groups = await db.select().from(groupsTable).orderBy(groupsTable.order);
  res.json(groups.map(g => ({
    id: g.id,
    name: g.name,
    emoji: g.emoji,
    description: g.description,
    writePermission: g.writePermission,
    order: g.order,
    lastMessageAt: g.lastMessageAt?.toISOString() || null,
    memberCount: 0,
  })));
});

router.post("/", requireAuth, requireLord, async (req: AuthRequest, res) => {
  const { name, emoji, description, writePermission, order } = req.body;
  if (!name) {
    res.status(400).json({ error: "name required" });
    return;
  }
  const [group] = await db.insert(groupsTable).values({
    name,
    emoji: emoji || "💬",
    description: description || "",
    writePermission: writePermission || "all",
    order: order ?? 99,
  }).returning();

  const actor = await db.select().from(membersTable).where(eq(membersTable.id, req.memberId!)).limit(1);
  await db.insert(auditLogTable).values({
    actorId: req.memberId!,
    actorUsername: actor[0]?.username || "Unknown",
    action: "Groupe créé",
    targetType: "group",
    targetId: group.id,
    targetName: group.name,
  });

  res.status(201).json({
    id: group.id, name: group.name, emoji: group.emoji,
    description: group.description, writePermission: group.writePermission,
    order: group.order, lastMessageAt: null, memberCount: 0,
  });
});

router.get("/:id", async (req, res) => {
  const [group] = await db.select().from(groupsTable).where(eq(groupsTable.id, req.params.id)).limit(1);
  if (!group) {
    res.status(404).json({ error: "Not found" });
    return;
  }
  res.json({
    id: group.id, name: group.name, emoji: group.emoji,
    description: group.description, writePermission: group.writePermission,
    order: group.order, lastMessageAt: group.lastMessageAt?.toISOString() || null, memberCount: 0,
  });
});

router.patch("/:id", requireAuth, requireLord, async (req: AuthRequest, res) => {
  const { name, emoji, description, writePermission, order } = req.body;
  const updates: any = {};
  if (name !== undefined) updates.name = name;
  if (emoji !== undefined) updates.emoji = emoji;
  if (description !== undefined) updates.description = description;
  if (writePermission !== undefined) updates.writePermission = writePermission;
  if (order !== undefined) updates.order = order;

  const [updated] = await db.update(groupsTable).set(updates).where(eq(groupsTable.id, req.params.id)).returning();
  if (!updated) {
    res.status(404).json({ error: "Not found" });
    return;
  }
  res.json({
    id: updated.id, name: updated.name, emoji: updated.emoji,
    description: updated.description, writePermission: updated.writePermission,
    order: updated.order, lastMessageAt: updated.lastMessageAt?.toISOString() || null, memberCount: 0,
  });
});

router.delete("/:id", requireAuth, requireLord, async (req: AuthRequest, res) => {
  const [deleted] = await db.delete(groupsTable).where(eq(groupsTable.id, req.params.id)).returning();
  if (!deleted) {
    res.status(404).json({ error: "Not found" });
    return;
  }
  const actor = await db.select().from(membersTable).where(eq(membersTable.id, req.memberId!)).limit(1);
  await db.insert(auditLogTable).values({
    actorId: req.memberId!,
    actorUsername: actor[0]?.username || "Unknown",
    action: "Groupe supprimé",
    targetType: "group",
    targetId: req.params.id,
    targetName: deleted.name,
  });
  res.json({ success: true });
});

export default router;
