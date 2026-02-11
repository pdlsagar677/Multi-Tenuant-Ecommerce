import express from "express";
import { createAdmin } from "../controllers/admin.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

// Protect route — only Super Admin
router.post("/create", protect, createAdmin);

export default router;
