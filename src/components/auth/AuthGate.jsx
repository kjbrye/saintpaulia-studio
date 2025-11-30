import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import AuthScreen from "./AuthScreen";

export default function AuthGate({ children }) {
  const [user, setUser] = useState(null);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function loadUser() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!isMounted) return;
      setUser(user || null);
      setInitializing(false);
    }

    loadUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!isMounted) return;
      setUser(session?.user ?? null);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
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
