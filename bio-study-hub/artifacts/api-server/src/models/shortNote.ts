import mongoose from "mongoose";

const shortNoteSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    content: { type: String, required: true },
    class: { type: String, enum: ["11", "12"], required: true },
    chapter: { type: String, required: true },
    subunit: { type: String, default: "" },
    order: { type: Number, default: 0 },
    published: { type: Boolean, default: false },
    bookmarkedBy: [{ type: String }],
  },
  { timestamps: true }
);

shortNoteSchema.index({ class: 1, chapter: 1 });
shortNoteSchema.index({ published: 1 });

shortNoteSchema.set("toJSON", {
  virtuals: true,
  transform: (_doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id; delete ret.__v;
    return ret;
  },
});

export const ShortNote = mongoose.model("ShortNote", shortNoteSchema);
