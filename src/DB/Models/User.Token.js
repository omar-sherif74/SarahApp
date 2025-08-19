import mongoose from "mongoose";

export const tokenShema = new mongoose.Schema(
  {
    jti: { type: String, required: true, unique: true },
    expiresIn: { type: Number, required: true },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export const TokenModel =
  mongoose.models.Token || mongoose.model("Token", tokenShema);
TokenModel.syncIndexes();
