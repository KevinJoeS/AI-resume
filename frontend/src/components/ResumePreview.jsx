import React from "react";

function ResumePreview({ resume, onChange }) {
  const settings = resume.settings || {
    template: "modern",
    themeColor: "#6366f1",
    fontFamily: "Inter"
  };

  const handleStyleChange = (key, value) => {
    onChange({
      settings: {
        ...settings,
        [key]: value
      }
    });
  };

  const handlePrint = () => {
    window.print();
  };

  // Color options
  const colors = [
    { value: "#6366f1", label: "Indigo" },
    { value: "#10b981", label: "Emerald" },
    { value: "#3b82f6", label: "Blue" },
    { value: "#ef4444", label: "Red" },
    { value: "#f59e0b", label: "Amber" },
    { value: "#ec4899", label: "Pink" },
    { value: "#0f172a", label: "Slate" }
  ];

  // Font options
  const fonts = [
    { value: "Inter", label: "Inter (Clean)" },
    { value: "Playfair Display", label: "Playfair (Formal)" },
    { value: "Fira Code", label: "Fira Mono (Tech)" }
  ];

  // Layout Template renderers
  const renderModern = () => {
    return (
      <div className="resume-layout-modern">
        <header>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <h1 className="resume-name" style={{ color: "var(--preview-accent)" }}>{resume.fullName || "Your Name"}</h1>
              <h3 className="resume-role" style={{ color: "var(--text-secondary)", marginTop: "4px" }}>{resume.role || "Your Target Role"}</h3>
            </div>
            
            <div className="contact-grid" style={{ flexWrap: "wrap", justifyContent: "flex-end", maxWidth: "320px", textAlign: "right" }}>
              {resume.email && <div>✉ {resume.email}</div>}
              {resume.phone && <div>☎ {resume.phone}</div>}
              {resume.location && <div>📍 {resume.location}</div>}
              {resume.website && <div>🌐 <a href={resume.website} target="_blank" rel="noreferrer">{resume.website.replace(/^https?:\/\//, '')}</a></div>}
              {resume.linkedin && <div>🔗 <a href={resume.linkedin} target="_blank" rel="noreferrer">linkedin.com/in/{resume.linkedin.split('/').pop()}</a></div>}
              {resume.github && <div>🖥 <a href={resume.github} target="_blank" rel="noreferrer">github.com/{resume.github.split('/').pop()}</a></div>}
            </div>
          </div>
        </header>

        {resume.summary && (
          <section>
            <h4 style={{ color: "var(--preview-accent)" }}>Profile Summary</h4>
            <p style={{ whiteSpace: "pre-line", fontSize: "0.9rem" }}>{resume.summary}</p>
          </section>
        )}

        {(resume.experience || []).length > 0 && (
          <section>
            <h4 style={{ color: "var(--preview-accent)" }}>Work Experience</h4>
            {(resume.experience || []).map((exp, index) => (
              <div key={index} style={{ marginBottom: "12px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontWeight: "600", fontSize: "0.95rem" }}>
                  <span>{exp.role || "Role"} @ <strong style={{ color: "var(--preview-accent)" }}>{exp.company || "Company"}</strong></span>
                  <span style={{ fontSize: "0.85rem", opacity: 0.8 }}>{exp.startDate} - {exp.current ? "Present" : exp.endDate}</span>
                </div>
                {exp.description && (
                  <p style={{ whiteSpace: "pre-line", fontSize: "0.85rem", marginTop: "4px", paddingLeft: "10px", borderLeft: "2px solid #e2e8f0" }}>{exp.description}</p>
                )}
              </div>
            ))}
          </section>
        )}

        {(resume.projects || []).length > 0 && (
          <section>
            <h4 style={{ color: "var(--preview-accent)" }}>Projects</h4>
            {(resume.projects || []).map((proj, index) => (
              <div key={index} style={{ marginBottom: "12px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontWeight: "600", fontSize: "0.95rem" }}>
                  <span>
                    {proj.name || "Project Name"} 
                    {proj.link && (
                      <span style={{ fontSize: "0.8rem", fontWeight: "normal", marginLeft: "10px" }}>
                        [<a href={proj.link} target="_blank" rel="noreferrer">Link</a>]
                      </span>
                    )}
                  </span>
                </div>
                {proj.technologies && (
                  <div style={{ margin: "4px 0" }}>
                    {proj.technologies.split(",").map((tech, idx) => (
                      <span key={idx} style={{ background: "#f1f5f9", fontSize: "0.7rem", color: "#475569", border: "1px solid #cbd5e1", borderRadius: "4px", padding: "1px 6px", marginRight: "4px", display: "inline-block" }}>
                        {tech.trim()}
                      </span>
                    ))}
                  </div>
                )}
                {proj.description && (
                  <p style={{ whiteSpace: "pre-line", fontSize: "0.85rem", marginTop: "2px" }}>{proj.description}</p>
                )}
              </div>
            ))}
          </section>
        )}

        {(resume.skills || []).length > 0 && (
          <section>
            <h4 style={{ color: "var(--preview-accent)" }}>Core Competencies / Skills</h4>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
              {resume.skills.map((skill, idx) => (
                <span key={idx} style={{ background: "rgba(var(--accent-rgb), 0.08)", color: "var(--preview-accent)", border: "1px solid rgba(var(--accent-rgb), 0.2)", borderRadius: "4px", padding: "3px 8px", fontSize: "0.8rem", fontWeight: "500" }}>
                  {skill}
                </span>
              ))}
            </div>
          </section>
        )}

        {(resume.education || []).length > 0 && (
          <section>
            <h4 style={{ color: "var(--preview-accent)" }}>Education</h4>
            {(resume.education || []).map((edu, index) => (
              <div key={index} style={{ marginBottom: "8px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontWeight: "600", fontSize: "0.95rem" }}>
                  <span>{edu.degree} in {edu.fieldOfStudy}</span>
                  <span style={{ fontSize: "0.85rem", opacity: 0.8 }}>{edu.endDate}</span>
                </div>
                <div style={{ fontSize: "0.9rem", color: "var(--text-secondary)" }}>{edu.school}</div>
                {edu.description && (
                  <p style={{ fontSize: "0.8rem", fontStyle: "italic", marginTop: "2px" }}>{edu.description}</p>
                )}
              </div>
            ))}
          </section>
        )}
      </div>
    );
  };

  const renderClassic = () => {
    return (
      <div className="resume-layout-classic">
        <header>
          <h1 className="resume-name" style={{ color: "var(--preview-accent)", textAlign: "center" }}>{resume.fullName || "Your Name"}</h1>
          <h3 className="resume-role" style={{ textAlign: "center", color: "var(--text-secondary)", marginTop: "4px" }}>{resume.role || "Your Target Role"}</h3>
          
          <div className="contact-grid">
            {resume.email && <span>{resume.email}</span>}
            {resume.phone && <span>{resume.phone}</span>}
            {resume.location && <span>{resume.location}</span>}
          </div>
          <div className="contact-grid" style={{ borderTop: "none", padding: "0 0 6px 0", gap: "10px" }}>
            {resume.website && <span><a href={resume.website} target="_blank" rel="noreferrer">{resume.website.replace(/^https?:\/\//, '')}</a></span>}
            {resume.linkedin && <span><a href={resume.linkedin} target="_blank" rel="noreferrer">LinkedIn</a></span>}
            {resume.github && <span><a href={resume.github} target="_blank" rel="noreferrer">GitHub</a></span>}
          </div>
        </header>

        {resume.summary && (
          <section>
            <h4 style={{ color: "var(--preview-accent)" }}>Summary</h4>
            <p style={{ whiteSpace: "pre-line", fontSize: "0.9rem", fontStyle: "italic", textAlign: "justify" }}>{resume.summary}</p>
          </section>
        )}

        {(resume.experience || []).length > 0 && (
          <section>
            <h4 style={{ color: "var(--preview-accent)" }}>Experience</h4>
            {(resume.experience || []).map((exp, index) => (
              <div key={index} style={{ marginBottom: "14px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontWeight: "600", fontSize: "0.95rem" }}>
                  <span>{exp.role || "Role"} — <strong style={{ color: "var(--preview-accent)" }}>{exp.company || "Company"}</strong></span>
                  <span>{exp.startDate} - {exp.current ? "Present" : exp.endDate}</span>
                </div>
                {exp.description && (
                  <p style={{ whiteSpace: "pre-line", fontSize: "0.85rem", marginTop: "4px", textAlign: "justify" }}>{exp.description}</p>
                )}
              </div>
            ))}
          </section>
        )}

        {(resume.projects || []).length > 0 && (
          <section>
            <h4 style={{ color: "var(--preview-accent)" }}>Selected Projects</h4>
            {(resume.projects || []).map((proj, index) => (
              <div key={index} style={{ marginBottom: "14px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontWeight: "600", fontSize: "0.95rem" }}>
                  <span>
                    {proj.name || "Project Name"} 
                    {proj.technologies && (
                      <span style={{ fontSize: "0.8rem", fontWeight: "normal", fontStyle: "italic", marginLeft: "8px" }}>
                        ({proj.technologies})
                      </span>
                    )}
                  </span>
                  {proj.link && <span>[<a href={proj.link} target="_blank" rel="noreferrer">Link</a>]</span>}
                </div>
                {proj.description && (
                  <p style={{ whiteSpace: "pre-line", fontSize: "0.85rem", marginTop: "2px", textAlign: "justify" }}>{proj.description}</p>
                )}
              </div>
            ))}
          </section>
        )}

        {(resume.skills || []).length > 0 && (
          <section>
            <h4 style={{ color: "var(--preview-accent)" }}>Skills & Competencies</h4>
            <p style={{ fontSize: "0.9rem", textAlign: "center" }}>
              {resume.skills.join(" • ")}
            </p>
          </section>
        )}

        {(resume.education || []).length > 0 && (
          <section>
            <h4 style={{ color: "var(--preview-accent)" }}>Education</h4>
            {(resume.education || []).map((edu, index) => (
              <div key={index} style={{ marginBottom: "8px", textAlign: "center" }}>
                <div style={{ fontWeight: "600" }}>{edu.degree} in {edu.fieldOfStudy}</div>
                <div>{edu.school} • {edu.endDate}</div>
                {edu.description && (
                  <p style={{ fontSize: "0.8rem", fontStyle: "italic" }}>{edu.description}</p>
                )}
              </div>
            ))}
          </section>
        )}
      </div>
    );
  };

  const renderTech = () => {
    return (
      <div className="resume-layout-tech">
        <header>
          <div className="resume-name">// {resume.fullName || "Your Name"}</div>
          <div className="resume-role" style={{ marginTop: "4px" }}>&gt; {resume.role || "Software Engineer"}</div>
          
          <div className="contact-grid">
            {resume.email && <div>[email] {resume.email}</div>}
            {resume.phone && <div>[phone] {resume.phone}</div>}
            {resume.location && <div>[locat] {resume.location}</div>}
            {resume.website && <div>[web] <a href={resume.website} target="_blank" rel="noreferrer" style={{ color: "#38bdf8" }}>{resume.website}</a></div>}
            {resume.linkedin && <div>[lnkd] <a href={resume.linkedin} target="_blank" rel="noreferrer" style={{ color: "#38bdf8" }}>LinkedIn</a></div>}
            {resume.github && <div>[git] <a href={resume.github} target="_blank" rel="noreferrer" style={{ color: "#38bdf8" }}>GitHub</a></div>}
          </div>
        </header>

        {resume.summary && (
          <section>
            <h4># Profile</h4>
            <p style={{ whiteSpace: "pre-line" }}>{resume.summary}</p>
          </section>
        )}

        {(resume.experience || []).length > 0 && (
          <section>
            <h4># Experience</h4>
            {(resume.experience || []).map((exp, index) => (
              <div key={index} style={{ marginBottom: "14px" }}>
                <div style={{ fontWeight: "600", color: "var(--preview-accent)" }}>
                  {exp.role || "Role"} @ {exp.company || "Company"} ({exp.startDate} - {exp.current ? "Present" : exp.endDate})
                </div>
                {exp.description && (
                  <p style={{ whiteSpace: "pre-line", fontSize: "0.8rem", marginTop: "4px", paddingLeft: "12px", borderLeft: "2px dashed var(--preview-accent)" }}>
                    {exp.description}
                  </p>
                )}
              </div>
            ))}
          </section>
        )}

        {(resume.projects || []).length > 0 && (
          <section>
            <h4># Key Projects</h4>
            {(resume.projects || []).map((proj, index) => (
              <div key={index} style={{ marginBottom: "14px" }}>
                <div style={{ fontWeight: "600", color: "var(--preview-accent)" }}>
                  {proj.name} {proj.link && `[${proj.link}]`}
                </div>
                {proj.technologies && (
                  <div style={{ margin: "4px 0" }}>
                    <strong>Technologies:</strong> {proj.technologies}
                  </div>
                )}
                {proj.description && (
                  <p style={{ whiteSpace: "pre-line", fontSize: "0.8rem" }}>{proj.description}</p>
                )}
              </div>
            ))}
          </section>
        )}

        {(resume.skills || []).length > 0 && (
          <section>
            <h4># Tech Stack</h4>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
              {resume.skills.map((skill, idx) => (
                <span key={idx} style={{ background: "#1e293b", color: "#38bdf8", border: "1px solid #38bdf8", borderRadius: "4px", padding: "2px 6px", fontSize: "0.75rem" }}>
                  {skill}
                </span>
              ))}
            </div>
          </section>
        )}

        {(resume.education || []).length > 0 && (
          <section>
            <h4># Education</h4>
            {(resume.education || []).map((edu, index) => (
              <div key={index} style={{ marginBottom: "8px" }}>
                <div style={{ fontWeight: "600" }}>{edu.school} // {edu.degree} in {edu.fieldOfStudy}</div>
                <div style={{ opacity: 0.8 }}>Class of {edu.endDate}</div>
                {edu.description && (
                  <p style={{ fontSize: "0.8rem", opacity: 0.9 }}>{edu.description}</p>
                )}
              </div>
            ))}
          </section>
        )}
      </div>
    );
  };

  const getFontFamily = () => {
    switch (settings.fontFamily) {
      case "Playfair Display":
        return "'Playfair Display', serif";
      case "Fira Code":
        return "'Fira Code', monospace";
      default:
        return "'Plus Jakarta Sans', 'Inter', sans-serif";
    }
  };

  return (
    <>
      <div className="preview-controls no-print">
        {/* Template selector */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{ fontSize: "0.8rem", fontWeight: "600", color: "var(--text-secondary)" }}>Layout:</span>
          <select 
            value={settings.template} 
            onChange={(e) => handleStyleChange("template", e.target.value)}
            style={{ width: "auto", padding: "6px 12px", fontSize: "0.85rem" }}
          >
            <option value="modern">Modern Minimalist</option>
            <option value="classic">Classic Executive</option>
            <option value="tech">Developer Tech</option>
          </select>
        </div>

        {/* Font Selector */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{ fontSize: "0.8rem", fontWeight: "600", color: "var(--text-secondary)" }}>Font:</span>
          <select 
            value={settings.fontFamily} 
            onChange={(e) => handleStyleChange("fontFamily", e.target.value)}
            style={{ width: "auto", padding: "6px 12px", fontSize: "0.85rem" }}
          >
            {fonts.map((f) => (
              <option key={f.value} value={f.value}>{f.label}</option>
            ))}
          </select>
        </div>

        {/* Color picker */}
        <div className="style-panel">
          <span style={{ fontSize: "0.8rem", fontWeight: "600", color: "var(--text-secondary)" }}>Theme:</span>
          <div style={{ display: "flex", gap: "6px" }}>
            {colors.map((c) => (
              <div 
                key={c.value} 
                className={`color-dot ${settings.themeColor === c.value ? "active" : ""}`}
                style={{ backgroundColor: c.value }}
                onClick={() => handleStyleChange("themeColor", c.value)}
                title={c.label}
              />
            ))}
          </div>
        </div>

        {/* PDF Download */}
        <button className="btn btn-primary" onClick={handlePrint} style={{ padding: "6px 12px", fontSize: "0.85rem" }}>
          💾 Export PDF
        </button>
      </div>

      <div className="preview-scroller">
        <div 
          className="resume-canvas animate-fade-in" 
          id="resume-pdf-canvas"
          style={{ 
            fontFamily: getFontFamily(),
            "--preview-accent": settings.themeColor || "#6366f1",
            "--accent-rgb": settings.themeColor === "#6366f1" ? "99,102,241" : 
                           settings.themeColor === "#10b981" ? "16,185,129" : 
                           settings.themeColor === "#3b82f6" ? "59,130,246" : 
                           settings.themeColor === "#ef4444" ? "239,68,68" : 
                           settings.themeColor === "#f59e0b" ? "245,158,11" : 
                           settings.themeColor === "#ec4899" ? "236,72,153" : "15,23,42"
          }}
        >
          {settings.template === "classic" && renderClassic()}
          {settings.template === "tech" && renderTech()}
          {settings.template === "modern" && renderModern()}
        </div>
      </div>
    </>
  );
}

export default ResumePreview;