import mongoose from "mongoose";

const experienceSchema = new mongoose.Schema({
  company: String,
  role: String,
  startDate: String,
  endDate: String,
  current: { type: Boolean, default: false },
  description: String,
});

const educationSchema = new mongoose.Schema({
  school: String,
  degree: String,
  fieldOfStudy: String,
  startDate: String,
  endDate: String,
  description: String,
});

const projectSchema = new mongoose.Schema({
  name: String,
  description: String,
  technologies: String,
  link: String,
});

const resumeSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    name: { type: String, default: "" },
    role: { type: String, default: "" },
    email: { type: String, default: "" },
    phone: { type: String, default: "" },
    website: { type: String, default: "" },
    linkedin: { type: String, default: "" },
    github: { type: String, default: "" },
    location: { type: String, default: "" },
    summary: { type: String, default: "" },
    experience: [experienceSchema],
    education: [educationSchema],
    projects: [projectSchema],
    skills: { type: [String], default: [] },
    settings: {
      template: { type: String, default: "modern" },
      themeColor: { type: String, default: "#6366f1" },
      fontFamily: { type: String, default: "Inter" },
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Resume", resumeSchema);