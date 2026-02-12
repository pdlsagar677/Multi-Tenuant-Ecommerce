import mongoose from "mongoose";

const templateSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  identifier: {
    type: String,
    required: true,
    unique: true
  },
  description: String,
  previewImage: String,
  config: {
    colors: {
      primary: { type: String, default: "#4F46E5" },
      secondary: { type: String, default: "#10B981" },
      accent: { type: String, default: "#F59E0B" }
    },
    fonts: {
      heading: { type: String, default: "Inter" },
      body: { type: String, default: "Inter" }
    },
    layout: {
      homepage: { type: String, default: "grid" },
      productPage: { type: String, default: "standard" }
    }
  },
  isActive: {
    type: Boolean,
    default: true
  }
});

export default mongoose.model("Template", templateSchema);