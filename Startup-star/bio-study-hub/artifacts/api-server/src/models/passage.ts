import mongoose, { Schema } from "mongoose";

const PassageSchema = new Schema(
  {
    title: { type: String, required: true },
    body: { type: String, required: true },
    chapter: { type: String, required: true },
    class: { type: String, enum: ["11", "12"], required: true },
    status: { type: String, enum: ["active", "draft"], default: "active" },
  },
  { timestamps: true }
);

PassageSchema.set("toJSON", {
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

export const Passage = mongoose.model("Passage", PassageSchema);
