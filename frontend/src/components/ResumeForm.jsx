import React, { useState } from "react";
import { enhanceText, optimizeResume } from "../api/resumeApi";

function ResumeForm({ resume, onChange, onSave }) {
  const [activeTab, setActiveTab] = useState("basics");
  
  // AI Polish modal state
  const [aiModal, setAiModal] = useState({
    isOpen: false,
    originalText: "",
    enhancedText: "",
    instruction: "professional",
    customInstruction: "",
    isLoading: false,
    targetPath: null, // path to update, e.g. "summary" or ["experience", index, "description"]
  });

  // AI Optimizer State
  const [jobDescription, setJobDescription] = useState("");
  const [optimizerLoading, setOptimizerLoading] = useState(false);
  const [optimizerResult, setOptimizerResult] = useState(null);

  // Skill Input state
  const [skillInput, setSkillInput] = useState("");

  const handleFieldChange = (e) => {
    const { name, value } = e.target;
    onChange({ [name]: value });
  };

  const handleNestedFieldChange = (section, index, field, value) => {
    const updatedSection = [...(resume[section] || [])];
    updatedSection[index] = {
      ...updatedSection[index],
      [field]: value
    };
    onChange({ [section]: updatedSection });
  };

  const handleAddSection = (section, defaultValue) => {
    onChange({
      [section]: [...(resume[section] || []), defaultValue]
    });
  };

  const handleRemoveSection = (section, index) => {
    onChange({
      [section]: (resume[section] || []).filter((_, i) => i !== index)
    });
  };

  // Skill tag helpers
  const handleAddSkill = (e) => {
    if (e.key === "Enter" || e.type === "click") {
      e.preventDefault();
      const val = skillInput.trim();
      if (val && !resume.skills.includes(val)) {
        onChange({ skills: [...resume.skills, val] });
        setSkillInput("");
      }
    }
  };

  const handleRemoveSkill = (skillToRemove) => {
    onChange({
      skills: resume.skills.filter(s => s !== skillToRemove)
    });
  };

  // Open AI Polish Modal
  const openAiPolish = (text, targetPath) => {
    setAiModal({
      isOpen: true,
      originalText: text || "",
      enhancedText: "",
      instruction: "professional",
      customInstruction: "",
      isLoading: false,
      targetPath,
    });
  };

  // Call backend AI polish API
  const handleEnhance = async () => {
    const textToPolish = aiModal.originalText;
    const finalInstruction = aiModal.instruction === "custom" 
      ? aiModal.customInstruction 
      : aiModal.instruction;

    if (!textToPolish) return;

    setAiModal(prev => ({ ...prev, isLoading: true, enhancedText: "" }));

    try {
      const data = await enhanceText(textToPolish, finalInstruction);
      setAiModal(prev => ({ 
        ...prev, 
        isLoading: false, 
        enhancedText: data.enhancedText 
      }));
    } catch (error) {
      console.error(error);
      setAiModal(prev => ({ 
        ...prev, 
        isLoading: false, 
        enhancedText: "Error: Failed to optimize text. Please check your connection." 
      }));
    }
  };

  // Apply polished text back to resume fields
  const applyAiEnhancement = () => {
    const { targetPath, enhancedText } = aiModal;
    if (!enhancedText) return;

    if (typeof targetPath === "string") {
      onChange({ [targetPath]: enhancedText });
    } else if (Array.isArray(targetPath)) {
      const [section, index, field] = targetPath;
      handleNestedFieldChange(section, index, field, enhancedText);
    }
    
    setAiModal(prev => ({ ...prev, isOpen: false }));
  };

  // ATS optimizer trigger
  const runAtsOptimizer = async () => {
    if (!jobDescription.trim()) return;
    setOptimizerLoading(true);
    setOptimizerResult(null);

    try {
      const result = await optimizeResume(resume, jobDescription);
      setOptimizerResult(result);
    } catch (error) {
      console.error(error);
      alert("Failed to analyze resume matching");
    } finally {
      setOptimizerLoading(false);
    }
  };

  const activeTones = [
    { id: "professional", name: "💼 Professional" },
    { id: "action verbs", name: "🚀 Action-Packed" },
    { id: "shorten", name: "✂️ Short & Concise" },
    { id: "technical achievements", name: "💻 Tech-heavy" },
    { id: "custom", name: "✏️ Custom Prompt" }
  ];

  return (
    <>
      <div className="form-header">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h2>Resume Editor</h2>
          <button className="btn btn-primary" onClick={onSave}>Save Changes</button>
        </div>
      </div>

      <div className="wizard-tabs">
        <button className={`tab-btn ${activeTab === "basics" ? "active" : ""}`} onClick={() => setActiveTab("basics")}>📄 Contact</button>
        <button className={`tab-btn ${activeTab === "experience" ? "active" : ""}`} onClick={() => setActiveTab("experience")}>💼 Work</button>
        <button className={`tab-btn ${activeTab === "projects" ? "active" : ""}`} onClick={() => setActiveTab("projects")}>🚀 Projects</button>
        <button className={`tab-btn ${activeTab === "skills" ? "active" : ""}`} onClick={() => setActiveTab("skills")}>🛠️ Skills & Edu</button>
        <button className={`tab-btn ${activeTab === "optimize" ? "active" : ""}`} onClick={() => setActiveTab("optimize")}>⚡ AI Matcher</button>
      </div>

      <div className="form-body">
        {/* BASICS TAB */}
        {activeTab === "basics" && (
          <div className="animate-fade-in">
            <h3 style={{ marginBottom: "16px" }}>Personal details</h3>
            <div className="fields-grid">
              <div className="input-group">
                <label className="input-label">Resume Label (for dashboard)</label>
                <input type="text" name="name" value={resume.name || ""} onChange={handleFieldChange} placeholder="e.g. Fullstack Dev Resume" />
              </div>
              <div className="input-group">
                <label className="input-label">Target Role</label>
                <input type="text" name="role" value={resume.role || ""} onChange={handleFieldChange} placeholder="e.g. Software Architect" />
              </div>
              <div className="input-group">
                <label className="input-label">Full Name</label>
                <input type="text" name="fullName" value={resume.fullName || ""} onChange={handleFieldChange} placeholder="John Doe" />
              </div>
              <div className="input-group">
                <label className="input-label">Email</label>
                <input type="email" name="email" value={resume.email || ""} onChange={handleFieldChange} placeholder="john@example.com" />
              </div>
              <div className="input-group">
                <label className="input-label">Phone</label>
                <input type="tel" name="phone" value={resume.phone || ""} onChange={handleFieldChange} placeholder="+1 555 123 4567" />
              </div>
              <div className="input-group">
                <label className="input-label">Location</label>
                <input type="text" name="location" value={resume.location || ""} onChange={handleFieldChange} placeholder="New York, NY" />
              </div>
              <div className="input-group">
                <label className="input-label">Website</label>
                <input type="url" name="website" value={resume.website || ""} onChange={handleFieldChange} placeholder="https://portfolio.com" />
              </div>
              <div className="input-group">
                <label className="input-label">LinkedIn Profile</label>
                <input type="url" name="linkedin" value={resume.linkedin || ""} onChange={handleFieldChange} placeholder="linkedin.com/in/username" />
              </div>
              <div className="input-group field-full">
                <label className="input-label">GitHub Link</label>
                <input type="url" name="github" value={resume.github || ""} onChange={handleFieldChange} placeholder="github.com/username" />
              </div>
              
              <div className="input-group field-full">
                <div className="ai-header-helper">
                  <label className="input-label">Professional Summary</label>
                  <button className="ai-button" onClick={() => openAiPolish(resume.summary, "summary")}>
                    ✨ AI Polish Summary
                  </button>
                </div>
                <textarea name="summary" value={resume.summary || ""} onChange={handleFieldChange} placeholder="Write a summary about your skills, experience, and value..." />
              </div>
            </div>
          </div>
        )}

        {/* EXPERIENCE TAB */}
        {activeTab === "experience" && (
          <div className="animate-fade-in">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h3>Work Experience</h3>
              <button className="btn btn-secondary" onClick={() => handleAddSection("experience", { company: "", role: "", startDate: "", endDate: "", current: false, description: "" })}>
                + Add Experience
              </button>
            </div>
            
            <div className="timeline-list">
              {(resume.experience || []).length === 0 ? (
                <p style={{ color: "var(--text-secondary)", textAlign: "center", padding: "20px" }}>No experience records added. Add some below!</p>
              ) : (
                (resume.experience || []).map((exp, index) => (
                  <div key={index} className="timeline-item">
                    <div className="timeline-item-header">
                      <h4 style={{ color: "var(--accent-light)" }}>Job Record #{index + 1}</h4>
                      <button className="btn btn-danger" style={{ padding: "4px 8px", fontSize: "0.75rem" }} onClick={() => handleRemoveSection("experience", index)}>Delete</button>
                    </div>

                    <div className="fields-grid">
                      <div className="input-group">
                        <label className="input-label">Company Name</label>
                        <input type="text" value={exp.company || ""} onChange={(e) => handleNestedFieldChange("experience", index, "company", e.target.value)} placeholder="Google" />
                      </div>
                      <div className="input-group">
                        <label className="input-label">Job Title / Role</label>
                        <input type="text" value={exp.role || ""} onChange={(e) => handleNestedFieldChange("experience", index, "role", e.target.value)} placeholder="Frontend Developer" />
                      </div>
                      <div className="input-group">
                        <label className="input-label">Start Date</label>
                        <input type="text" value={exp.startDate || ""} onChange={(e) => handleNestedFieldChange("experience", index, "startDate", e.target.value)} placeholder="Jan 2023" />
                      </div>
                      <div className="input-group">
                        <label className="input-label">End Date</label>
                        <input type="text" value={exp.endDate || ""} onChange={(e) => handleNestedFieldChange("experience", index, "endDate", e.target.value)} placeholder="Present" disabled={exp.current} />
                      </div>
                      <div className="input-group field-full" style={{ flexDirection: "row", gap: "8px", alignItems: "center" }}>
                        <input type="checkbox" id={`current-${index}`} checked={exp.current || false} onChange={(e) => handleNestedFieldChange("experience", index, "current", e.target.checked)} />
                        <label htmlFor={`current-${index}`} className="input-label" style={{ cursor: "pointer" }}>Currently work here</label>
                      </div>
                      
                      <div className="input-group field-full">
                        <div className="ai-header-helper">
                          <label className="input-label">Responsibilities & Outcomes</label>
                          <button className="ai-button" onClick={() => openAiPolish(exp.description, ["experience", index, "description"])}>
                            ✨ AI Enhance Bullet Points
                          </button>
                        </div>
                        <textarea value={exp.description || ""} onChange={(e) => handleNestedFieldChange("experience", index, "description", e.target.value)} placeholder="Describe key achievements (use action verbs and quantify metrics if possible)..." />
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* PROJECTS TAB */}
        {activeTab === "projects" && (
          <div className="animate-fade-in">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h3>Projects</h3>
              <button className="btn btn-secondary" onClick={() => handleAddSection("projects", { name: "", technologies: "", link: "", description: "" })}>
                + Add Project
              </button>
            </div>
            
            <div className="timeline-list">
              {(resume.projects || []).length === 0 ? (
                <p style={{ color: "var(--text-secondary)", textAlign: "center", padding: "20px" }}>No projects added. Showcase some of your work!</p>
              ) : (
                (resume.projects || []).map((proj, index) => (
                  <div key={index} className="timeline-item">
                    <div className="timeline-item-header">
                      <h4 style={{ color: "var(--accent-light)" }}>Project #{index + 1}</h4>
                      <button className="btn btn-danger" style={{ padding: "4px 8px", fontSize: "0.75rem" }} onClick={() => handleRemoveSection("projects", index)}>Delete</button>
                    </div>

                    <div className="fields-grid">
                      <div className="input-group">
                        <label className="input-label">Project Title</label>
                        <input type="text" value={proj.name || ""} onChange={(e) => handleNestedFieldChange("projects", index, "name", e.target.value)} placeholder="e.g. AI Resume Optimiser" />
                      </div>
                      <div className="input-group">
                        <label className="input-label">Project URL / Link</label>
                        <input type="url" value={proj.link || ""} onChange={(e) => handleNestedFieldChange("projects", index, "link", e.target.value)} placeholder="github.com/username/project" />
                      </div>
                      <div className="input-group field-full">
                        <label className="input-label">Technologies (comma-separated)</label>
                        <input type="text" value={proj.technologies || ""} onChange={(e) => handleNestedFieldChange("projects", index, "technologies", e.target.value)} placeholder="React, Node.js, Mongoose" />
                      </div>
                      
                      <div className="input-group field-full">
                        <div className="ai-header-helper">
                          <label className="input-label">Project Description</label>
                          <button className="ai-button" onClick={() => openAiPolish(proj.description, ["projects", index, "description"])}>
                            ✨ AI Optimize description
                          </button>
                        </div>
                        <textarea value={proj.description || ""} onChange={(e) => handleNestedFieldChange("projects", index, "description", e.target.value)} placeholder="Describe what you built, the core technical stack, and your key achievements..." />
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* SKILLS & EDUCATION TAB */}
        {activeTab === "skills" && (
          <div className="animate-fade-in">
            <h3 style={{ marginBottom: "8px" }}>Technical Skills</h3>
            <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "12px" }}>Type a skill and press Enter, comma, or click Add. Group skills logically.</p>
            
            <div style={{ display: "flex", gap: "10px", marginBottom: "8px" }}>
              <input type="text" value={skillInput} onChange={(e) => setSkillInput(e.target.value)} onKeyDown={handleAddSkill} placeholder="e.g. React, Docker, Project Management" style={{ flex: 1 }} />
              <button className="btn btn-secondary" onClick={handleAddSkill}>Add</button>
            </div>

            <div className="tags-container">
              {(!resume.skills || resume.skills.length === 0) ? (
                <span style={{ color: "var(--text-muted)", fontSize: "0.85rem", fontStyle: "italic" }}>No skills tags created yet.</span>
              ) : (
                resume.skills.map((skill, index) => (
                  <span key={index} className="tag-chip">
                    {skill}
                    <span className="tag-remove" onClick={() => handleRemoveSkill(skill)}>×</span>
                  </span>
                ))
              )}
            </div>

            <hr style={{ margin: "24px 0", borderColor: "var(--border-color)" }} />

            <div style={{ display: "flex", justifySelf: "stretch", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h3>Education</h3>
              <button className="btn btn-secondary" onClick={() => handleAddSection("education", { school: "", degree: "", fieldOfStudy: "", startDate: "", endDate: "", description: "" })}>
                + Add Education
              </button>
            </div>
            
            <div className="timeline-list">
              {(resume.education || []).length === 0 ? (
                <p style={{ color: "var(--text-secondary)", textAlign: "center", padding: "20px" }}>No education records added.</p>
              ) : (
                (resume.education || []).map((edu, index) => (
                  <div key={index} className="timeline-item">
                    <div className="timeline-item-header">
                      <h4 style={{ color: "var(--accent-light)" }}>Degree / Program #{index + 1}</h4>
                      <button className="btn btn-danger" style={{ padding: "4px 8px", fontSize: "0.75rem" }} onClick={() => handleRemoveSection("education", index)}>Delete</button>
                    </div>

                    <div className="fields-grid">
                      <div className="input-group">
                        <label className="input-label">Institution / School</label>
                        <input type="text" value={edu.school || ""} onChange={(e) => handleNestedFieldChange("education", index, "school", e.target.value)} placeholder="MIT" />
                      </div>
                      <div className="input-group">
                        <label className="input-label">Degree</label>
                        <input type="text" value={edu.degree || ""} onChange={(e) => handleNestedFieldChange("education", index, "degree", e.target.value)} placeholder="B.S." />
                      </div>
                      <div className="input-group">
                        <label className="input-label">Field of Study</label>
                        <input type="text" value={edu.fieldOfStudy || ""} onChange={(e) => handleNestedFieldChange("education", index, "fieldOfStudy", e.target.value)} placeholder="Computer Science" />
                      </div>
                      <div className="input-group">
                        <label className="input-label">Graduation Date</label>
                        <input type="text" value={edu.endDate || ""} onChange={(e) => handleNestedFieldChange("education", index, "endDate", e.target.value)} placeholder="May 2024" />
                      </div>
                      <div className="input-group field-full">
                        <label className="input-label">Honors / Description</label>
                        <textarea value={edu.description || ""} onChange={(e) => handleNestedFieldChange("education", index, "description", e.target.value)} placeholder="Honors, Thesis details, relevant coursework..." />
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* AI OPTIMIZER TAB */}
        {activeTab === "optimize" && (
          <div className="animate-fade-in">
            <h3 style={{ marginBottom: "8px" }}>ATS Job Match Analyzer</h3>
            <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: "16px" }}>
              Paste your target job description below. The AI will evaluate how well your resume matches, identify missing keywords, and suggest improvements.
            </p>

            <div className="input-group field-full" style={{ marginBottom: "16px" }}>
              <textarea 
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder="Paste the target Job Description description here..."
                style={{ minHeight: "150px" }}
              />
            </div>

            <button 
              className="btn btn-primary" 
              onClick={runAtsOptimizer}
              disabled={optimizerLoading || !jobDescription.trim()}
              style={{ width: "100%", marginBottom: "24px" }}
            >
              {optimizerLoading ? "🔄 Simulating Matcher..." : "⚡ Analyze Match Score"}
            </button>

            {optimizerResult && (
              <div className="animate-fade-in">
                <div className="optimizer-score-radial glass-panel">
                  <div className="radial-circle" style={{
                    borderRadius: "50%",
                    background: `conic-gradient(var(--accent-color) ${optimizerResult.matchScore}%, var(--border-color) 0)`
                  }}>
                    <div style={{
                      width: "68px",
                      height: "68px",
                      borderRadius: "50%",
                      background: "var(--bg-secondary)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center"
                    }}>
                      <span className="radial-text">{optimizerResult.matchScore}%</span>
                    </div>
                  </div>
                  <div>
                    <h4 style={{ marginBottom: "4px" }}>Compatibility Rating</h4>
                    <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>
                      {optimizerResult.matchScore >= 80 ? "🔥 Exceptional match score!" : 
                       optimizerResult.matchScore >= 60 ? "📈 Solid alignment. Add key skills to boost." : 
                       "⚠️ Significant gap detected. Tailor resume keywords."}
                    </p>
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "20px" }}>
                  <div className="glass-panel" style={{ padding: "16px" }}>
                    <h4 style={{ fontSize: "0.85rem", marginBottom: "10px", color: "var(--success-color)" }}>✅ Overlapping Skills</h4>
                    {optimizerResult.matchingSkills?.length === 0 ? (
                      <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", fontStyle: "italic" }}>No key overlapping skills found.</span>
                    ) : (
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                        {optimizerResult.matchingSkills?.map((s, i) => (
                          <span key={i} style={{ background: "rgba(16,185,129,0.15)", color: "var(--success-color)", border: "1px solid rgba(16,185,129,0.2)", borderRadius: "4px", padding: "2px 6px", fontSize: "0.75rem" }}>
                            {s}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="glass-panel" style={{ padding: "16px" }}>
                    <h4 style={{ fontSize: "0.85rem", marginBottom: "10px", color: "var(--warning-color)" }}>🚨 Missing Target Terms</h4>
                    {optimizerResult.missingKeywords?.length === 0 ? (
                      <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", fontStyle: "italic" }}>No major missing keywords found.</span>
                    ) : (
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                        {optimizerResult.missingKeywords?.map((s, i) => (
                          <span key={i} style={{ background: "rgba(245,158,11,0.15)", color: "var(--warning-color)", border: "1px solid rgba(245,158,11,0.2)", borderRadius: "4px", padding: "2px 6px", fontSize: "0.75rem" }}>
                            {s}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <h4 style={{ marginBottom: "12px" }}>Optimization Recommendations</h4>
                {optimizerResult.suggestions?.map((sug, i) => (
                  <div key={i} className={`suggestion-card ${sug.type || "info"}`}>
                    <span style={{ fontSize: "1.1rem" }}>
                      {sug.type === "warning" ? "⚠️" : sug.type === "success" ? "✅" : "💡"}
                    </span>
                    <div>
                      <strong style={{ fontSize: "0.8rem", textTransform: "uppercase", display: "block", marginBottom: "2px" }}>
                        Section: {sug.field}
                      </strong>
                      <span>{sug.message}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="form-footer">
        <button 
          className="btn btn-secondary" 
          disabled={activeTab === "basics"}
          onClick={() => {
            const tabs = ["basics", "experience", "projects", "skills", "optimize"];
            const prevIndex = tabs.indexOf(activeTab) - 1;
            setActiveTab(tabs[prevIndex]);
          }}
        >
          Previous Section
        </button>
        
        <button 
          className="btn btn-primary" 
          disabled={activeTab === "optimize"}
          onClick={() => {
            const tabs = ["basics", "experience", "projects", "skills", "optimize"];
            const nextIndex = tabs.indexOf(activeTab) + 1;
            setActiveTab(tabs[nextIndex]);
          }}
        >
          Next Section
        </button>
      </div>

      {/* AI POLISH GLASSMORPHIC MODAL */}
      {aiModal.isOpen && (
        <div className="modal-overlay animate-fade-in">
          <div className="modal-content glass-panel" style={{ background: "var(--bg-secondary)", border: "1px solid var(--border-color)" }}>
            <div className="modal-header">
              <h3 style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span>✨</span> AI Resume Assistant
              </h3>
              <div className="modal-close" onClick={() => setAiModal(prev => ({ ...prev, isOpen: false }))}>×</div>
            </div>

            <div style={{ marginBottom: "16px" }}>
              <label className="input-label" style={{ marginBottom: "8px", display: "block" }}>Select Optimization Goal</label>
              <div className="tone-selector">
                {activeTones.map((t) => (
                  <div 
                    key={t.id} 
                    className={`tone-card ${aiModal.instruction === t.id ? "active" : ""}`}
                    onClick={() => setAiModal(prev => ({ ...prev, instruction: t.id }))}
                  >
                    {t.name}
                  </div>
                ))}
              </div>

              {aiModal.instruction === "custom" && (
                <div className="input-group animate-fade-in" style={{ marginTop: "12px" }}>
                  <label className="input-label">Custom Command</label>
                  <input 
                    type="text" 
                    value={aiModal.customInstruction}
                    onChange={(e) => setAiModal(prev => ({ ...prev, customInstruction: e.target.value }))}
                    placeholder="e.g. Highlight cloud architecture projects and Docker skills..." 
                  />
                </div>
              )}
            </div>

            <div className="ai-diff-container">
              <div className="input-group">
                <label className="input-label">Original Text</label>
                <div className="ai-diff-box ai-diff-original" style={{ opacity: 0.8, color: "var(--text-secondary)" }}>
                  {aiModal.originalText || "(No text supplied)"}
                </div>
              </div>

              {aiModal.isLoading && (
                <div className="shimmer" style={{ height: "100px", borderRadius: "var(--radius-md)", marginTop: "8px" }}></div>
              )}

              {aiModal.enhancedText && (
                <div className="input-group animate-fade-in">
                  <label className="input-label" style={{ color: "var(--success-color)" }}>✨ AI Enhancement Suggested</label>
                  <div className="ai-diff-box ai-diff-new">
                    {aiModal.enhancedText}
                  </div>
                </div>
              )}
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", marginTop: "24px" }}>
              <button 
                className="btn btn-secondary"
                onClick={() => setAiModal(prev => ({ ...prev, isOpen: false }))}
              >
                Cancel
              </button>

              <button 
                className="btn btn-primary"
                onClick={handleEnhance}
                disabled={aiModal.isLoading || !aiModal.originalText.trim()}
              >
                {aiModal.isLoading ? "🤖 Thinking..." : aiModal.enhancedText ? "Regenerate" : "Optimize Text"}
              </button>

              {aiModal.enhancedText && (
                <button 
                  className="btn btn-primary"
                  onClick={applyAiEnhancement}
                  style={{ background: "var(--success-color)", boxShadow: "0 4px 12px rgba(16, 185, 129, 0.3)" }}
                >
                  Apply to Field
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default ResumeForm;