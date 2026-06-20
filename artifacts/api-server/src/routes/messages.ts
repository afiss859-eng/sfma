import { Router } from "express";
import { db, messagesTable, membersTable, groupsTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import { requireAuth, AuthRequest } from "../middlewares/auth";
import { formatMember } from "./auth";

const GRADE_EMOJIS: Record<string, string> = {
  "Fondateur_Suprême": "👑",
  "Co-Fondateur": "⚜️",
  "Lord": "⚔️",
  "Administrateur": "🛡️",
  "Recruteur": "🎖️",
  "Modérateur": "⭐",
  "Membre_Élite": "🔥",
  "Membre": "👤",
  "Nouveau_Membre": "🌱",
};

const router = Router({ mergeParams: true });

async function formatMessage(msg: any) {
  const [author] = await db.select().from(membersTable).where(eq(membersTable.id, msg.authorId)).limit(1);
  let replyTo = null;
  if (msg.replyToId) {
    const [reply] = await db.select().from(messagesTable).where(eq(messagesTable.id, msg.replyToId)).limit(1);
    if (reply) {
      const [replyAuthor] = await db.select().from(membersTable).where(eq(membersTable.id, reply.authorId)).limit(1);
      replyTo = {
        id: reply.id,
        content: reply.content,
        authorUsername: replyAuthor?.username || "Inconnu",
      };
    }
  }
  return {
    id: msg.id,
    groupId: msg.groupId,
    content: msg.content,
    author: author ? formatMember(author) : { id: msg.authorId, username: "Inconnu", grade: "Membre", gradeEmoji: "👤", memberId: "MFA-0000", reputation: 0, joinedAt: new Date().toISOString(), isBanned: false, badges: [] },
    replyTo,
    reactions: Array.isArray(msg.reactions) ? msg.reactions : [],
    mentions: Array.isArray(msg.mentions) ? msg.mentions : [],
    createdAt: msg.createdAt?.toISOString(),
  };
}

router.get("/:id/messages", async (req, res) => {
  const messages = await db.select().from(messagesTable)
    .where(eq(messagesTable.groupId, req.params.id))
    .orderBy(desc(messagesTable.createdAt))
    .limit(50);
  const formatted = await Promise.all(messages.reverse().map(formatMessage));
  res.json(formatted);
});

router.post("/:id/messages", requireAuth, async (req: AuthRequest, res) => {
  const { content, replyToId, mentions } = req.body;
  if (!content) {
    res.status(400).json({ error: "content required" });
    return;
  }

  // Check write permission
  const [group] = await db.select().from(groupsTable).where(eq(groupsTable.id, req.params.id)).limit(1);
  if (!group) {
    res.status(404).json({ error: "Group not found" });
    return;
  }
  const lordGrades = ["Fondateur_Suprême", "Co-Fondateur", "Lord", "Administrateur"];
  const memberGrade = req.memberGrade || "";
  if (group.writePermission === "lords_only" && !lordGrades.includes(memberGrade)) {
    res.status(403).json({ error: "Seuls les Lords peuvent écrire ici" });
    return;
  }

  const [msg] = await db.insert(messagesTable).values({
    groupId: req.params.id,
    authorId: req.memberId!,
    content,
    replyToId: replyToId || null,
    reactions: [],
    mentions: mentions || [],
  }).returning();

  // Update group lastMessageAt & member reputation
  await db.update(groupsTable).set({ lastMessageAt: new Date() }).where(eq(groupsTable.id, req.params.id));
  await db.update(membersTable).set({ reputation: req.body.reputation ?? undefined }).where(eq(membersTable.id, req.memberId!));
  // Increment reputation by 1
  const [m] = await db.select().from(membersTable).where(eq(membersTable.id, req.memberId!)).limit(1);
  if (m) {
    await db.update(membersTable).set({ reputation: m.reputation + 1 }).where(eq(membersTable.id, req.memberId!));
  }

  const formatted = await formatMessage(msg);
  res.status(201).json(formatted);
});

export default router;
