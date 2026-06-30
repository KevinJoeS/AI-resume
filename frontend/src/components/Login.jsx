import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const { login, register, continueAsGuest } = useAuth();

  const [mode, setMode] = useState("login"); // "login" | "register"
  const [formData, setFormData] = useState({ fullName: "", email: "", password: "", confirmPassword: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
  };

  const validate = () => {
    if (mode === "register") {
      if (!formData.fullName.trim()) return "Please enter your full name.";
      if (formData.password.length < 6) return "Password must be at least 6 characters.";
      if (formData.password !== formData.confirmPassword) return "Passwords do not match.";
    }
    if (!formData.email.includes("@")) return "Please enter a valid email address.";
    if (!formData.password) return "Password is required.";
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationError = validate();
    if (validationError) { setError(validationError); return; }

    setLoading(true);
    setError("");
    setSuccessMsg("");

    try {
      if (mode === "login") {
        await login(formData.email, formData.password);
      } else {
        await register(formData.fullName, formData.email, formData.password);
        setSuccessMsg("Account created! Signing you in...");
      }
    } catch (err) {
      const msg = err?.response?.data?.message || "Something went wrong. Please try again.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const switchMode = (newMode) => {
    setMode(newMode);
    setError("");
    setSuccessMsg("");
    setFormData({ fullName: "", email: "", password: "", confirmPassword: "" });
  };

  return (
    <div style={styles.pageWrapper}>
      {/* Animated background blobs */}
      <div style={styles.blob1} />
      <div style={styles.blob2} />
      <div style={styles.blob3} />

      <div style={styles.container}>
        {/* Left Panel — Branding */}
        <div style={styles.leftPanel}>
          <div style={styles.logoRow}>
            <div style={styles.logoIcon}>AI</div>
            <span style={styles.logoText}>Resume Builder</span>
          </div>
          <h1 style={styles.tagline}>
            Craft resumes that get you hired.
          </h1>
          <p style={styles.taglineSub}>
            AI-powered suggestions, ATS optimization, and beautiful templates — all in one place.
          </p>

          <div style={styles.featureList}>
            {[
              { icon: "✨", text: "AI-powered text enhancement" },
              { icon: "🎯", text: "ATS job match analyzer" },
              { icon: "📄", text: "3 premium resume templates" },
              { icon: "💾", text: "Cloud-saved to your account" },
            ].map((feat, i) => (
              <div key={i} style={styles.featureItem}>
                <span style={styles.featureIcon}>{feat.icon}</span>
                <span style={styles.featureText}>{feat.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right Panel — Auth Form */}
        <div style={styles.rightPanel}>
          {/* Mode Toggle */}
          <div style={styles.modeToggle}>
            <button
              style={{ ...styles.toggleBtn, ...(mode === "login" ? styles.toggleBtnActive : {}) }}
              onClick={() => switchMode("login")}
            >
              Sign In
            </button>
            <button
              style={{ ...styles.toggleBtn, ...(mode === "register" ? styles.toggleBtnActive : {}) }}
              onClick={() => switchMode("register")}
            >
              Register
            </button>
          </div>

          <h2 style={styles.formTitle}>
            {mode === "login" ? "Welcome back 👋" : "Create your account"}
          </h2>
          <p style={styles.formSubtitle}>
            {mode === "login"
              ? "Sign in to access your saved resumes."
              : "Join thousands building better resumes with AI."}
          </p>

          <form onSubmit={handleSubmit} style={styles.form} noValidate>
            {/* Full Name — Register only */}
            {mode === "register" && (
              <div style={styles.fieldWrapper} className="auth-field-animate">
                <label style={styles.label}>Full Name</label>
                <div style={styles.inputWrap}>
                  <span style={styles.inputIcon}>👤</span>
                  <input
                    id="auth-fullName"
                    type="text"
                    name="fullName"
                    placeholder="John Doe"
                    value={formData.fullName}
                    onChange={handleChange}
                    style={styles.input}
                    autoComplete="name"
                  />
                </div>
              </div>
            )}

            {/* Email */}
            <div style={styles.fieldWrapper}>
              <label style={styles.label}>Email Address</label>
              <div style={styles.inputWrap}>
                <span style={styles.inputIcon}>✉️</span>
                <input
                  id="auth-email"
                  type="email"
                  name="email"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  style={styles.input}
                  autoComplete="email"
                />
              </div>
            </div>

            {/* Password */}
            <div style={styles.fieldWrapper}>
              <label style={styles.label}>Password</label>
              <div style={styles.inputWrap}>
                <span style={styles.inputIcon}>🔒</span>
                <input
                  id="auth-password"
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder={mode === "register" ? "Min. 6 characters" : "Enter password"}
                  value={formData.password}
                  onChange={handleChange}
                  style={{ ...styles.input, paddingRight: "48px" }}
                  autoComplete={mode === "login" ? "current-password" : "new-password"}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={styles.eyeBtn}
                  tabIndex={-1}
                >
                  {showPassword ? "🙈" : "👁️"}
                </button>
              </div>
            </div>

            {/* Confirm Password — Register only */}
            {mode === "register" && (
              <div style={styles.fieldWrapper} className="auth-field-animate">
                <label style={styles.label}>Confirm Password</label>
                <div style={styles.inputWrap}>
                  <span style={styles.inputIcon}>🔒</span>
                  <input
                    id="auth-confirmPassword"
                    type={showPassword ? "text" : "password"}
                    name="confirmPassword"
                    placeholder="Re-enter password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    style={styles.input}
                    autoComplete="new-password"
                  />
                </div>
              </div>
            )}

            {/* Error / Success Messages */}
            {error && (
              <div style={styles.errorBox}>
                <span>⚠️</span> {error}
              </div>
            )}
            {successMsg && (
              <div style={styles.successBox}>
                <span>✅</span> {successMsg}
              </div>
            )}

            {/* Submit */}
            <button
              id="auth-submit-btn"
              type="submit"
              disabled={loading}
              style={{ ...styles.submitBtn, opacity: loading ? 0.7 : 1 }}
            >
              {loading ? (
                <span style={styles.spinnerRow}>
                  <span style={styles.spinner} />
                  {mode === "login" ? "Signing in..." : "Creating account..."}
                </span>
              ) : (
                mode === "login" ? "Sign In →" : "Create Account →"
              )}
            </button>
          </form>

          {/* Divider */}
          <div style={styles.divider}>
            <span style={styles.dividerLine} />
            <span style={styles.dividerText}>or</span>
            <span style={styles.dividerLine} />
          </div>

          {/* Guest */}
          <button
            id="auth-guest-btn"
            onClick={continueAsGuest}
            style={styles.guestBtn}
          >
            Continue as Guest (no account needed)
          </button>

          {/* Switch mode link */}
          <p style={styles.switchText}>
            {mode === "login" ? "Don't have an account? " : "Already have an account? "}
            <span
              style={styles.switchLink}
              onClick={() => switchMode(mode === "login" ? "register" : "login")}
            >
              {mode === "login" ? "Register free" : "Sign in"}
            </span>
          </p>
        </div>
      </div>

      <style>{`
        @keyframes blobFloat1 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -20px) scale(1.05); }
          66% { transform: translate(-20px, 10px) scale(0.95); }
        }
        @keyframes blobFloat2 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(-25px, 20px) scale(1.08); }
          66% { transform: translate(20px, -15px) scale(0.92); }
        }
        @keyframes blobFloat3 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(15px, 25px) scale(1.06); }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .auth-field-animate {
          animation: slideUp 0.3s ease forwards;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = {
  pageWrapper: {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #090d16 0%, #0f172a 50%, #1e0533 100%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "24px",
    position: "relative",
    overflow: "hidden",
    fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif",
  },
  blob1: {
    position: "absolute",
    top: "-120px",
    left: "-100px",
    width: "500px",
    height: "500px",
    borderRadius: "50%",
    background: "radial-gradient(circle, rgba(99,102,241,0.25) 0%, transparent 70%)",
    animation: "blobFloat1 8s ease-in-out infinite",
    pointerEvents: "none",
  },
  blob2: {
    position: "absolute",
    bottom: "-80px",
    right: "-80px",
    width: "450px",
    height: "450px",
    borderRadius: "50%",
    background: "radial-gradient(circle, rgba(168,85,247,0.22) 0%, transparent 70%)",
    animation: "blobFloat2 10s ease-in-out infinite",
    pointerEvents: "none",
  },
  blob3: {
    position: "absolute",
    top: "50%",
    right: "30%",
    width: "300px",
    height: "300px",
    borderRadius: "50%",
    background: "radial-gradient(circle, rgba(56,189,248,0.12) 0%, transparent 70%)",
    animation: "blobFloat3 12s ease-in-out infinite",
    pointerEvents: "none",
  },
  container: {
    display: "flex",
    width: "100%",
    maxWidth: "960px",
    minHeight: "600px",
    borderRadius: "24px",
    overflow: "hidden",
    boxShadow: "0 30px 80px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.06)",
    position: "relative",
    zIndex: 1,
  },
  // Left branding panel
  leftPanel: {
    flex: 1,
    background: "linear-gradient(145deg, rgba(99,102,241,0.15) 0%, rgba(168,85,247,0.1) 100%)",
    backdropFilter: "blur(20px)",
    borderRight: "1px solid rgba(255,255,255,0.07)",
    padding: "48px 40px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    color: "#f8fafc",
  },
  logoRow: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    marginBottom: "40px",
  },
  logoIcon: {
    width: "40px",
    height: "40px",
    borderRadius: "10px",
    background: "linear-gradient(135deg, #6366f1, #a855f7)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "800",
    fontSize: "1.1rem",
    color: "white",
    boxShadow: "0 4px 14px rgba(99,102,241,0.4)",
  },
  logoText: {
    fontSize: "1.3rem",
    fontWeight: "700",
    background: "linear-gradient(135deg, #818cf8, #c084fc)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
  },
  tagline: {
    fontSize: "2rem",
    fontWeight: "800",
    lineHeight: "1.2",
    marginBottom: "16px",
    letterSpacing: "-0.5px",
    color: "#f1f5f9",
  },
  taglineSub: {
    fontSize: "0.95rem",
    color: "#94a3b8",
    lineHeight: "1.6",
    marginBottom: "36px",
  },
  featureList: {
    display: "flex",
    flexDirection: "column",
    gap: "14px",
  },
  featureItem: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },
  featureIcon: {
    fontSize: "1.15rem",
    width: "32px",
    height: "32px",
    borderRadius: "8px",
    background: "rgba(255,255,255,0.05)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  featureText: {
    fontSize: "0.9rem",
    color: "#cbd5e1",
  },
  // Right form panel
  rightPanel: {
    width: "420px",
    flexShrink: 0,
    background: "rgba(15,23,42,0.85)",
    backdropFilter: "blur(24px)",
    padding: "48px 40px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
  },
  modeToggle: {
    display: "flex",
    background: "rgba(255,255,255,0.04)",
    borderRadius: "10px",
    padding: "4px",
    marginBottom: "28px",
    border: "1px solid rgba(255,255,255,0.06)",
  },
  toggleBtn: {
    flex: 1,
    padding: "9px 16px",
    border: "none",
    borderRadius: "8px",
    background: "transparent",
    color: "#64748b",
    fontWeight: "600",
    fontSize: "0.9rem",
    cursor: "pointer",
    transition: "all 0.2s ease",
    fontFamily: "inherit",
  },
  toggleBtnActive: {
    background: "linear-gradient(135deg, #6366f1, #a855f7)",
    color: "white",
    boxShadow: "0 2px 10px rgba(99,102,241,0.4)",
  },
  formTitle: {
    fontSize: "1.6rem",
    fontWeight: "800",
    color: "#f1f5f9",
    marginBottom: "6px",
    letterSpacing: "-0.4px",
  },
  formSubtitle: {
    fontSize: "0.85rem",
    color: "#64748b",
    marginBottom: "28px",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
  fieldWrapper: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },
  label: {
    fontSize: "0.8rem",
    fontWeight: "600",
    color: "#94a3b8",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
  inputWrap: {
    position: "relative",
    display: "flex",
    alignItems: "center",
  },
  inputIcon: {
    position: "absolute",
    left: "14px",
    fontSize: "1rem",
    pointerEvents: "none",
    zIndex: 1,
  },
  input: {
    width: "100%",
    padding: "12px 16px 12px 42px",
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: "10px",
    color: "#f1f5f9",
    fontSize: "0.95rem",
    outline: "none",
    fontFamily: "inherit",
    boxSizing: "border-box",
    transition: "border-color 0.2s, box-shadow 0.2s",
  },
  eyeBtn: {
    position: "absolute",
    right: "12px",
    background: "transparent",
    border: "none",
    cursor: "pointer",
    fontSize: "1rem",
    padding: "4px",
    color: "#64748b",
    fontFamily: "inherit",
  },
  errorBox: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "10px 14px",
    background: "rgba(239,68,68,0.1)",
    border: "1px solid rgba(239,68,68,0.25)",
    borderRadius: "8px",
    color: "#fca5a5",
    fontSize: "0.85rem",
  },
  successBox: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "10px 14px",
    background: "rgba(16,185,129,0.1)",
    border: "1px solid rgba(16,185,129,0.25)",
    borderRadius: "8px",
    color: "#6ee7b7",
    fontSize: "0.85rem",
  },
  submitBtn: {
    padding: "13px 24px",
    background: "linear-gradient(135deg, #6366f1 0%, #a855f7 100%)",
    color: "white",
    border: "none",
    borderRadius: "10px",
    fontSize: "1rem",
    fontWeight: "700",
    cursor: "pointer",
    transition: "all 0.2s ease",
    fontFamily: "inherit",
    boxShadow: "0 4px 20px rgba(99,102,241,0.4)",
    marginTop: "4px",
  },
  spinnerRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "10px",
  },
  spinner: {
    display: "inline-block",
    width: "16px",
    height: "16px",
    border: "2px solid rgba(255,255,255,0.3)",
    borderTop: "2px solid white",
    borderRadius: "50%",
    animation: "spin 0.7s linear infinite",
  },
  divider: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    margin: "20px 0",
  },
  dividerLine: {
    flex: 1,
    height: "1px",
    background: "rgba(255,255,255,0.07)",
    display: "block",
  },
  dividerText: {
    fontSize: "0.8rem",
    color: "#475569",
  },
  guestBtn: {
    width: "100%",
    padding: "12px 24px",
    background: "transparent",
    color: "#94a3b8",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: "10px",
    fontSize: "0.9rem",
    fontWeight: "600",
    cursor: "pointer",
    fontFamily: "inherit",
    transition: "all 0.2s ease",
  },
  switchText: {
    textAlign: "center",
    fontSize: "0.85rem",
    color: "#475569",
    marginTop: "16px",
  },
  switchLink: {
    color: "#818cf8",
    cursor: "pointer",
    fontWeight: "700",
    textDecoration: "underline",
    textUnderlineOffset: "2px",
  },
};
