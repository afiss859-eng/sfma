import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { db, membersTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const JWT_SECRET = process.env.SESSION_SECRET || "sfma-secret-2026";

export interface AuthRequest extends Request {
  memberId?: string;
  memberGrade?: string;
}

export function generateToken(memberId: string, grade: string): string {
  return jwt.sign({ memberId, grade }, JWT_SECRET, { expiresIn: "30d" });
}

export async function requireAuth(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }
  const token = authHeader.slice(7);
  try {
    const payload = jwt.verify(token, JWT_SECRET) as { memberId: string; grade: string };
    req.memberId = payload.memberId;
    req.memberGrade = payload.grade;
    next();
  } catch {
    res.status(401).json({ error: "Invalid token" });
  }
}

export function requireLord(req: AuthRequest, res: Response, next: NextFunction) {
  const lordGrades = ["Fondateur_Suprême", "Co-Fondateur", "Lord", "Administrateur"];
  if (!req.memberGrade || !lordGrades.includes(req.memberGrade)) {
    res.status(403).json({ error: "Forbidden — Lords only" });
    return;
  }
  next();
}

export function requireFounder(req: AuthRequest, res: Response, next: NextFunction) {
  if (req.memberGrade !== "Fondateur_Suprême") {
    res.status(403).json({ error: "Forbidden — Fondateur only" });
    return;
  }
  next();
}

export async function optionalAuth(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith("Bearer ")) {
    const token = authHeader.slice(7);
    try {
      const payload = jwt.verify(token, JWT_SECRET) as { memberId: string; grade: string };
      req.memberId = payload.memberId;
      req.memberGrade = payload.grade;
    } catch {
      // ignore
    }
  }
  next();
}
