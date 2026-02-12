import express from "express";
import { 
  createVendor,
  getAllVendors,
  getVendorById,
  updateVendor,
  deleteVendor,
  getTemplates,
  createTemplate 
} from "../controllers/admin.controller.js";
import { protect, superAdminOnly } from "../middleware/auth.middleware.js";

const router = express.Router();

router.use(protect);
router.use(superAdminOnly);

// Vendor Management Routes
router.post("/create-vendor", createVendor);
router.get("/vendors", getAllVendors);
router.get("/vendors/:id", getVendorById);
router.put("/vendors/:id", updateVendor);
router.delete("/vendors/:id", deleteVendor);

// Template Routes
router.get("/templates", getTemplates);
router.post("/templates", createTemplate);

export default router;