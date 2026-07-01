import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import User from "../models/User.js";

const JWT_SECRET = process.env.JWT_SECRET || "ai_resume_builder_super_secret_key_2024";

export const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return res.status(401).json({ message: "Not authorized, no token provided." });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({
        message: "Database is not connected. Please check MONGO_URI and restart the backend.",
      });
    }

    req.user = await User.findById(decoded.id).select("-password");
    if (!req.user) {
      return res.status(401).json({ message: "User belonging to this token no longer exists." });
    }

    next();
  } catch (error) {
    return res.status(401).json({ message: "Not authorized, token is invalid or expired." });
  }
};
