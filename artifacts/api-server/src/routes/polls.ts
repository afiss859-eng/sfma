import { Router } from "express";
import { db, pollsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { requireAuth, requireLord, AuthRequest } from "../middlewares/auth";

const router = Router();

function formatPoll(poll: any, memberId?: string) {
  const options: any[] = Array.isArray(poll.options) ? poll.options : [];
  const votes: Record<string, string> = typeof poll.votes === "object" && !Array.isArray(poll.votes) ? poll.votes : {};
  const totalVotes = Object.keys(votes).length;

  const formattedOptions = options.map((opt: any) => {
    const voteCount = Object.values(votes).filter((v: any) => v === opt.id).length;
    return {
      id: opt.id,
      text: opt.text,
      votes: voteCount,
      percentage: totalVotes > 0 ? Math.round((voteCount / totalVotes) * 100) : 0,
    };
  });

  const userVotedOption = memberId ? votes[memberId] || null : null;

  return {
    id: poll.id,
    question: poll.question,
    options: formattedOptions,
    createdAt: poll.createdAt?.toISOString(),
    createdBy: poll.createdBy,
    closedAt: poll.closedAt?.toISOString() || null,
    totalVotes,
    userVotedOption,
  };
}

router.get("/", requireAuth, async (req: AuthRequest, res) => {
  const polls = await db.select().from(pollsTable).orderBy(pollsTable.createdAt);
  res.json(polls.map(p => formatPoll(p, req.memberId)));
});

router.post("/", requireAuth, requireLord, async (req: AuthRequest, res) => {
  const { question, options } = req.body;
  if (!question || !options || !Array.isArray(options) || options.length < 2) {
    res.status(400).json({ error: "question and at least 2 options required" });
    return;
  }

  const formattedOptions = options.map((text: string, i: number) => ({
    id: crypto.randomUUID(),
    text,
  }));

  const [poll] = await db.insert(pollsTable).values({
    question,
    options: formattedOptions,
    votes: {},
    createdBy: req.memberId!,
  }).returning();

  res.status(201).json(formatPoll(poll, req.memberId));
});

router.post("/:id/vote", requireAuth, async (req: AuthRequest, res) => {
  const { optionId } = req.body;
  if (!optionId) {
    res.status(400).json({ error: "optionId required" });
    return;
  }

  const [poll] = await db.select().from(pollsTable).where(eq(pollsTable.id, req.params.id)).limit(1);
  if (!poll) {
    res.status(404).json({ error: "Not found" });
    return;
  }

  const votes: Record<string, string> = typeof poll.votes === "object" && !Array.isArray(poll.votes) ? { ...poll.votes as any } : {};
  votes[req.memberId!] = optionId;

  const [updated] = await db.update(pollsTable).set({ votes }).where(eq(pollsTable.id, req.params.id)).returning();
  res.json(formatPoll(updated, req.memberId));
});

export default router;
