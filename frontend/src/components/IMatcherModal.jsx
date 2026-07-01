import React, { useState, useRef, useCallback } from "react";
import { matchUploadResume } from "../api/resumeApi";

function IMatcherModal({ onClose }) {
  const [file, setFile] = useState(null);
  const [jobDescription, setJobDescription] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);
  const [step, setStep] = useState(1); // 1 = upload+JD, 2 = results
  const fileInputRef = useRef(null);

  const ACCEPTED = [".pdf", ".docx", ".txt"];

  const getFileExt = (name) => name.slice(name.lastIndexOf(".")).toLowerCase();

  const validateFile = (f) => {
    if (!f) return "No file selected.";
    if (f.size > 5 * 1024 * 1024) return "File is too large (max 5 MB).";
    if (!ACCEPTED.includes(getFileExt(f.name)))
      return "Only PDF, DOCX, and TXT files are accepted.";
    return null;
  };

  const handleFileSelect = (f) => {
    const err = validateFile(f);
    if (err) { setError(err); return; }
    setError("");
    setFile(f);
    setResult(null);
    setStep(1);
  };

  const onDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFileSelect(f);
  }, []);

  const onDragOver = (e) => { e.preventDefault(); setIsDragging(true); };
  const onDragLeave = () => setIsDragging(false);

  const handleInputChange = (e) => {
    const f = e.target.files[0];
    if (f) handleFileSelect(f);
  };

  const handleRunMatch = async () => {
    if (!file) { setError("Please upload your resume first."); return; }
    if (!jobDescription.trim()) { setError("Please paste a job description."); return; }
    setError("");
    setIsLoading(true);
    setResult(null);

    try {
      const data = await matchUploadResume(file, jobDescription);
      setResult(data);
      setStep(2);
    } catch (err) {
      const msg = err?.response?.data?.message || "Failed to analyze. Please try again.";
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setJobDescription("");
    setResult(null);
    setError("");
    setStep(1);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const scoreColor =
    result?.matchScore >= 80
      ? "var(--success-color)"
      : result?.matchScore >= 60
      ? "var(--warning-color)"
      : "var(--danger-color)";

  const fileIcon = (name) => {
    const ext = getFileExt(name);
    if (ext === ".pdf") return "📄";
    if (ext === ".docx") return "📝";
    return "📃";
  };

  return (
    <div
      className="modal-overlay animate-fade-in imatcher-overlay"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="imatcher-modal glass-panel">
        {/* ── Header ── */}
        <div className="imatcher-header">
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div className="imatcher-logo">🎯</div>
            <div>
              <h2 style={{ margin: 0, fontSize: "1.3rem", fontWeight: 800 }}>iMatcher</h2>
              <p style={{ margin: 0, fontSize: "0.8rem", color: "var(--text-secondary)" }}>
                Upload any resume · Match against a job description
              </p>
            </div>
          </div>
          <button
            className="modal-close"
            onClick={onClose}
            style={{ fontSize: "1.4rem", lineHeight: 1 }}
            aria-label="Close"
          >
            ×
          </button>
        </div>

        {/* ── Step Indicator ── */}
        <div className="imatcher-steps">
          <div className={`imatcher-step ${step >= 1 ? "active" : ""}`}>
            <span>1</span> Upload Resume
          </div>
          <div className="imatcher-step-line" />
          <div className={`imatcher-step ${step >= 2 ? "active" : ""}`}>
            <span>2</span> Match Results
          </div>
        </div>

        <div className="imatcher-body">
          {step === 1 && (
            <div className="animate-fade-in">
              {/* ── Drag & Drop Zone ── */}
              <div
                className={`imatcher-dropzone ${isDragging ? "dragging" : ""} ${file ? "has-file" : ""}`}
                onDrop={onDrop}
                onDragOver={onDragOver}
                onDragLeave={onDragLeave}
                onClick={() => fileInputRef.current?.click()}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === "Enter" && fileInputRef.current?.click()}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.docx,.txt"
                  onChange={handleInputChange}
                  style={{ display: "none" }}
                  id="imatcher-file-input"
                />

                {file ? (
                  <div className="imatcher-file-info">
                    <span style={{ fontSize: "2.5rem" }}>{fileIcon(file.name)}</span>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: "0.95rem" }}>{file.name}</div>
                      <div style={{ fontSize: "0.78rem", color: "var(--text-secondary)", marginTop: "2px" }}>
                        {(file.size / 1024).toFixed(1)} KB · Click to change
                      </div>
                    </div>
                    <div className="imatcher-file-badge">✓ Ready</div>
                  </div>
                ) : (
                  <>
                    <div style={{ fontSize: "3rem", marginBottom: "12px" }}>📂</div>
                    <div style={{ fontWeight: 700, fontSize: "1rem", marginBottom: "6px" }}>
                      {isDragging ? "Drop your resume here!" : "Drag & drop your resume"}
                    </div>
                    <div style={{ fontSize: "0.82rem", color: "var(--text-secondary)", marginBottom: "16px" }}>
                      or click to browse from your device
                    </div>
                    <div className="imatcher-format-badges">
                      <span>PDF</span><span>DOCX</span><span>TXT</span>
                    </div>
                    <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "10px" }}>
                      Max 5 MB
                    </div>
                  </>
                )}
              </div>

              {/* ── Job Description ── */}
              <div className="input-group field-full" style={{ marginTop: "20px" }}>
                <label className="input-label" style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                  📋 Target Job Description
                </label>
                <textarea
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  placeholder="Paste the full job description here — the more detail, the better the match analysis..."
                  style={{ minHeight: "160px", resize: "vertical" }}
                />
                {jobDescription && (
                  <span style={{ fontSize: "0.74rem", color: "var(--text-muted)", marginTop: "4px", display: "block" }}>
                    {jobDescription.split(/\s+/).filter(Boolean).length} words
                  </span>
                )}
              </div>

              {error && (
                <div className="imatcher-error animate-fade-in">
                  ⚠️ {error}
                </div>
              )}

              {/* ── Actions ── */}
              <div style={{ display: "flex", gap: "12px", marginTop: "20px" }}>
                <button className="btn btn-secondary" onClick={onClose}>
                  Cancel
                </button>
                <button
                  className="btn btn-primary imatcher-run-btn"
                  onClick={handleRunMatch}
                  disabled={isLoading || !file || !jobDescription.trim()}
                  style={{ flex: 1 }}
                >
                  {isLoading ? (
                    <span className="imatcher-loading-text">
                      <span className="imatcher-spinner" />
                      Analyzing your resume...
                    </span>
                  ) : (
                    "⚡ Run AI Match Analysis"
                  )}
                </button>
              </div>
            </div>
          )}

          {step === 2 && result && (
            <div className="animate-fade-in">
              {/* ── Score Radial ── */}
              <div className="optimizer-score-radial glass-panel" style={{ marginBottom: "20px" }}>
                <div
                  className="radial-circle"
                  style={{
                    borderRadius: "50%",
                    background: `conic-gradient(${scoreColor} ${result.matchScore}%, var(--border-color) 0)`,
                  }}
                >
                  <div
                    style={{
                      width: "68px", height: "68px", borderRadius: "50%",
                      background: "var(--bg-secondary)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}
                  >
                    <span className="radial-text">{result.matchScore}%</span>
                  </div>
                </div>
                <div>
                  <h4 style={{ marginBottom: "4px" }}>Compatibility Rating</h4>
                  <p style={{ fontSize: "0.82rem", color: "var(--text-secondary)" }}>
                    {result.matchScore >= 80
                      ? "🔥 Exceptional match score! You're a top candidate."
                      : result.matchScore >= 60
                      ? "📈 Solid alignment. Add key skills to boost your score."
                      : "⚠️ Significant gap detected. Tailor your resume keywords."}
                  </p>
                  {result.fallback && (
                    <span style={{ fontSize: "0.72rem", color: "var(--text-muted)", fontStyle: "italic" }}>
                      (Keyword-matching mode — add a Gemini API key for AI-powered analysis)
                    </span>
                  )}
                </div>
              </div>

              {/* ── File badge ── */}
              {file && (
                <div style={{ marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ fontSize: "1.1rem" }}>{fileIcon(file.name)}</span>
                  <span style={{ fontSize: "0.82rem", color: "var(--text-secondary)" }}>
                    Analyzed: <strong>{file.name}</strong>
                  </span>
                </div>
              )}

              {/* ── Skills Grid ── */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "20px" }}>
                <div className="glass-panel" style={{ padding: "16px" }}>
                  <h4 style={{ fontSize: "0.85rem", marginBottom: "10px", color: "var(--success-color)" }}>
                    ✅ Overlapping Skills
                  </h4>
                  {result.matchingSkills?.length === 0 ? (
                    <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", fontStyle: "italic" }}>
                      No key overlapping skills found.
                    </span>
                  ) : (
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                      {result.matchingSkills?.map((s, i) => (
                        <span key={i} className="imatcher-chip imatcher-chip-match">{s}</span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="glass-panel" style={{ padding: "16px" }}>
                  <h4 style={{ fontSize: "0.85rem", marginBottom: "10px", color: "var(--warning-color)" }}>
                    🚨 Missing Keywords
                  </h4>
                  {result.missingKeywords?.length === 0 ? (
                    <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", fontStyle: "italic" }}>
                      No major missing keywords!
                    </span>
                  ) : (
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                      {result.missingKeywords?.map((s, i) => (
                        <span key={i} className="imatcher-chip imatcher-chip-missing">{s}</span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* ── Suggestions ── */}
              <h4 style={{ marginBottom: "12px" }}>Optimization Recommendations</h4>
              {result.suggestions?.map((sug, i) => (
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

              {/* ── Re-run / Close ── */}
              <div style={{ display: "flex", gap: "12px", marginTop: "24px" }}>
                <button className="btn btn-secondary" onClick={handleReset} style={{ flex: 1 }}>
                  🔄 Match Another Resume
                </button>
                <button className="btn btn-primary" onClick={onClose} style={{ flex: 1 }}>
                  Done
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default IMatcherModal;
