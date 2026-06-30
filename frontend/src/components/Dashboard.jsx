import React from "react";

function Dashboard({ resumes, onCreate, onSelect, onDelete, onDuplicate }) {
  const totalResumes = resumes.length;
  
  // Find the last modified resume
  const lastModified = resumes.length > 0 
    ? [...resumes].sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))[0]
    : null;

  // AI Resume tips
  const tips = [
    "Use strong action verbs like 'engineered', 'spearheaded', or 'maximized' to begin your experience bullet points.",
    "Tailor your professional summary to explicitly match keywords in the job description to bypass ATS filters.",
    "Quantify your accomplishments where possible (e.g. 'boosted platform load times by 40%').",
    "Keep your resume to 1-2 pages maximum. A single page is ideal for early to mid-career professionals.",
    "Skills lists should group technical and soft skills separately to ensure scanner compatibility."
  ];
  
  const randomTip = tips[Math.floor((new Date().getDay()) % tips.length)];

  return (
    <div className="dashboard-container animate-fade-in">
      <div className="dashboard-hero glass-panel">
        <h2>Welcome to your AI Resume Workspace</h2>
        <p>Create, optimize, and export professional resumes tailored for applicant tracking systems.</p>
        
        <div style={{
          display: "flex", 
          justifyContent: "center", 
          gap: "40px", 
          marginTop: "30px",
          borderTop: "1px solid var(--border-color)",
          paddingTop: "20px"
        }}>
          <div>
            <div style={{ fontSize: "2rem", fontWeight: "800", color: "var(--accent-light)" }}>{totalResumes}</div>
            <div style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>Saved Resumes</div>
          </div>
          {lastModified && (
            <div>
              <div style={{ fontSize: "1.2rem", fontWeight: "700", marginTop: "10px" }}>{lastModified.name || "Untitled"}</div>
              <div style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>Last Active Resume</div>
            </div>
          )}
          <div style={{ maxWidth: "300px", textAlign: "left" }}>
            <div style={{ fontSize: "0.85rem", fontWeight: "700", textTransform: "uppercase", color: "var(--warning-color)", marginBottom: "4px" }}>AI Tip of the Day</div>
            <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)", lineHeight: "1.4" }}>"{randomTip}"</div>
          </div>
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h3>Your Resumes</h3>
        <button className="btn btn-primary" onClick={() => onCreate()}>
          Create New Resume
        </button>
      </div>

      <div className="resume-grid">
        {/* Create Card */}
        <div className="create-card" onClick={() => onCreate()}>
          <div className="create-card-icon">+</div>
          <span style={{ fontWeight: "600", fontSize: "0.95rem" }}>Create New Resume</span>
          <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginTop: "4px" }}>Start from a clean slate</span>
        </div>

        {/* Existing Resumes */}
        {resumes.map((resume) => {
          const updatedAtStr = new Date(resume.updatedAt).toLocaleDateString(undefined, {
            month: "short",
            day: "numeric",
            year: "numeric"
          });
          
          return (
            <div key={resume._id} className="resume-card glass-panel">
              <div className="resume-card-header">
                <div className="resume-card-title">{resume.name || "Untitled Resume"}</div>
                <div className="resume-card-role">{resume.role || "No Target Role Specified"}</div>
              </div>

              <div className="resume-card-meta">
                <div style={{ marginBottom: "6px" }}>
                  <strong>Template:</strong> <span style={{ textTransform: "capitalize" }}>{resume.settings?.template || "modern"}</span>
                </div>
                <div>
                  <strong>Modified:</strong> {updatedAtStr}
                </div>
              </div>

              <div className="resume-card-actions">
                <button 
                  className="btn btn-secondary" 
                  onClick={() => onSelect(resume)}
                >
                  Edit
                </button>
                <button 
                  className="btn btn-secondary" 
                  onClick={() => onDuplicate(resume)}
                  title="Duplicate Resume"
                  style={{ minWidth: "40px", padding: "10px" }}
                >
                  📄
                </button>
                <button 
                  className="btn btn-danger" 
                  onClick={() => onDelete(resume._id)}
                  title="Delete Resume"
                  style={{ minWidth: "40px", padding: "10px" }}
                >
                  🗑️
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default Dashboard;
