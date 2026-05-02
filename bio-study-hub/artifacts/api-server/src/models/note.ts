import mongoose from "mongoose";

const noteSchema = new mongoose.Schema(
  {
    user_id: { type: String, required: true },
    question_id: { type: String, required: true },
    question_text: { type: String, default: "" },
    note_text: { type: String, default: "" },
    chapter: { type: String, default: "" },
    subunit: { type: String, default: "" },
    class: { type: String, default: "" },
  },
  { timestamps: true }
);

noteSchema.index({ user_id: 1 });
noteSchema.index({ user_id: 1, chapter: 1 });
noteSchema.index({ user_id: 1, question_id: 1 }, { unique: true });

noteSchema.set("toJSON", {
  virtuals: true,
  transform: (_doc, ret) => {
    ret.id = ret._id.toString();
    ret.created_at = ret.createdAt?.toISOString?.() ?? "";
    ret.updated_at = ret.updatedAt?.toISOString?.() ?? "";
    delete ret._id;
    delete ret.__v;
    delete ret.createdAt;
    delete ret.updatedAt;
    return ret;
  },
});

export const Note = mongoose.model("Note", noteSchema);
