import { Router } from "express";
import { db, applicationsTable, membersTable, groupsTable, messagesTable, auditLogTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { requireAuth, requireLord, AuthRequest } from "../middlewares/auth";
import bcrypt from "bcryptjs";

const router = Router();

let memberCounter = 12; // Start after the 11 initial accounts

async function getNextMemberId(): Promise<string> {
  const count = await db.select().from(membersTable);
  const num = count.length + 1;
  return `MFA-${String(num).padStart(4, "0")}`;
}

router.get("/", requireAuth, requireLord, async (req, res) => {
  const apps = await db.select().from(applicationsTable).orderBy(applicationsTable.submittedAt);
  res.json(apps.map(a => ({
    ...a,
    submittedAt: a.submittedAt?.toISOString(),
    reviewedAt: a.reviewedAt?.toISOString() || null,
  })));
});

router.post("/", async (req, res) => {
  const { pseudo, age, country, whatsapp, previousClan, previousClanLeaveReason,
    availability, reason, valueContribution, respectAnswer, conflictAnswer, desiredPassword } = req.body;

  if (!pseudo || !age || !country || !whatsapp || !availability || !reason ||
    !valueContribution || !respectAnswer || !conflictAnswer || !desiredPassword) {
    res.status(400).json({ error: "Tous les champs requis" });
    return;
  }

  const [app] = await db.insert(applicationsTable).values({
    pseudo, age: Number(age), country, whatsapp, previousClan,
    previousClanLeaveReason, availability, reason, valueContribution,
    respectAnswer, conflictAnswer, desiredPassword, status: "pending",
  }).returning();

  // Notify in Recrutement group
  const [recruGroup] = await db.select().from(groupsTable).where(eq(groupsTable.name, "Recrutement")).limit(1);
  if (recruGroup) {
    const [sysUser] = await db.select().from(membersTable).where(eq(membersTable.username, "Fondateur_SFMA")).limit(1);
    if (sysUser) {
      await db.insert(messagesTable).values({
        groupId: recruGroup.id,
        authorId: sysUser.id,
        content: `📋 Nouvelle candidature de **${pseudo}** (${country}, ${age} ans). Disponibilité: ${availability}`,
        reactions: [], mentions: [],
      });
    }
  }

  res.status(201).json({
    ...app,
    submittedAt: app.submittedAt?.toISOString(),
    reviewedAt: null,
  });
});

router.post("/:id/accept", requireAuth, requireLord, async (req: AuthRequest, res) => {
  const [app] = await db.select().from(applicationsTable).where(eq(applicationsTable.id, req.params.id)).limit(1);
  if (!app || app.status !== "pending") {
    res.status(404).json({ error: "Not found or already processed" });
    return;
  }

  const [updated] = await db.update(applicationsTable).set({
    status: "accepted",
    reviewedAt: new Date(),
    reviewedBy: req.memberId,
  }).where(eq(applicationsTable.id, req.params.id)).returning();

  // Create member account
  const passwordHash = await bcrypt.hash(app.desiredPassword, 10);
  const memberId = await getNextMemberId();
  await db.insert(membersTable).values({
    username: app.pseudo,
    passwordHash,
    grade: "Nouveau_Membre",
    memberId,
    country: app.country,
    whatsapp: app.whatsapp,
    reputation: 0,
    isBanned: false,
  });

  // Audit log
  const actor = await db.select().from(membersTable).where(eq(membersTable.id, req.memberId!)).limit(1);
  await db.insert(auditLogTable).values({
    actorId: req.memberId!,
    actorUsername: actor[0]?.username || "Unknown",
    action: "Candidature acceptée → compte créé",
    targetType: "application",
    targetId: app.id,
    targetName: app.pseudo,
  });

  res.json({ ...updated, submittedAt: updated.submittedAt?.toISOString(), reviewedAt: updated.reviewedAt?.toISOString() || null });
});

router.post("/:id/reject", requireAuth, requireLord, async (req: AuthRequest, res) => {
  const [app] = await db.select().from(applicationsTable).where(eq(applicationsTable.id, req.params.id)).limit(1);
  if (!app || app.status !== "pending") {
    res.status(404).json({ error: "Not found or already processed" });
    return;
  }

  const [updated] = await db.update(applicationsTable).set({
    status: "rejected",
    reviewedAt: new Date(),
    reviewedBy: req.memberId,
  }).where(eq(applicationsTable.id, req.params.id)).returning();

  const actor = await db.select().from(membersTable).where(eq(membersTable.id, req.memberId!)).limit(1);
  await db.insert(auditLogTable).values({
    actorId: req.memberId!,
    actorUsername: actor[0]?.username || "Unknown",
    action: "Candidature refusée",
    targetType: "application",
    targetId: app.id,
    targetName: app.pseudo,
  });

  res.json({ ...updated, submittedAt: updated.submittedAt?.toISOString(), reviewedAt: updated.reviewedAt?.toISOString() || null });
});

export default router;
