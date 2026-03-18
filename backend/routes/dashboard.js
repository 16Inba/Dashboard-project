import express from "express";
import { getDashboardData, getDashboardConfig, saveDashboardConfig } from "../controllers/dashboardController.js";

const router = express.Router();

router.get("/dashboard-data", getDashboardData);
router.get("/dashboard-config", getDashboardConfig);
router.post("/dashboard-config", saveDashboardConfig);

export default router;
