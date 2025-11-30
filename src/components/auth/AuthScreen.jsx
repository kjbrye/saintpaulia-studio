import React, { useState } from "react";
import { base44 } from "@/api/base44Client";

// Botanical theme colors from Layout.jsx
const theme = {
  textPrimary: "#2f352e",
  textSecondary: "#4a5247",
  textMuted: "#6c7469",
  accentPrimary: "#b48b68",
  accentSecondary: "#d6c7ad",
  accentGlow: "#f0e2c8",
  glassCardBg: "linear-gradient(145deg, rgba(129, 139, 126, 0.82) 0%, rgba(111, 121, 110, 0.78) 100%)",
  glassCardBorder: "rgba(255, 255, 255, 0.55)",
  glassCardShadow: "16px 22px 36px rgba(58, 65, 55, 0.45), -10px -12px 20px rgba(255, 255, 255, 0.25), 0 4px 8px rgba(0, 0, 0, 0.15)",
  glassInputBg: "linear-gradient(135deg, rgba(129, 139, 126, 0.58) 0%, rgba(111, 121, 110, 0.52) 100%)",
  glassInputBorder: "rgba(255, 255, 255, 0.4)",
  glassInputShadow: "inset 0 2px 4px rgba(38, 44, 36, 0.25)",
  glassInputFocusBorder: "rgba(180, 139, 104, 0.55)",
  glassInputFocusShadow: "0 0 0 4px rgba(180, 139, 104, 0.25), inset 0 1px 2px rgba(38, 44, 36, 0.2)",
  glassAccentBg: "linear-gradient(145deg, rgba(180, 139, 104, 0.9) 0%, rgba(150, 114, 82, 0.88) 100%)",
  glassAccentBorder: "rgba(255, 237, 213, 0.7)",
  glassAccentShadow: "0 14px 28px rgba(77, 57, 39, 0.42), 0 4px 8px rgba(0, 0, 0, 0.15)",
  glassAccentHoverShadow: "0 18px 38px rgba(77, 57, 39, 0.5), 0 0 48px rgba(180, 139, 104, 0.5), 0 6px 12px rgba(0, 0, 0, 0.18)",
};

