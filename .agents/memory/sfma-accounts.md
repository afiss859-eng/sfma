---
name: SFMA official accounts
description: Les 11 comptes officiels SFMA et comment le seed fonctionne
---

Fondateur_SFMA / MFA-0001 / sfma2026 / Fondateur_Suprême
Lord_Muzan→Lord_Eclipse (MFA-0002..0011) / sfma2026 / Lord

**Why:** Le seed s'exécute au démarrage du serveur API (artifacts/api-server/src/index.ts → seedDatabase()). Il supprime les anciens comptes de test et upsert les 11 officiels.

**How to apply:** Si les mots de passe doivent changer, modifier artifacts/api-server/src/seed.ts et redémarrer le workflow API Server.
