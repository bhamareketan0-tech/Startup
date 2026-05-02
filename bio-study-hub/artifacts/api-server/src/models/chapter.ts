import mongoose from "mongoose";

const chapterSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    name: { type: String, required: true },
    subject: { type: String, default: "Biology" },
    class: { type: String, required: true },
    subunits: { type: [String], default: [] },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

chapterSchema.index({ class: 1, order: 1 });

chapterSchema.set("toJSON", {
  virtuals: false,
  transform: (_doc, ret) => {
    delete ret._id;
    delete ret.__v;
    delete ret.createdAt;
    delete ret.updatedAt;
    return ret;
  },
});

export const Chapter = mongoose.model("Chapter", chapterSchema);
