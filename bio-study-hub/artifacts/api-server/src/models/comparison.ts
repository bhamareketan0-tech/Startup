import mongoose from "mongoose";

const comparisonSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    class: { type: String, enum: ["11", "12", "both"], default: "both" },
    chapter: { type: String, required: true },
    headers: [{ type: String }],
    rows: [[{ type: String }]],
    published: { type: Boolean, default: false },
    bookmarkedBy: [{ type: String }],
  },
  { timestamps: true }
);

comparisonSchema.index({ class: 1, chapter: 1 });
comparisonSchema.index({ published: 1 });

comparisonSchema.set("toJSON", {
  virtuals: true,
  transform: (_doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id; delete ret.__v;
    return ret;
  },
});

export const Comparison = mongoose.model("Comparison", comparisonSchema);
