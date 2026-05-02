import mongoose from "mongoose";

const flashcardSchema = new mongoose.Schema(
  {
    front: { type: String, required: true },
    back: { type: String, required: true },
    frontImage: { type: String, default: "" },
    backImage: { type: String, default: "" },
    class: { type: String, enum: ["11", "12"], required: true },
    chapter: { type: String, required: true },
    subunit: { type: String, default: "" },
    order: { type: Number, default: 0 },
    published: { type: Boolean, default: false },
  },
  { timestamps: true }
);

flashcardSchema.index({ class: 1, chapter: 1 });
flashcardSchema.index({ published: 1 });

flashcardSchema.set("toJSON", {
  virtuals: true,
  transform: (_doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id; delete ret.__v;
    return ret;
  },
});

export const Flashcard = mongoose.model("Flashcard", flashcardSchema);
