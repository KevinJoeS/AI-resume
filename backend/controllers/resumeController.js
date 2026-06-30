import mongoose from "mongoose";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import Resume from "../models/Resume.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const LOCAL_DB_PATH = path.join(__dirname, "../local_db.json");

// Helper to read local json database
const readLocalDB = () => {
  try {
    if (!fs.existsSync(LOCAL_DB_PATH)) {
      return [];
    }
    const data = fs.readFileSync(LOCAL_DB_PATH, "utf8");
    return JSON.parse(data || "[]");
  } catch (error) {
    console.error("Local DB read error:", error);
    return [];
  }
};

// Helper to write local json database
const writeLocalDB = (data) => {
  try {
    fs.writeFileSync(LOCAL_DB_PATH, JSON.stringify(data, null, 2), "utf8");
  } catch (error) {
    console.error("Local DB write error:", error);
  }
};

const isConnected = () => mongoose.connection.readyState === 1;

export const createResume = async (req, res) => {
  try {
    if (isConnected()) {
      const resume = await Resume.create(req.body);
      res.status(201).json(resume);
    } else {
      const db = readLocalDB();
      const newResume = {
        ...req.body,
        _id: "local_" + Math.random().toString(36).substring(2, 11),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      db.push(newResume);
      writeLocalDB(db);
      res.status(201).json(newResume);
    }
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

export const getResumes = async (req, res) => {
  try {
    if (isConnected()) {
      const resumes = await Resume.find();
      res.status(200).json(resumes);
    } else {
      const db = readLocalDB();
      res.status(200).json(db);
    }
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

export const getResumeById = async (req, res) => {
  try {
    if (isConnected()) {
      const resume = await Resume.findById(req.params.id);
      if (!resume) {
        return res.status(404).json({
          message: "Resume not found",
        });
      }
      res.status(200).json(resume);
    } else {
      const db = readLocalDB();
      const resume = db.find(r => r._id === req.params.id);
      if (!resume) {
        return res.status(404).json({
          message: "Resume not found",
        });
      }
      res.status(200).json(resume);
    }
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

export const deleteResume = async (req, res) => {
  try {
    if (isConnected()) {
      const resume = await Resume.findByIdAndDelete(req.params.id);
      if (!resume) {
        return res.status(404).json({
          message: "Resume not found",
        });
      }
      res.status(200).json({
        message: "Resume deleted successfully",
      });
    } else {
      const db = readLocalDB();
      const index = db.findIndex(r => r._id === req.params.id);
      if (index === -1) {
        return res.status(404).json({
          message: "Resume not found",
        });
      }
      db.splice(index, 1);
      writeLocalDB(db);
      res.status(200).json({
        message: "Resume deleted successfully",
      });
    }
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

export const updateResume = async (req, res) => {
  try {
    if (isConnected()) {
      const updatedResume = await Resume.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true }
      );
      res.status(200).json(updatedResume);
    } else {
      const db = readLocalDB();
      const index = db.findIndex(r => r._id === req.params.id);
      if (index === -1) {
        return res.status(404).json({
          message: "Resume not found",
        });
      }
      const updatedResume = {
        ...db[index],
        ...req.body,
        updatedAt: new Date().toISOString()
      };
      db[index] = updatedResume;
      writeLocalDB(db);
      res.status(200).json(updatedResume);
    }
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};