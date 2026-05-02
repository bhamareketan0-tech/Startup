import mongoose from "mongoose";

const questionSchema = new mongoose.Schema(
  {
    question: { type: String, required: true },
    option1: { type: String, default: "" },
    option2: { type: String, default: "" },
    option3: { type: String, default: "" },
    option4: { type: String, default: "" },
    correct: { type: String, default: "option1" },
    subject: { type: String, default: "Biology" },
    chapter: { type: String, required: true },
    subunit: { type: String, default: "" },
    class: { type: String, required: true },
    type: { type: String, default: "mcq" },
    difficulty: { type: String, default: "medium" },
    explanation: { type: String, default: "" },
    is_active: { type: Boolean, default: true },
    meta: { type: mongoose.Schema.Types.Mixed, default: null },
  },
  { timestamps: true }
);

questionSchema.index({ class: 1, is_active: 1 });
questionSchema.index({ chapter: 1, is_active: 1 });
questionSchema.index({ chapter: 1, subunit: 1, is_active: 1 });
questionSchema.index({ difficulty: 1 });
questionSchema.index({ subject: 1, is_active: 1 });
questionSchema.index({ createdAt: -1 });

questionSchema.set("toJSON", {
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

export const Question = mongoose.model("Question", questionSchema);
