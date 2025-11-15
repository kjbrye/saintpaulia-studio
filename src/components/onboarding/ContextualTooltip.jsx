import React, { useEffect, useState } from "react";
import { X, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function ContextualTooltip({ 
  id,
  title, 
  description, 
  position = "bottom", 
  children,
  onDismiss,
  actionText,
  onAction,
  delay = 500
}) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, delay);

    return () => clearTimeout(timer);
  }, [delay]);

  const handleDismiss = () => {
    setIsVisible(false);
    setTimeout(() => {
      onDismiss?.(id);
    }, 300);
  };

  const handleAction = () => {
    onAction?.();
    handleDismiss();
  };

  const positionClasses = {
    top: "bottom-full mb-3 left-1/2 -translate-x-1/2",
    bottom: "top-full mt-3 left-1/2 -translate-x-1/2",
    left: "right-full mr-3 top-1/2 -translate-y-1/2",
    right: "left-full ml-3 top-1/2 -translate-y-1/2",
    "top-left": "bottom-full mb-3 right-0",
    "top-right": "bottom-full mb-3 left-0",
    "bottom-left": "top-full mt-3 right-0",
    "bottom-right": "top-full mt-3 left-0"
  };

  const arrowClasses = {
    top: "top-full left-1/2 -translate-x-1/2 border-l-8 border-r-8 border-t-8 border-transparent",
    bottom: "bottom-full left-1/2 -translate-x-1/2 border-l-8 border-r-8 border-b-8 border-transparent",
    left: "left-full top-1/2 -translate-y-1/2 border-t-8 border-b-8 border-l-8 border-transparent",
    right: "right-full top-1/2 -translate-y-1/2 border-t-8 border-b-8 border-r-8 border-transparent",
    "top-left": "top-full right-4 border-l-8 border-r-8 border-t-8 border-transparent",
    "top-right": "top-full left-4 border-l-8 border-r-8 border-t-8 border-transparent",
    "bottom-left": "bottom-full right-4 border-l-8 border-r-8 border-b-8 border-transparent",
    "bottom-right": "bottom-full left-4 border-l-8 border-r-8 border-b-8 border-transparent"
  };

  const arrowBorderColor = {
    top: "border-t-[rgba(227,201,255,0.95)]",
    bottom: "border-b-[rgba(227,201,255,0.95)]",
    left: "border-l-[rgba(227,201,255,0.95)]",
    right: "border-r-[rgba(227,201,255,0.95)]",
    "top-left": "border-t-[rgba(227,201,255,0.95)]",
    "top-right": "border-t-[rgba(227,201,255,0.95)]",
    "bottom-left": "border-b-[rgba(227,201,255,0.95)]",
    "bottom-right": "border-b-[rgba(227,201,255,0.95)]"
  };

  return (
    <div className="relative inline-block">
      {children}
      
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: position.includes('bottom') ? -10 : 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: position.includes('bottom') ? -10 : 10 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className={`absolute z-[100] w-72 ${positionClasses[position]}`}
          >
            {/* Arrow */}
            <div 
              className={`absolute w-0 h-0 ${arrowClasses[position]} ${arrowBorderColor[position]}`}
              style={{
                filter: "drop-shadow(0 -2px 4px rgba(32, 24, 51, 0.2))"
              }}
            />
            
            {/* Tooltip Content */}
            <div 
              className="rounded-2xl p-5 backdrop-blur-xl relative"
              style={{
                background: "linear-gradient(135deg, rgba(227, 201, 255, 0.95) 0%, rgba(168, 159, 239, 0.92) 100%)",
                border: "1px solid rgba(255, 255, 255, 0.3)",
                boxShadow: "0 8px 32px rgba(32, 24, 51, 0.6), 0 0 0 1px rgba(227, 201, 255, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.3)"
              }}
            >
              <button
                onClick={handleDismiss}
                className="absolute top-3 right-3 w-6 h-6 rounded-lg flex items-center justify-center transition-all hover:bg-white/20"
                style={{ color: "#4C3575" }}
              >
                <X className="w-4 h-4" style={{ strokeWidth: 2.5 }} />
              </button>

              <div className="pr-6">
                <h3 className="text-base font-bold mb-2" style={{ 
                  color: "#2D1B4E",
                  fontFamily: "'Playfair Display', Georgia, serif"
                }}>
                  {title}
                </h3>
                <p className="text-sm leading-relaxed mb-3" style={{ color: "#4C3575" }}>
                  {description}
                </p>

                {actionText && (
                  <button
                    onClick={handleAction}
                    className="w-full px-4 py-2 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all hover:scale-[1.02]"
                    style={{
                      background: "rgba(255, 255, 255, 0.9)",
                      border: "1px solid rgba(255, 255, 255, 0.5)",
                      color: "#6B46C1",
                      boxShadow: "0 2px 8px rgba(32, 24, 51, 0.2)"
                    }}
                  >
                    <span>{actionText}</span>
                    <ChevronRight className="w-4 h-4" style={{ strokeWidth: 2.5 }} />
                  </button>
                )}
              </div>

              {/* Pulse animation border */}
              <div 
                className="absolute inset-0 rounded-2xl pointer-events-none"
                style={{
                  animation: "pulse-border 2s ease-in-out infinite",
                  background: "linear-gradient(135deg, rgba(255, 255, 255, 0.3) 0%, rgba(255, 255, 255, 0.1) 100%)",
                  maskImage: "linear-gradient(black, black) content-box, linear-gradient(black, black)",
                  maskComposite: "exclude",
                  WebkitMaskComposite: "xor",
                  padding: "1px"
                }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        @keyframes pulse-border {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.6; }
        }
      `}</style>
    </div>
  );
}