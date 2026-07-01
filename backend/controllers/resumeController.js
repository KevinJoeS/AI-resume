import Resume from "../models/Resume.js";

const withoutUserId = (resumeData) => {
  const { userId, _id, createdAt, updatedAt, ...safeData } = resumeData;
  return safeData;
};

const userResumeFilter = (req, extra = {}) => ({
  ...extra,
  userId: req.user._id,
});

export const createResume = async (req, res) => {
  try {
    const resume = await Resume.create({
      ...withoutUserId(req.body),
      userId: req.user._id,
    });

    res.status(201).json(resume);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

export const getResumes = async (req, res) => {
  try {
    const resumes = await Resume.find(userResumeFilter(req)).sort({ updatedAt: -1 });
    res.status(200).json(resumes);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

export const getResumeById = async (req, res) => {
  try {
    const resume = await Resume.findOne(userResumeFilter(req, { _id: req.params.id }));

    if (!resume) {
      return res.status(404).json({
        message: "Resume not found",
      });
    }

    res.status(200).json(resume);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

export const deleteResume = async (req, res) => {
  try {
    const resume = await Resume.findOneAndDelete(userResumeFilter(req, { _id: req.params.id }));

    if (!resume) {
      return res.status(404).json({
        message: "Resume not found",
      });
    }

    res.status(200).json({
      message: "Resume deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

export const updateResume = async (req, res) => {
  try {
    const updatedResume = await Resume.findOneAndUpdate(
      userResumeFilter(req, { _id: req.params.id }),
      withoutUserId(req.body),
      { new: true, runValidators: true }
    );

    if (!updatedResume) {
      return res.status(404).json({
        message: "Resume not found",
      });
    }

    res.status(200).json(updatedResume);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};
