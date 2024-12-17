import mongoose from "mongoose";
import toJSON from "./plugins/toJSON";

const sectionSchema = mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    content: {
      type: String,
      required: true,
    },
    order: {
      type: Number,
      default: 0,
    }
  },
  {
    _id: true,
    timestamps: true
  }
);

const documentationSchema = mongoose.Schema(
  {
    title: {
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
    status: {
      type: String,
      enum: ['draft', 'published'],
      default: 'draft',
    },
    sections: [sectionSchema],
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
      required: true,
      index: true
    },
    creator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    }
  },
  {
    timestamps: true,
  }
);

// Add toJSON plugin
documentationSchema.plugin(toJSON);
sectionSchema.plugin(toJSON);

// Create compound index for company and slug to ensure unique slugs within a company
documentationSchema.index({ company: 1, slug: 1 }, { unique: true });

const Documentation = mongoose.models.Documentation || mongoose.model('Documentation', documentationSchema);

export default Documentation;
