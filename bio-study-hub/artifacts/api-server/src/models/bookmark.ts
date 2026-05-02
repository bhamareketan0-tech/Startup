import mongoose from "mongoose";

const bookmarkSchema = new mongoose.Schema(
  {
    user_id: { type: String, required: true },
    question_id: { type: String, required: true },
    question_text: { type: String, default: "" },
    chapter: { type: String, required: true },
    subunit: { type: String, default: "" },
    class: { type: String, required: true },
    question_type: { type: String, default: "mcq" },
    difficulty: { type: String, default: "medium" },
  },
  { timestamps: true }
);

bookmarkSchema.index({ user_id: 1 });
bookmarkSchema.index({ user_id: 1, chapter: 1 });
bookmarkSchema.index({ user_id: 1, question_id: 1 }, { unique: true });

bookmarkSchema.set("toJSON", {
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

export const Bookmark = mongoose.model("Bookmark", bookmarkSchema);
