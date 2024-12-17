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
    domain: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Domain",
      required: false // Making domain optional
    }
  },
  {
    timestamps: true,
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

const Company = mongoose.models.Company || mongoose.model("Company", companySchema);

export default Company;
