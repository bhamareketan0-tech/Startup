import mongoose from "mongoose";

const discussionSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    body: { type: String, required: true },
    author_name: { type: String, default: "Anonymous" },
    user_id: { type: String, required: true },
    likes: { type: Number, default: 0 },
    chapter: { type: String, default: "" },
    status: { type: String, enum: ["open", "solved", "reported", "removed"], default: "open" },
    replies_count: { type: Number, default: 0 },
  },
  { timestamps: true }
);

discussionSchema.set("toJSON", {
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

export const Discussion = mongoose.model("Discussion", discussionSchema);
