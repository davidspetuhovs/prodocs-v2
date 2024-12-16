import mongoose from "mongoose";
import toJSON from "./plugins/toJSON";

const companySchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    logo: {
      type: String,
      trim: true,
    },
    users: [{
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
      role: {
        type: String,
        enum: ["owner", "admin", "member"],
        default: "member",
        required: true,
      }
    }],
    settings: {
      type: Object,
      default: {},
    },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
  }
);

// Virtual for domains
companySchema.virtual('domains', {
  ref: 'Domain',
  localField: '_id',
  foreignField: 'company'
});

// Add plugin that converts mongoose to json
companySchema.plugin(toJSON);

// Create indexes
companySchema.index({ slug: 1 });
companySchema.index({ "users.user": 1 });

export default mongoose.models.Company || mongoose.model("Company", companySchema);
