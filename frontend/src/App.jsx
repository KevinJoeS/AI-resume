import { useState, useEffect } from "react";
import "./App.css";

import { useAuth } from "./context/AuthContext";
import Login from "./components/Login";
import Dashboard from "./components/Dashboard";
import ResumeForm from "./components/ResumeForm";
import ResumePreview from "./components/ResumePreview";

import {
  getResumes,
  createResume,
  updateResume,
  deleteResume,
} from "./api/resumeApi";

const BLANK_RESUME = {
  name: "New Resume",
  role: "",
  email: "",
  phone: "",
  website: "",
  linkedin: "",
  github: "",
  location: "",
  summary: "",
  experience: [],
  education: [],
  projects: [],
  skills: [],
  settings: {
    template: "modern",
    themeColor: "#6366f1",
    fontFamily: "Inter",
  },
};

function App() {
  const { user, isGuest, loading, isAuthenticated, logout } = useAuth();

  const [resumes, setResumes] = useState([]);
  const [activeResume, setActiveResume] = useState(null);
  const [isDarkTheme, setIsDarkTheme] = useState(true);

  // Theme init
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "light") {
      setIsDarkTheme(false);
      document.body.classList.add("light-theme");
    }
  }, []);

  const toggleTheme = () => {
    if (isDarkTheme) {
      document.body.classList.add("light-theme");
      localStorage.setItem("theme", "light");
      setIsDarkTheme(false);
    } else {
      document.body.classList.remove("light-theme");
      localStorage.setItem("theme", "dark");
      setIsDarkTheme(true);
    }
  };

  const fetchResumes = async () => {
    try {
      const data = await getResumes();
      setResumes(data);
    } catch (error) {
      console.error("Error fetching resumes:", error);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchResumes();
    } else {
      setResumes([]);
      setActiveResume(null);
    }
  }, [isAuthenticated]);

  const handleCreateResume = async () => {
    try {
      const newResume = await createResume(BLANK_RESUME);
      setResumes((prev) => [newResume, ...prev]);
      setActiveResume(newResume);
    } catch (error) {
      console.error("Error creating resume:", error);
      alert("Failed to create resume. Please try again.");
    }
  };

  const handleSaveActiveResume = async () => {
    if (!activeResume || !activeResume._id) return;
    try {
      const updated = await updateResume(activeResume._id, activeResume);
      setResumes((prev) => prev.map((r) => (r._id === updated._id ? updated : r)));
      setActiveResume(updated);
      alert("Resume saved successfully!");
    } catch (error) {
      console.error("Error saving resume:", error);
      alert("Failed to save resume.");
    }
  };

  const handleDeleteResume = async (id) => {
    if (!window.confirm("Delete this resume? This cannot be undone.")) return;
    try {
      await deleteResume(id);
      setResumes((prev) => prev.filter((r) => r._id !== id));
      if (activeResume && activeResume._id === id) setActiveResume(null);
    } catch (error) {
      console.error("Error deleting resume:", error);
      alert("Failed to delete resume.");
    }
  };

  const handleDuplicateResume = async (resume) => {
    try {
      const { _id, createdAt, updatedAt, ...dupData } = resume;
      const newResume = await createResume({
        ...dupData,
        name: `${resume.name || "Untitled"} (Copy)`,
      });
      setResumes((prev) => [newResume, ...prev]);
      alert("Resume duplicated!");
    } catch (error) {
      console.error("Error duplicating resume:", error);
      alert("Failed to duplicate.");
    }
  };

  const handleUpdateActiveResume = (updatedFields) => {
    setActiveResume((prev) => (prev ? { ...prev, ...updatedFields } : null));
  };

  const handleLogout = () => {
    logout();
    setActiveResume(null);
    setResumes([]);
  };

  // ── Loading splash ──────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#090d16",
          flexDirection: "column",
          gap: "16px",
        }}
      >
        <div style={{
          width: "48px", height: "48px",
          border: "3px solid rgba(99,102,241,0.2)",
          borderTop: "3px solid #6366f1",
          borderRadius: "50%",
          animation: "spin 0.8s linear infinite",
        }} />
        <p style={{ color: "#64748b", fontFamily: "Inter, sans-serif" }}>Loading your workspace...</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  // ── Auth Guard: show Login if not authenticated ─────────────────────────────
  if (!isAuthenticated) {
    return <Login />;
  }

  // ── Main App ────────────────────────────────────────────────────────────────
  return (
    <div className="app-wrapper">
      <header className="app-header no-print">
        <div className="logo-section">
          <div className="logo-icon">AI</div>
          <span className="logo-text">Resume Builder</span>
        </div>

        <div className="header-actions">
          {/* User display */}
          <div style={{
            display: "flex", alignItems: "center", gap: "8px",
            padding: "6px 14px", borderRadius: "20px",
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.06)",
          }}>
            <span style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>
              {isGuest ? "👤 Guest Mode" : `👤 ${user?.fullName || user?.email}`}
            </span>
          </div>

          {activeResume && (
            <button
              className="btn btn-secondary"
              onClick={() => {
                fetchResumes();
                setActiveResume(null);
              }}
            >
              ← Dashboard
            </button>
          )}

          <button className="btn btn-secondary btn-icon" onClick={toggleTheme} title="Toggle theme">
            {isDarkTheme ? "☀️" : "🌙"}
          </button>

          <button
            className="btn btn-secondary"
            onClick={handleLogout}
            style={{ color: "var(--danger-color)", borderColor: "rgba(239,68,68,0.2)" }}
          >
            {isGuest ? "Exit Guest" : "Sign Out"}
          </button>
        </div>
      </header>

      {activeResume ? (
        <div className="workspace-container">
          <div className="form-section no-print">
            <ResumeForm
              resume={activeResume}
              onChange={handleUpdateActiveResume}
              onSave={handleSaveActiveResume}
            />
          </div>
          <div className="preview-section">
            <ResumePreview resume={activeResume} onChange={handleUpdateActiveResume} />
          </div>
        </div>
      ) : (
        <Dashboard
          resumes={resumes}
          onCreate={handleCreateResume}
          onSelect={setActiveResume}
          onDelete={handleDeleteResume}
          onDuplicate={handleDuplicateResume}
        />
      )}
    </div>
  );
}

export default App;