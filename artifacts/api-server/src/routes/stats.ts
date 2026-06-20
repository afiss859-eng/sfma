import { Router } from "express";
import { db, membersTable, messagesTable, eventsTable, applicationsTable, auditLogTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import { requireAuth } from "../middlewares/auth";

const router = Router();

router.get("/", requireAuth, async (req, res) => {
  const members = await db.select().from(membersTable).where(eq(membersTable.isBanned, false));
  const messages = await db.select().from(messagesTable);
  const events = await db.select().from(eventsTable);
  const pendingApps = await db.select().from(applicationsTable).where(eq(applicationsTable.status, "pending"));

  const gradeOrder = ["Fondateur_Suprême", "Co-Fondateur", "Lord", "Administrateur", "Recruteur", "Modérateur", "Membre_Élite", "Membre", "Nouveau_Membre"];
  const gradeCounts: Record<string, number> = {};
  for (const m of members) {
    gradeCounts[m.grade] = (gradeCounts[m.grade] || 0) + 1;
  }

  const gradeDistribution = gradeOrder
    .filter(g => gradeCounts[g] > 0)
    .map(g => ({ grade: g, count: gradeCounts[g] }));

  const recentJoins = [...members]
    .sort((a, b) => new Date(b.joinedAt).getTime() - new Date(a.joinedAt).getTime())
    .slice(0, 5)
    .map(m => ({
      id: m.id, username: m.username, grade: m.grade,
      gradeEmoji: { "Fondateur_Suprême": "👑", "Co-Fondateur": "⚜️", "Lord": "⚔️", "Administrateur": "🛡️", "Recruteur": "🎖️", "Modérateur": "⭐", "Membre_Élite": "🔥", "Membre": "👤", "Nouveau_Membre": "🌱" }[m.grade] || "👤",
      memberId: m.memberId, country: m.country, whatsapp: m.whatsapp, avatarUrl: m.avatarUrl,
      bio: m.bio, reputation: m.reputation, joinedAt: m.joinedAt?.toISOString(), isBanned: m.isBanned, badges: [],
    }));

  res.json({
    totalMembers: members.length,
    activeMembers: members.length,
    totalMessages: messages.length,
    totalEvents: events.length,
    pendingApplications: pendingApps.length,
    gradeDistribution,
    recentJoins,
  });
});

router.get("/audit", requireAuth, async (req, res) => {
  const logs = await db.select().from(auditLogTable).orderBy(desc(auditLogTable.timestamp)).limit(100);
  res.json(logs.map(l => ({
    id: l.id, actorUsername: l.actorUsername, action: l.action,
    targetType: l.targetType, targetId: l.targetId, targetName: l.targetName,
    details: l.details, timestamp: l.timestamp?.toISOString(),
  })));
});

export default router;
