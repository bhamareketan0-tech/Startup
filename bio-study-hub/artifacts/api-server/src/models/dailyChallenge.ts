import mongoose from "mongoose";

const dailyChallengeSchema = new mongoose.Schema(
  {
    date: { type: String, required: true, unique: true },
    question_ids: [{ type: String }],
  },
  { timestamps: true }
);
// ❌ removed: dailyChallengeSchema.index({ date: 1 }) — duplicate of unique:true

const userDailyChallengeSchema = new mongoose.Schema(
  {
    user_id: { type: String, required: true },
    date: { type: String, required: true },
    score: { type: Number, default: 0 },
    correct: { type: Number, default: 0 },
    wrong: { type: Number, default: 0 },
    answers: { type: mongoose.Schema.Types.Mixed, default: {} },
    completed: { type: Boolean, default: false },
  },
  { timestamps: true }
);

userDailyChallengeSchema.index({ user_id: 1, date: 1 }, { unique: true });
userDailyChallengeSchema.index({ user_id: 1, completed: 1 });

userDailyChallengeSchema.set("toJSON", {
  virtuals: true,
  transform: (_doc, ret) => {
    ret.id = ret._id.toString(); // ✅ fixed corrupted line
    ret.created_at = ret.createdAt?.toISOString?.() ?? "";
    delete ret._id;
    delete ret.__v;
    delete ret.createdAt;
    delete ret.updatedAt;
    return ret;
  },
});

export const DailyChallenge = mongoose.model("DailyChallenge", dailyChallengeSchema);
export const UserDailyChallenge = mongoose.model("UserDailyChallenge", userDailyChallengeSchema);
