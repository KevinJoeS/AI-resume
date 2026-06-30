import express from "express";
import {
  enhanceTextController,
  optimizeResumeController,
} from "../controllers/aiController.js";

const router = express.Router();

router.post("/enhance", enhanceTextController);
router.post("/optimize", optimizeResumeController);

export default router;
