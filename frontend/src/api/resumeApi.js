import axios from "axios";

const API_BASE = import.meta.env.VITE_API_BASE;
const API_URL = `${API_BASE}/resumes`;
const AI_URL = `${API_BASE}/ai`;
const AUTH_URL = `${API_BASE}/auth`;

// Attach stored token to every request automatically
const getAuthHeaders = () => {
  const token = localStorage.getItem("auth_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// ─── Auth APIs ────────────────────────────────────────────────────────────────
export const loginUser = async (email, password) => {
  const response = await axios.post(`${AUTH_URL}/login`, { email, password });
  return response.data;
};

export const registerUser = async (fullName, email, password) => {
  const response = await axios.post(`${AUTH_URL}/register`, { fullName, email, password });
  return response.data;
};

export const getMe = async () => {
  const response = await axios.get(`${AUTH_URL}/me`, { headers: getAuthHeaders() });
  return response.data;
};

// ─── Resume APIs ──────────────────────────────────────────────────────────────
export const getResumes = async () => {
  const response = await axios.get(API_URL, { headers: getAuthHeaders() });
  return response.data;
};

export const getResume = async (id) => {
  const response = await axios.get(`${API_URL}/${id}`, { headers: getAuthHeaders() });
  return response.data;
};

export const createResume = async (resumeData) => {
  const response = await axios.post(API_URL, resumeData, { headers: getAuthHeaders() });
  return response.data;
};

export const updateResume = async (id, resumeData) => {
  const response = await axios.put(`${API_URL}/${id}`, resumeData, { headers: getAuthHeaders() });
  return response.data;
};

export const deleteResume = async (id) => {
  const response = await axios.delete(`${API_URL}/${id}`, { headers: getAuthHeaders() });
  return response.data;
};

// ─── AI APIs ──────────────────────────────────────────────────────────────────
export const enhanceText = async (text, instruction) => {
  const response = await axios.post(`${AI_URL}/enhance`, { text, instruction }, { headers: getAuthHeaders() });
  return response.data;
};

export const optimizeResume = async (resumeData, jobDescription) => {
  const response = await axios.post(`${AI_URL}/optimize`, { resumeData, jobDescription }, { headers: getAuthHeaders() });
  return response.data;
};

export const matchUploadResume = async (file, jobDescription) => {
  const formData = new FormData();
  formData.append("resume", file);
  formData.append("jobDescription", jobDescription);
  const response = await axios.post(`${AI_URL}/match-upload`, formData, {
    headers: {
      ...getAuthHeaders(),
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};