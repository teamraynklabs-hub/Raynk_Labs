import mongoose from "mongoose";

const NavbarItemSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    path: {
      type: String,
      required: true,
      trim: true,
    },

    order: {
      type: Number,
      default: 0,
    },

    isVisible: {
      type: Boolean,
      default: true,
    },

    isDropdown: {
      type: Boolean,
      default: false,
    },

    parentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "NavbarItem",
      default: null,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

NavbarItemSchema.index({ order: 1, isActive: 1 });

export default mongoose.models.NavbarItem ||
  mongoose.model("NavbarItem", NavbarItemSchema);
