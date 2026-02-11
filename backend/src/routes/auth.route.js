import express from "express";
import {  signup ,login } from "../controllers/auth.controller.js";

const router = express.Router();
router.post("/admin-signup", signup);

router.post("/admin-login", login);

export default router;
