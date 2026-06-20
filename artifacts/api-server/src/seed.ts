import { db, membersTable, groupsTable, settingsTable } from "@workspace/db";
import { eq, notInArray } from "drizzle-orm";
import bcrypt from "bcryptjs";

const OFFICIAL_MEMBERS = [
  { username: "Fondateur_SFMA", password: "sfma2026", grade: "Fondateur_Suprême", memberId: "MFA-0001", country: "France", bio: "Le fondateur de l'empire SFMA." },
  { username: "Lord_Muzan",    password: "sfma2026", grade: "Lord", memberId: "MFA-0002", country: "France", bio: "Seigneur de l'empire." },
  { username: "Lord_Crimson",  password: "sfma2026", grade: "Lord", memberId: "MFA-0003", country: "France", bio: "Seigneur de l'empire." },
  { username: "Lord_Shadow",   password: "sfma2026", grade: "Lord", memberId: "MFA-0004", country: "France", bio: "Seigneur de l'empire." },
  { username: "Lord_Tenebre",  password: "sfma2026", grade: "Lord", memberId: "MFA-0005", country: "France", bio: "Seigneur de l'empire." },
  { username: "Lord_Sang",     password: "sfma2026", grade: "Lord", memberId: "MFA-0006", country: "France", bio: "Seigneur de l'empire." },
  { username: "Lord_Abysse",   password: "sfma2026", grade: "Lord", memberId: "MFA-0007", country: "France", bio: "Seigneur de l'empire." },
  { username: "Lord_Onyx",     password: "sfma2026", grade: "Lord", memberId: "MFA-0008", country: "France", bio: "Seigneur de l'empire." },
  { username: "Lord_Spectre",  password: "sfma2026", grade: "Lord", memberId: "MFA-0009", country: "France", bio: "Seigneur de l'empire." },
  { username: "Lord_Vortex",   password: "sfma2026", grade: "Lord", memberId: "MFA-0010", country: "France", bio: "Seigneur de l'empire." },
  { username: "Lord_Eclipse",  password: "sfma2026", grade: "Lord", memberId: "MFA-0011", country: "France", bio: "Seigneur de l'empire." },
];

const OFFICIAL_USERNAMES = OFFICIAL_MEMBERS.map(m => m.username);
const OFFICIAL_MEMBER_IDS = OFFICIAL_MEMBERS.map(m => m.memberId);

export async function seedDatabase() {
  console.log("🌱 Seeding SFMA database...");

  // ── 1. Remove old test accounts that don't match the official list ──────────
  const allMembers = await db.select({ username: membersTable.username, memberId: membersTable.memberId })
    .from(membersTable);

  const testUsernames = ["Fondateur_SFMA_old", "LordShadow", "LordKairo", "LordNova", "AdminZara",
    "RecruteurMax", "ModStar", "EliteAsh", "MuzonBest", "NoviceKai", "EliteRyu"];
  const oldTestIds = ["MFA-0002", "MFA-0003", "MFA-0004"]; // old lord accounts from previous seed that had different usernames

  // Delete anyone NOT in the official list AND whose memberId clashes with official ones
  for (const m of allMembers) {
    if (!OFFICIAL_USERNAMES.includes(m.username) && testUsernames.includes(m.username)) {
      await db.delete(membersTable).where(eq(membersTable.username, m.username));
      console.log(`  🗑️  Removed old test account: ${m.username}`);
    }
  }

  // ── 2. Upsert each official member ─────────────────────────────────────────
  for (const m of OFFICIAL_MEMBERS) {
    const passwordHash = await bcrypt.hash(m.password, 10);
    const existing = await db.select().from(membersTable)
      .where(eq(membersTable.username, m.username)).limit(1);

    if (existing.length > 0) {
      // Update password hash, grade, memberId to match spec
      await db.update(membersTable).set({
        passwordHash,
        grade: m.grade,
        memberId: m.memberId,
        country: m.country,
        bio: m.bio,
      }).where(eq(membersTable.username, m.username));
      console.log(`  ✏️  Updated: ${m.username} (${m.grade})`);
    } else {
      // Check if memberId already taken by someone else
      const conflictId = await db.select().from(membersTable)
        .where(eq(membersTable.memberId, m.memberId)).limit(1);
      if (conflictId.length > 0 && conflictId[0].username !== m.username) {
        // Reassign the old member's memberId so we can take this one
        const newId = `MFA-${String(Date.now()).slice(-6)}`;
        await db.update(membersTable).set({ memberId: newId })
          .where(eq(membersTable.memberId, m.memberId));
        console.log(`  ↔️  Reassigned memberId ${m.memberId} from ${conflictId[0].username} → ${newId}`);
      }
      await db.insert(membersTable).values({
        username: m.username,
        passwordHash,
        grade: m.grade,
        memberId: m.memberId,
        country: m.country,
        bio: m.bio,
        reputation: 0,
        isBanned: false,
      });
      console.log(`  ✓  Created: ${m.username} (${m.grade})`);
    }
  }

  // ── 3. Groups ───────────────────────────────────────────────────────────────
  const existingGroups = await db.select().from(groupsTable).limit(1);
  if (existingGroups.length === 0) {
    const groups = [
      { name: "Annonces",   emoji: "📢", description: "Annonces officielles du clan",       writePermission: "lords_only", order: 1 },
      { name: "Général",    emoji: "💬", description: "Discussion générale",                 writePermission: "all",        order: 2 },
      { name: "Stratégie",  emoji: "⚔️", description: "Tactiques et stratégies de guerre",  writePermission: "all",        order: 3 },
      { name: "Recrutement",emoji: "🎖️", description: "Suivi des candidatures",             writePermission: "lords_only", order: 4 },
      { name: "Lords",      emoji: "👑", description: "Canal réservé aux Lords",            writePermission: "lords_only", order: 5 },
      { name: "Hors-jeu",   emoji: "🎮", description: "Discussion détente",                 writePermission: "all",        order: 6 },
    ];
    for (const g of groups) {
      await db.insert(groupsTable).values(g as any);
      console.log(`  ✓  Group: ${g.emoji} ${g.name}`);
    }
  }

  // ── 4. Settings ─────────────────────────────────────────────────────────────
  const existingSettings = await db.select().from(settingsTable).limit(1);
  if (existingSettings.length === 0) {
    await db.insert(settingsTable).values({
      id: 1,
      siteName: "SUPRÊME FAMILLE MUZAN AMPIROUS",
      slogan: "L'Empire du Sang et de l'Or",
      description: "Une communauté d'élite forgée dans l'ombre et la gloire.",
      primaryColor: "#CC0000",
      accentColor: "#C9A227",
      backgroundColor: "#0A0A0F",
      fontFamily: "Cinzel, Inter",
    });
    console.log("  ✓  Settings");
  }

  console.log("🏆 Seed done! Official accounts ready.");
}
