import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import AuthScreen from "./AuthScreen";

export default function AuthGate({ children }) {
  const [user, setUser] = useState(null);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function loadUser() {
      try {
        const user = await base44.auth.me();
        if (!isMounted) return;
        setUser(user || null);
      } catch (error) {
        console.error("Failed to load user:", error);
        setUser(null);
      } finally {
        setInitializing(false);
      }
    }

    loadUser();

    // NOTE: base44.auth currently provides synchronous helpers like `me()`.
    // If you need real-time auth state subscriptions, extend the base44 client
    // with an `onAuthStateChange` wrapper that proxies Supabase events.

    return () => {
      isMounted = false;
    };
  }, []);

  if (initializing) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#050816",
          color: "#e5e7eb",
          fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
        }}
      >
        Loading your studio...
      </div>
    );
  }

  if (!user) {
    return <AuthScreen />;
  }

  // When logged in, render the real app
  return children;
}
