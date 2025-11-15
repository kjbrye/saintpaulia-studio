import React, { useState, useEffect } from "react";
import { ArrowUp } from "lucide-react";

export default function BackToTop({ threshold = 400 }) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.pageYOffset > threshold) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener("scroll", toggleVisibility);

    return () => {
      window.removeEventListener("scroll", toggleVisibility);
    };
  }, [threshold]);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  };

  return (
    <button
      onClick={scrollToTop}
      className={`fixed bottom-8 right-8 z-50 glass-button w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300 hover:scale-110 ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8 pointer-events-none"
      }`}
      style={{ 
        color: "var(--accent)",
        boxShadow: "0 8px 24px rgba(168, 159, 239, 0.3)"
      }}
      aria-label="Back to top"
    >
      <ArrowUp className="w-5 h-5" style={{ strokeWidth: 2.5 }} />
    </button>
  );
}