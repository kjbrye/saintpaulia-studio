import React, { useState } from "react";
import { supabase } from "../../lib/supabaseClient";

export default function AuthScreen() {
  const [mode, setMode] = useState("signin"); // "signin" | "signup"
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
        setMessage("Check your email to confirm your account, then log in.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        // On success, Supabase updates the session; our AuthGate will react.
      }
    } catch (err) {
      console.error(err);
      setMessage(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#050816",
        color: "#f5f5f5",
        fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 420,
          padding: "2rem",
          borderRadius: "1rem",
          background: "rgba(15, 23, 42, 0.95)",
          boxShadow: "0 20px 50px rgba(0,0,0,0.6)",
          border: "1px solid rgba(148, 163, 184, 0.4)",
        }}
      >
        <h1 style={{ fontSize: "1.6rem", marginBottom: "0.5rem" }}>
          Saintpaulia Studio
        </h1>
        <p style={{ marginBottom: "1.5rem", color: "#cbd5f5" }}>
          {mode === "signin"
            ? "Log in to your African violet studio."
            : "Create an account to start tracking your violets."}
        </p>

        <form onSubmit={handleSubmit} style={{ display: "grid", gap: "0.75rem" }}>
          <label style={{ display: "grid", gap: "0.25rem", fontSize: "0.9rem" }}>
            <span>Email</span>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{
                padding: "0.5rem 0.75rem",
                borderRadius: "0.5rem",
                border: "1px solid rgba(148, 163, 184, 0.6)",
                background: "rgba(15, 23, 42, 0.8)",
                color: "#f9fafb",
              }}
            />
          </label>

          <label style={{ display: "grid", gap: "0.25rem", fontSize: "0.9rem" }}>
            <span>Password</span>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{
                padding: "0.5rem 0.75rem",
                borderRadius: "0.5rem",
                border: "1px solid rgba(148, 163, 184, 0.6)",
                background: "rgba(15, 23, 42, 0.8)",
                color: "#f9fafb",
              }}
            />
          </label>

          <button
            type="submit"
            disabled={loading}
            style={{
              marginTop: "0.5rem",
              padding: "0.6rem 0.75rem",
              borderRadius: "0.75rem",
              border: "none",
              cursor: loading ? "default" : "pointer",
              fontWeight: 600,
              background:
                "linear-gradient(135deg, rgba(96, 165, 250, 0.9), rgba(129, 140, 248, 0.9))",
              color: "#0b1020",
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
              marginTop: "0.75rem",
              fontSize: "0.85rem",
              color: "#e5e7eb",
            }}
          >
            {message}
          </p>
        )}

        <button
          type="button"
          onClick={() => {
            setMode(mode === "signin" ? "signup" : "signin");
            setMessage("");
          }}
          style={{
            marginTop: "1rem",
            background: "none",
            border: "none",
            color: "#93c5fd",
            fontSize: "0.85rem",
            cursor: "pointer",
            textDecoration: "underline",
          }}
        >
          {mode === "signin"
            ? "Need an account? Sign up"
            : "Already have an account? Log in"}
        </button>
      </div>
    </div>
  );
}
