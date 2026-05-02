import mongoose from "mongoose";

const quoteSchema = new mongoose.Schema(
  {
    text: { type: String, required: true },
    author: { type: String, default: "" },
    category: {
      type: String,
      enum: ["morning", "evening", "exam", "general"],
      default: "general",
    },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

quoteSchema.index({ category: 1, active: 1 });

quoteSchema.set("toJSON", {
  virtuals: true,
  transform: (_doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id; delete ret.__v;
    return ret;
  },
});

export const Quote = mongoose.model("Quote", quoteSchema);
