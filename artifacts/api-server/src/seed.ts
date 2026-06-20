import { db, membersTable, groupsTable, settingsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";

export async function seedDatabase() {
  console.log("🌱 Seeding SFMA database...");

  const existing = await db.select().from(membersTable).where(eq(membersTable.username, "Fondateur_SFMA")).limit(1);
  if (existing.length > 0) {
    console.log("✅ Already seeded — skipping members");
  } else {
    const members = [
      { username: "Fondateur_SFMA", password: "founder2026!", grade: "Fondateur_Suprême", memberId: "MFA-0001", country: "France", bio: "Le fondateur de l'empire SFMA." },
      { username: "LordShadow", password: "lord1234!", grade: "Lord", memberId: "MFA-0002", country: "France", bio: "Gardien de l'ombre." },
      { username: "LordKairo", password: "lord1234!", grade: "Lord", memberId: "MFA-0003", country: "Maroc", bio: "Stratège du clan." },
      { username: "LordNova", password: "lord1234!", grade: "Lord", memberId: "MFA-0004", country: "Belgique", bio: "Vétéran des guerres de clan." },
      { username: "AdminZara", password: "admin1234!", grade: "Administrateur", memberId: "MFA-0005", country: "Tunisie", bio: "Gestionnaire du clan." },
      { username: "RecruteurMax", password: "recru1234!", grade: "Recruteur", memberId: "MFA-0006", country: "Suisse", bio: "Je chasse les talents." },
      { username: "ModStar", password: "mod1234!", grade: "Modérateur", memberId: "MFA-0007", country: "France", bio: "Gardien de la paix." },
      { username: "EliteAsh", password: "elite1234!", grade: "Membre_Élite", memberId: "MFA-0008", country: "Canada", bio: "Élite du clan." },
      { username: "MuzonBest", password: "membre1234!", grade: "Membre", memberId: "MFA-0009", country: "Algérie", bio: "Fier membre de SFMA." },
      { username: "NoviceKai", password: "novice1234!", grade: "Nouveau_Membre", memberId: "MFA-0010", country: "France", bio: "Nouveau dans l'empire." },
      { username: "EliteRyu", password: "elite1234!", grade: "Membre_Élite", memberId: "MFA-0011", country: "Côte d'Ivoire", bio: "Combattant de l'élite." },
    ];

    for (const m of members) {
      const passwordHash = await bcrypt.hash(m.password, 10);
      await db.insert(membersTable).values({
        username: m.username,
        passwordHash,
        grade: m.grade,
        memberId: m.memberId,
        country: m.country,
        bio: m.bio,
        reputation: Math.floor(Math.random() * 500),
        isBanned: false,
      });
      console.log(`  ✓ ${m.username} (${m.grade})`);
    }
  }

  const existingGroups = await db.select().from(groupsTable).limit(1);
  if (existingGroups.length === 0) {
    const groups = [
      { name: "Annonces", emoji: "📢", description: "Annonces officielles du clan", writePermission: "lords_only", order: 1 },
      { name: "Général", emoji: "💬", description: "Discussion générale", writePermission: "all", order: 2 },
      { name: "Stratégie", emoji: "⚔️", description: "Tactiques et stratégies de guerre", writePermission: "all", order: 3 },
      { name: "Recrutement", emoji: "🎖️", description: "Suivi des candidatures", writePermission: "lords_only", order: 4 },
      { name: "Lords", emoji: "👑", description: "Canal réservé aux Lords", writePermission: "lords_only", order: 5 },
      { name: "Hors-jeu", emoji: "🎮", description: "Discussion détente", writePermission: "all", order: 6 },
    ];
    for (const g of groups) {
      await db.insert(groupsTable).values(g as any);
      console.log(`  ✓ Group: ${g.emoji} ${g.name}`);
    }
  }

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
    console.log("  ✓ Settings");
  }

  console.log("🏆 Seed done!");
}
