import mongoose from "mongoose";

const seenQuestionSchema = new mongoose.Schema(
  {
    user_id: { type: String, required: true },
    chapter: { type: String, required: true },
    subunit: { type: String, default: "" },
    class: { type: String, required: true },
    type: { type: String, required: true },
    seen_ids: { type: [String], default: [] },
  },
  { timestamps: true }
);

seenQuestionSchema.index({ user_id: 1, chapter: 1, subunit: 1, class: 1, type: 1 }, { unique: true });

seenQuestionSchema.set("toJSON", {
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

export const SeenQuestion = mongoose.model("SeenQuestion", seenQuestionSchema);
