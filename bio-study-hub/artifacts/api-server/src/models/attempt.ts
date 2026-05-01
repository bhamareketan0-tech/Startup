import mongoose from "mongoose";

const attemptSchema = new mongoose.Schema(
  {
    user_id: { type: String, required: true },
    chapter: { type: String, required: true },
    subunit: { type: String, default: "" },
    class: { type: String, required: true },
    score: { type: Number, default: 0 },
    correct: { type: Number, default: 0 },
    wrong: { type: Number, default: 0 },
    skipped: { type: Number, default: 0 },
    total: { type: Number, default: 0 },
    time_taken: { type: Number, default: 0 },
  },
  { timestamps: true }
);

attemptSchema.set("toJSON", {
  virtuals: true,
  transform: (_doc, ret) => {
    ret.id = ret._id.toString();
    ret.created_at = ret.createdAt?.toISOString?.() ?? "";
    delete ret._id;
    delete ret.__v;
    delete ret.createdAt;
    delete ret.updatedAt;
    return ret;
  },
});

export const Attempt = mongoose.model("Attempt", attemptSchema);
