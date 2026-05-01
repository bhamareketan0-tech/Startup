import { Router } from "express";
import { Question } from "../models/question";
import { User } from "../models/user";
import { Attempt } from "../models/attempt";
import { Discussion } from "../models/discussion";

const router = Router();

router.get("/stats", async (_req, res) => {
  try {
    const [questions, students, premium, discussions, attemptsByDay, typeDistRaw] = await Promise.all([
      Question.countDocuments(),
      User.countDocuments(),
      User.countDocuments({ plan: { $in: ["pro", "elite"] } }),
      Discussion.countDocuments(),
      Attempt.aggregate([
        {
          $group: {
            _id: {
              $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
            },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: -1 } },
        { $limit: 7 },
      ]),
      Question.aggregate([{ $group: { _id: "$type", count: { $sum: 1 } } }]),
    ]);

    const totalQuestions = questions || 1;
    const typeDist = typeDistRaw.map((t) => ({
      type: t._id,
      count: t.count,
      pct: Math.round((t.count / totalQuestions) * 100),
    }));

    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const dailyActivity = attemptsByDay.reverse().map((a) => ({
      day: days[new Date(a._id).getDay()],
      solved: a.count,
    }));

    res.json({ questions, students, premium, discussions, dailyActivity, typeDist });
  } catch (err: unknown) {
    res.status(500).json({ error: String(err) });
  }
});

export default router;
