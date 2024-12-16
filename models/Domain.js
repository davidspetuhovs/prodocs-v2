import mongoose from "mongoose";
import toJSON from "./plugins/toJSON";

// DOMAIN SCHEMA
// Used to store custom domains that users can add to their projects
// Includes verification status and Vercel configuration for domain management
const domainSchema = mongoose.Schema(
  {
    domain: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
      index: true,
    },
    status: {
      type: String,
      enum: ["pending", "active", "error"],
      default: "pending",
      required: true,
    },
    vercelConfig: {
      type: Object,
      default: null,
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
  }
);

// add plugin that converts mongoose to json
domainSchema.plugin(toJSON);

export default mongoose.models.Domain || mongoose.model("Domain", domainSchema);
