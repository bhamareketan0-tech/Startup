import mongoose from "mongoose";

const questionAttemptSchema = new mongoose.Schema(
  {
    user_id: { type: String, required: true },
    question_id: { type: String, required: true },
    question_text: { type: String, default: "" },
    chapter: { type: String, default: "" },
    subunit: { type: String, default: "" },
    class: { type: String, default: "" },
    question_type: { type: String, default: "mcq" },
    difficulty: { type: String, default: "medium" },
    is_correct: { type: Boolean, required: true },
    user_answer: { type: String, default: "" },
    correct_answer: { type: String, default: "" },
    consecutive_correct: { type: Number, default: 0 },
    mastered: { type: Boolean, default: false },
  },
  { timestamps: true }
);

questionAttemptSchema.index({ user_id: 1 });
questionAttemptSchema.index({ user_id: 1, question_id: 1 });
questionAttemptSchema.index({ user_id: 1, chapter: 1 });
questionAttemptSchema.index({ user_id: 1, is_correct: 1 });
questionAttemptSchema.index({ user_id: 1, mastered: 1 });

questionAttemptSchema.set("toJSON", {
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

export const QuestionAttempt = mongoose.model("QuestionAttempt", questionAttemptSchema);
