import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import User from "../models/User.js";

const JWT_SECRET = process.env.JWT_SECRET || "ai_resume_builder_super_secret_key_2024";
const JWT_EXPIRES_IN = "30d";

const isConnected = () => mongoose.connection.readyState === 1;
const requireDatabase = (res) => {
  if (isConnected()) return true;

  res.status(503).json({
    message: "Database is not connected. Please check MONGO_URI and restart the backend.",
  });
  return false;
};

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
    if (!requireDatabase(res)) return;

    const hashedPassword = await bcrypt.hash(password, 12);

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
    if (!requireDatabase(res)) return;

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
