import { Router } from "express";
import { db, eventsTable, membersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { requireAuth, requireLord, AuthRequest } from "../middlewares/auth";

const router = Router();

function formatEvent(ev: any, memberId?: string) {
  const participants: string[] = Array.isArray(ev.participants) ? ev.participants : [];
  return {
    id: ev.id,
    title: ev.title,
    description: ev.description,
    location: ev.location || null,
    eventDate: ev.eventDate,
    createdBy: ev.createdBy,
    participantCount: participants.length,
    isParticipating: memberId ? participants.includes(memberId) : false,
    participants,
  };
}

router.get("/", requireAuth, async (req: AuthRequest, res) => {
  const events = await db.select().from(eventsTable).orderBy(eventsTable.eventDate);
  res.json(events.map(e => formatEvent(e, req.memberId)));
});

router.post("/", requireAuth, requireLord, async (req: AuthRequest, res) => {
  const { title, description, location, eventDate } = req.body;
  if (!title || !description || !eventDate) {
    res.status(400).json({ error: "title, description, eventDate required" });
    return;
  }

  const [ev] = await db.insert(eventsTable).values({
    title, description, location: location || null,
    eventDate, createdBy: req.memberId!, participants: [],
  }).returning();

  res.status(201).json(formatEvent(ev, req.memberId));
});

router.post("/:id/rsvp", requireAuth, async (req: AuthRequest, res) => {
  const [ev] = await db.select().from(eventsTable).where(eq(eventsTable.id, req.params.id)).limit(1);
  if (!ev) {
    res.status(404).json({ error: "Not found" });
    return;
  }

  const participants: string[] = Array.isArray(ev.participants) ? [...ev.participants] : [];
  const idx = participants.indexOf(req.memberId!);
  if (idx >= 0) {
    participants.splice(idx, 1);
  } else {
    participants.push(req.memberId!);
  }

  const [updated] = await db.update(eventsTable).set({ participants }).where(eq(eventsTable.id, req.params.id)).returning();
  res.json(formatEvent(updated, req.memberId));
});

export default router;
