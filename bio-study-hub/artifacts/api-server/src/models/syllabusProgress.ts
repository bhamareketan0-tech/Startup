import mongoose from "mongoose";

const syllabusProgressSchema = new mongoose.Schema(
  {
    user_id: { type: String, required: true },
    class: { type: String, required: true },
    chapter: { type: String, required: true },
    subunit: { type: String, required: true },
    studied: { type: Boolean, default: false },
  },
  { timestamps: true }
);

syllabusProgressSchema.index({ user_id: 1 });
syllabusProgressSchema.index({ user_id: 1, class: 1 });
syllabusProgressSchema.index({ user_id: 1, chapter: 1 });
syllabusProgressSchema.index({ user_id: 1, class: 1, chapter: 1, subunit: 1 }, { unique: true });

syllabusProgressSchema.set("toJSON", {
  virtuals: true,
  transform: (_doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
    delete ret.createdAt;
    delete ret.updatedAt;
    return ret;
  },
});

export const SyllabusProgress = mongoose.model("SyllabusProgress", syllabusProgressSchema);
