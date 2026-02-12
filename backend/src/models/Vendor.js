import mongoose from "mongoose";

const vendorSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true
    },
    subdomain: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    template: {
      type: String,
      enum: ["modern-blue", "dark-tech", "minimal-white"],
      default: "modern-blue"
    },
    theme: {
      primaryColor: { type: String, default: "#4F46E5" },
      secondaryColor: { type: String, default: "#10B981" },
      accentColor: { type: String, default: "#F59E0B" },
      fontFamily: { type: String, default: "Inter" },
      logo: { type: String, default: "/default-logo.png" },
      bannerImage: { type: String, default: "/default-banner.jpg" },
      bannerText: { type: String, default: "Welcome to our store!" }
    },
    storeUrl: {
      type: String,
      required: true
    },
    isActive: {
      type: Boolean,
      default: true
    },
    settings: {
      currency: { type: String, default: "USD" },
      language: { type: String, default: "en" },
      taxRate: { type: Number, default: 0 },
      shippingCost: { type: Number, default: 0 }
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    }
  },
  { timestamps: true }
);

export default mongoose.model("Vendor", vendorSchema);