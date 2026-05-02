import mongoose from "mongoose";

const badgeSchema = new mongoose.Schema({
  id: { type: String, required: true },
  name: { type: String, required: true },
  emoji: { type: String, default: "🏅" },
  description: { type: String, default: "" },
  unlockedAt: { type: String, default: "" },
}, { _id: false });

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, default: null },
    googleId: { type: String, default: null },
    avatar: { type: String, default: null },
    class: { type: String, default: "11" },
    plan: { type: String, default: "free" },
    score: { type: Number, default: 0 },
    role: { type: String, enum: ["student", "admin"], default: "student" },
    username: { type: String, default: null, sparse: true },
    xp: { type: Number, default: 0 },
    level: { type: String, default: "Beginner" },
    badges: { type: [badgeSchema], default: [] },
    lastActivity: { type: Date, default: null },
    streakCount: { type: Number, default: 0 },
    comebackBonusAwarded: { type: Boolean, default: false },
    mockTestsCompleted: { type: Number, default: 0 },
    mockPerfectScore: { type: Boolean, default: false },
  },
  { timestamps: true }
);

userSchema.index({ role: 1, createdAt: -1 });
userSchema.index({ xp: -1 });

userSchema.set("toJSON", {
  virtuals: true,
  transform: (_doc, ret) => {
    ret.id = ret._id.toString();
    ret.created_at = ret.createdAt?.toISOString?.() ?? "";
    delete ret._id;
    delete ret.__v;
    delete ret.password;
    delete ret.createdAt;
    delete ret.updatedAt;
    return ret;
  },
});

export const User = mongoose.model("User", userSchema);
