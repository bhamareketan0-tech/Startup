import mongoose from "mongoose";

const labelSchema = new mongoose.Schema({
  id: String,
  text: String,
  revealText: String,
  x: Number,
  y: Number,
}, { _id: false });

const memoryPalaceSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    class: { type: String, enum: ["11", "12", "both"], default: "both" },
    chapter: { type: String, required: true },
    subunit: { type: String, default: "" },
    imageUrl: { type: String, required: true },
    labels: [labelSchema],
    published: { type: Boolean, default: false },
  },
  { timestamps: true }
);

memoryPalaceSchema.index({ class: 1, chapter: 1 });

memoryPalaceSchema.set("toJSON", {
  virtuals: true,
  transform: (_doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id; delete ret.__v;
    return ret;
  },
});

export const MemoryPalace = mongoose.model("MemoryPalace", memoryPalaceSchema);
