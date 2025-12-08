// src/lib/supabaseClient.js
import { createClient } from "@supabase/supabase-js";

const getEnvVar = (key, defaultValue) => {
  // Prefer Vite-provided build-time vars (import.meta.env)
  try {
    if (import.meta?.env) {
      const v = import.meta.env[key];
      if (v !== undefined && v !== null && v !== "") return v;
    }
  } catch (e) {
    // import.meta may not be available in some runtimes, ignore
  }

  // Runtime / Node build-time envs (useful for server-side builds or Vercel settings without VITE_ prefix)
  try {
    if (typeof globalThis !== "undefined" && globalThis.process?.env) {
      const v = globalThis.process.env[key];
      if (v !== undefined && v !== null && v !== "") return v;
    }
  } catch (e) {
    // ignore
  }

  return defaultValue;
};

// Try both VITE_ prefixed vars (for Vite builds) and common non-prefixed names (used in some host UIs)
const supabaseUrl =
  getEnvVar("VITE_SUPABASE_URL") || getEnvVar("SUPABASE_URL") || "http://127.0.0.1:54321";
const isLocalSupabase = /^(https?:\/\/)?(localhost|127\.0\.0\.1)(:\d+)?/.test(
  supabaseUrl || ""
);

const defaultAnonKey = isLocalSupabase
  ? "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0"
  : undefined;

// Accept a few common env names so misconfigured Vercel envs are easier to diagnose.
const rawAnonKey =
  getEnvVar("VITE_SUPABASE_ANON_KEY") ||
  getEnvVar("SUPABASE_ANON_KEY") ||
  getEnvVar("SUPABASE_PUBLISHABLE_KEY") ||
  defaultAnonKey;

const supabaseAnonKey = rawAnonKey ? rawAnonKey.trim() : undefined;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Supabase not configured: missing URL or anon key.\n  - Expected env vars: VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY (for client builds).\n  - On Vercel: add project vars with those exact names and redeploy.\n  - If you accidentally set a server-only key (SERVICE_ROLE), rotate it immediately.");
  // Throw to fail fast and make the error visible in build/runtime logs.
  throw new Error("Supabase environment misconfiguration: missing URL or anon key. See console for details.");
}

if (getEnvVar("SUPABASE_PUBLISHABLE_KEY") && !getEnvVar("VITE_SUPABASE_ANON_KEY")) {
  console.warn(
    "Using SUPABASE_PUBLISHABLE_KEY as a fallback for VITE_SUPABASE_ANON_KEY.\n  This may work depending on your Supabase project configuration, but it's recommended to set `VITE_SUPABASE_ANON_KEY` explicitly and rebuild the app."
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
