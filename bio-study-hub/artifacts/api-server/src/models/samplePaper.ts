import mongoose from "mongoose";

const samplePaperSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true },
    title: { type: String, default: "" },
    config: {
      classes: [{ type: String }],
      chapters: [{ type: String }],
      totalQuestions: { type: Number, default: 90 },
      difficulty: {
        easy: { type: Number, default: 20 },
        medium: { type: Number, default: 60 },
        hard: { type: Number, default: 20 },
      },
      includePYQ: { type: Boolean, default: false },
    },
    questionIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "Question" }],
    attempted: { type: Boolean, default: false },
    score: { type: Number, default: 0 },
    timeTaken: { type: Number, default: 0 },
  },
  { timestamps: true }
);

samplePaperSchema.index({ userId: 1, createdAt: -1 });

samplePaperSchema.set("toJSON", {
  virtuals: true,
  transform: (_doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id; delete ret.__v;
    return ret;
  },
});

export const SamplePaper = mongoose.model("SamplePaper", samplePaperSchema);
