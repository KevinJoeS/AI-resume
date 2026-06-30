import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import User from "../models/User.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const LOCAL_USERS_PATH = path.join(__dirname, "../local_users.json");
const JWT_SECRET = process.env.JWT_SECRET || "ai_resume_builder_super_secret_key_2024";
const JWT_EXPIRES_IN = "30d";

// --- Local DB helpers ---
const readLocalUsers = () => {
  try {
    if (!fs.existsSync(LOCAL_USERS_PATH)) return [];
    return JSON.parse(fs.readFileSync(LOCAL_USERS_PATH, "utf8") || "[]");
  } catch {
    return [];
  }
};

const writeLocalUsers = (users) => {
  fs.writeFileSync(LOCAL_USERS_PATH, JSON.stringify(users, null, 2), "utf8");
};

const isConnected = () => mongoose.connection.readyState === 1;

// Generate signed JWT
const signToken = (user) =>
  jwt.sign(
    { id: user._id, email: user.email, fullName: user.fullName },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );

// ─── Register ────────────────────────────────────────────────────────────────
export const register = async (req, res) => {
  const { fullName, email, password } = req.body;

  if (!fullName || !email || !password) {
    return res.status(400).json({ message: "Please provide name, email and password." });
  }
  if (password.length < 6) {
    return res.status(400).json({ message: "Password must be at least 6 characters." });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 12);

    if (isConnected()) {
      // --- MongoDB mode ---
      const existing = await User.findOne({ email: email.toLowerCase() });
      if (existing) {
        return res.status(400).json({ message: "An account with this email already exists." });
      }
      const user = await User.create({ fullName, email: email.toLowerCase(), password: hashedPassword });
      const token = signToken(user);
      return res.status(201).json({
        token,
        user: { _id: user._id, fullName: user.fullName, email: user.email },
      });
    } else {
      // --- Local file fallback mode ---
      const users = readLocalUsers();
      const existing = users.find((u) => u.email === email.toLowerCase());
      if (existing) {
        return res.status(400).json({ message: "An account with this email already exists." });
      }
      const newUser = {
        _id: "local_user_" + Math.random().toString(36).substring(2, 11),
        fullName,
        email: email.toLowerCase(),
        password: hashedPassword,
        createdAt: new Date().toISOString(),
      };
      users.push(newUser);
      writeLocalUsers(users);
      const token = signToken(newUser);
      return res.status(201).json({
        token,
        user: { _id: newUser._id, fullName: newUser.fullName, email: newUser.email },
      });
    }
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({ message: error.message });
  }
};

// ─── Login ────────────────────────────────────────────────────────────────────
export const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Please provide email and password." });
  }

  try {
    if (isConnected()) {
      // --- MongoDB mode ---
      const user = await User.findOne({ email: email.toLowerCase() }).select("+password");
      if (!user) {
        return res.status(401).json({ message: "Invalid email or password." });
      }
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(401).json({ message: "Invalid email or password." });
      }
      const token = signToken(user);
      return res.status(200).json({
        token,
        user: { _id: user._id, fullName: user.fullName, email: user.email },
      });
    } else {
      // --- Local file fallback mode ---
      const users = readLocalUsers();
      const user = users.find((u) => u.email === email.toLowerCase());
      if (!user) {
        return res.status(401).json({ message: "Invalid email or password." });
      }
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(401).json({ message: "Invalid email or password." });
      }
      const token = signToken(user);
      return res.status(200).json({
        token,
        user: { _id: user._id, fullName: user.fullName, email: user.email },
      });
    }
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: error.message });
  }
};

// ─── Get Logged-in User (Protected) ──────────────────────────────────────────
export const getMe = async (req, res) => {
  res.status(200).json({
    user: { _id: req.user._id, fullName: req.user.fullName, email: req.user.email },
  });
};
