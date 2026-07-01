import express from "express";
import {
  enhanceTextController,
  optimizeResumeController,
  matchUploadController,
  upload,
} from "../controllers/aiController.js";

const router = express.Router();

router.post("/enhance", enhanceTextController);
router.post("/optimize", optimizeResumeController);
router.post("/match-upload", upload.single("resume"), matchUploadController);

export default router;
