import mongoose from "mongoose";

const INTERVALS = [1, 3, 7, 21];

const spacedRepSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true },
    questionId: { type: mongoose.Schema.Types.ObjectId, ref: "Question", required: true },
    wrongCount: { type: Number, default: 0 },
    correctStreak: { type: Number, default: 0 },
    intervalIndex: { type: Number, default: 0 },
    nextReviewDate: { type: Date, required: true },
    mastered: { type: Boolean, default: false },
    lastAttemptDate: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

spacedRepSchema.index({ userId: 1, nextReviewDate: 1, mastered: 1 });
spacedRepSchema.index({ userId: 1, questionId: 1 }, { unique: true });

spacedRepSchema.statics.scheduleReview = function (userId: string, questionId: string, correct: boolean) {
  return this.findOneAndUpdate(
    { userId, questionId },
    { $setOnInsert: { userId, questionId, nextReviewDate: new Date() } },
    { upsert: true, new: true }
  ).then((doc: any) => {
    if (correct) {
      doc.correctStreak += 1;
      if (doc.correctStreak >= 3) {
        doc.mastered = true;
      } else {
        const idx = Math.min(doc.intervalIndex + 1, INTERVALS.length - 1);
        doc.intervalIndex = idx;
        const next = new Date();
        next.setDate(next.getDate() + INTERVALS[idx]);
        doc.nextReviewDate = next;
      }
    } else {
      doc.wrongCount += 1;
      doc.correctStreak = 0;
      const idx = Math.min(doc.wrongCount - 1, INTERVALS.length - 1);
      doc.intervalIndex = idx;
      const next = new Date();
      next.setDate(next.getDate() + INTERVALS[idx]);
      doc.nextReviewDate = next;
      doc.mastered = false;
    }
    doc.lastAttemptDate = new Date();
    return doc.save();
  });
};

spacedRepSchema.set("toJSON", {
  virtuals: true,
  transform: (_doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id; delete ret.__v;
    return ret;
  },
});

export const SpacedRep = mongoose.model("SpacedRep", spacedRepSchema);
