import { Request, Response, NextFunction } from "express";

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const userId = (req.session as Record<string, unknown>).userId as string | undefined;
  if (!userId) {
    res.status(401).json({ error: "Authentication required." });
    return;
  }
  next();
}

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const user = (req.session as Record<string, unknown>).user as Record<string, unknown> | undefined;
  if (!user) {
    res.status(401).json({ error: "Authentication required." });
    return;
  }
  if (user["role"] !== "admin") {
    res.status(403).json({ error: "Admin access required." });
    return;
  }
  next();
}
