import { Router } from "express";
import { db, membersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { generateToken, requireAuth, AuthRequest } from "../middlewares/auth";
import { LoginBody } from "@workspace/api-zod";
import bcrypt from "bcryptjs";

const router = Router();

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

function formatMember(m: any) {
  return {
    id: m.id,
    username: m.username,
    grade: m.grade,
    gradeEmoji: GRADE_EMOJIS[m.grade] || "👤",
    memberId: m.memberId,
    country: m.country,
    whatsapp: m.whatsapp,
    avatarUrl: m.avatarUrl,
    bio: m.bio,
    reputation: m.reputation,
    joinedAt: m.joinedAt?.toISOString(),
    isBanned: m.isBanned,
    badges: [],
  };
}

router.post("/login", async (req, res) => {
  const parsed = LoginBody.safeParse(req.body) as { success: boolean; data: { username: string; password: string } };
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid request" });
    return;
  }
  const { username, password } = parsed.data;

  const [member] = await db.select().from(membersTable).where(eq(membersTable.username, username)).limit(1);
  if (!member || member.isBanned) {
    res.status(401).json({ error: "Invalid credentials" });
    return;
  }

  const valid = await bcrypt.compare(password, member.passwordHash);
  if (!valid) {
    res.status(401).json({ error: "Invalid credentials" });
    return;
  }

  // Update last seen
  await db.update(membersTable).set({ lastSeenAt: new Date() }).where(eq(membersTable.id, member.id));

  const token = generateToken(member.id, member.grade);
  res.json({ member: formatMember(member), token });
});

router.post("/logout", (req, res) => {
  res.json({ success: true });
});

router.get("/me", requireAuth, async (req: AuthRequest, res) => {
  const [member] = await db.select().from(membersTable).where(eq(membersTable.id, req.memberId!)).limit(1);
  if (!member) {
    res.status(401).json({ error: "Not found" });
    return;
  }
  res.json(formatMember(member));
});

export { formatMember };
export default router;
