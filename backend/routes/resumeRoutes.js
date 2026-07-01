import express from "express";

import {
  createResume,
  getResumes,
  getResumeById,
  deleteResume,
  updateResume,
} from "../controllers/resumeController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect);

router.post("/", createResume);
router.get("/", getResumes);
router.get("/:id", getResumeById);
router.delete("/:id", deleteResume);
router.put("/:id", updateResume);

export default router;