export default function AuthScreen() {
  const [mode, setMode] = useState("signin"); // "signin" | "signup"
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [focusedInput, setFocusedInput] = useState(null);
  const [isButtonHovered, setIsButtonHovered] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      if (mode === "signup") {
        // TODO: implement proper email/password signup in base44.auth if needed.
        // For now, use the dev login flow as a placeholder.
        await base44.auth.login("dev");
        setMessage("Sign-up simulated for dev flow. Check CLAUDE.md for auth setup.");
      } else {
        // TODO: implement email/password login in base44.auth or call a server endpoint.
        await base44.auth.login("dev");
        // On success, base44 updates the session; AuthGate will react on next mount.
      }
    } catch (err) {
      console.error(err);
      setMessage(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  async function handleForgotPassword() {
    if (!email) {
      setMessage("Please enter your email address first.");
      return;
    }
    setLoading(true);
    setMessage("");

    try {
      // Password reset is not yet routed through base44.auth in this SDK.
      // Leave a clear message and TODO for future implementation.
      console.warn("Password reset is not yet implemented via base44.auth");
      setMessage("Password reset feature coming soon. Please contact support.");
      return;
    } catch (err) {
      console.error(err);
      setMessage(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  const inputStyle = (inputName) => ({
    padding: "0.65rem 0.9rem",
    borderRadius: "0.6rem",
    border: `1.5px solid ${focusedInput === inputName ? theme.glassInputFocusBorder : theme.glassInputBorder}`,
    background: theme.glassInputBg,
    color: theme.textPrimary,
    fontSize: "0.95rem",
    fontFamily: "'Inter', sans-serif",
    outline: "none",
    boxShadow: focusedInput === inputName ? theme.glassInputFocusShadow : theme.glassInputShadow,
    transition: "all 0.2s ease",
    backdropFilter: "blur(8px)",
  });

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(rgba(255,255,255,0.3), rgba(255,255,255,0.3)), url('/background.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
        fontFamily: "'Inter', sans-serif",
      }}
    >
      {/* Decorative botanical flourish */}
      <div
        style={{
          position: "absolute",
          top: "5%",
          left: "50%",
          transform: "translateX(-50%)",
          width: "120px",
          height: "60px",
          opacity: 0.4,
          background: `radial-gradient(ellipse, ${theme.accentPrimary} 0%, transparent 70%)`,
          filter: "blur(20px)",
        }}
      />

      <div
        style={{
          width: "100%",
          maxWidth: 420,
          padding: "2.5rem",
          borderRadius: "1.25rem",
          background: theme.glassCardBg,
          boxShadow: theme.glassCardShadow,
          border: `2px solid ${theme.glassCardBorder}`,
          backdropFilter: "blur(24px) brightness(1.03) saturate(1.25)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Inner glow effect */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "80px",
            background: "linear-gradient(to bottom, rgba(255,255,255,0.15) 0%, transparent 100%)",
            borderRadius: "1.25rem 1.25rem 0 0",
            pointerEvents: "none",
          }}
        />

        <h1
          style={{
            fontSize: "1.8rem",
            marginBottom: "0.5rem",
            color: theme.textPrimary,
            fontFamily: "'Playfair Display', serif",
            fontWeight: 600,
            textShadow: "0 2px 8px rgba(58, 65, 55, 0.35), 0 1px 3px rgba(0, 0, 0, 0.25)",
            position: "relative",
          }}
        >
          Saintpaulia Studio
        </h1>
        <p
          style={{
            marginBottom: "1.75rem",
            color: theme.textSecondary,
            fontSize: "0.95rem",
            lineHeight: 1.5,
          }}
        >
          {mode === "signin"
            ? "Welcome back to your African violet studio."
            : "Create an account to start tracking your violets."}
        </p>

        <form onSubmit={handleSubmit} style={{ display: "grid", gap: "1rem" }}>
          <label style={{ display: "grid", gap: "0.35rem" }}>
            <span
              style={{
                fontSize: "0.85rem",
                fontWeight: 500,
                color: theme.textSecondary,
                letterSpacing: "0.02em",
              }}
            >
              Email
            </span>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onFocus={() => setFocusedInput("email")}
              onBlur={() => setFocusedInput(null)}
              placeholder="your@email.com"
              style={inputStyle("email")}
            />
          </label>

          <label style={{ display: "grid", gap: "0.35rem" }}>
            <span
              style={{
                fontSize: "0.85rem",
                fontWeight: 500,
                color: theme.textSecondary,
                letterSpacing: "0.02em",
              }}
            >
              Password
            </span>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onFocus={() => setFocusedInput("password")}
              onBlur={() => setFocusedInput(null)}
              placeholder="Enter your password"
              style={inputStyle("password")}
            />
          </label>

          {mode === "signin" && (
            <button
              type="button"
              onClick={handleForgotPassword}
              disabled={loading}
              style={{
                background: "none",
                border: "none",
                color: theme.textMuted,
                fontSize: "0.85rem",
                cursor: loading ? "default" : "pointer",
                fontFamily: "'Inter', sans-serif",
                textAlign: "right",
                padding: 0,
                marginTop: "-0.5rem",
                transition: "color 0.2s ease",
                opacity: loading ? 0.6 : 1,
              }}
              onMouseEnter={(e) => !loading && (e.target.style.color = theme.accentPrimary)}
              onMouseLeave={(e) => e.target.style.color = theme.textMuted}
            >
              Forgot password?
            </button>
          )}

          <button
            type="submit"
            disabled={loading}
            onMouseEnter={() => setIsButtonHovered(true)}
            onMouseLeave={() => setIsButtonHovered(false)}
            style={{
              marginTop: "0.75rem",
              padding: "0.75rem 1rem",
              borderRadius: "0.75rem",
              border: `2px solid ${theme.glassAccentBorder}`,
              cursor: loading ? "default" : "pointer",
              fontWeight: 600,
              fontSize: "1rem",
              fontFamily: "'Inter', sans-serif",
              background: theme.glassAccentBg,
              color: "#fff",
              textShadow: "0 1px 2px rgba(77, 57, 39, 0.4)",
              boxShadow: isButtonHovered && !loading ? theme.glassAccentHoverShadow : theme.glassAccentShadow,
              transition: "all 0.25s ease",
              transform: isButtonHovered && !loading ? "translateY(-1px)" : "translateY(0)",
              opacity: loading ? 0.7 : 1,
              letterSpacing: "0.02em",
            }}
          >
            {loading
              ? "Working..."
              : mode === "signin"
              ? "Log in"
              : "Create account"}
          </button>
        </form>

        {message && (
          <p
            style={{
              marginTop: "1rem",
              fontSize: "0.85rem",
              color: message.includes("Check your email") ? theme.accentPrimary : "#8b5a3c",
              padding: "0.75rem",
              borderRadius: "0.5rem",
              background: "rgba(180, 139, 104, 0.15)",
              border: "1px solid rgba(180, 139, 104, 0.3)",
            }}
          >
            {message}
          </p>
        )}

        {/* Decorative divider */}
        <div
          style={{
            margin: "1.5rem 0 1rem",
            height: "1px",
            background: "linear-gradient(90deg, rgba(184, 115, 51, 0) 0%, rgba(184, 115, 51, 0.5) 50%, rgba(184, 115, 51, 0) 100%)",
          }}
        />

        <button
          type="button"
          onClick={() => {
            setMode(mode === "signin" ? "signup" : "signin");
            setMessage("");
          }}
          style={{
            width: "100%",
            background: "none",
            border: "none",
            color: "#FFFFFF",
            fontSize: "0.9rem",
            cursor: "pointer",
            fontFamily: "'Inter', sans-serif",
            fontWeight: 500,
            transition: "color 0.2s ease",
          }}
          onMouseEnter={(e) => e.target.style.color = "rgba(255, 255, 255, 0.8)"}
          onMouseLeave={(e) => e.target.style.color = "#FFFFFF"}
        >
          {mode === "signin"
            ? "Need an account? Sign up"
            : "Already have an account? Log in"}
        </button>
      </div>
    </div>
  );
}
