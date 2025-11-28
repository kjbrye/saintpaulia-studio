

import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { TooltipProvider } from "@/components/onboarding/TooltipManager";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { supabase } from "../lib/supabaseClient";

const THEMES = {
  glassmorphism: {
    name: "Studio Violet (Default)",
    description: "Ethereal glass effects with violet hues",
    background: "linear-gradient(rgba(255,255,255,0.3), rgba(255,255,255,0.3)), url('/background.png')",
    showFloatingFlowers: false,
    showLightSpots: false,
    floatingFlowerImage: "/background.png",

    // Text Colors
    textPrimary: "#2f352e",
    textSecondary: "#4a5247",
    textMuted: "#6c7469",
    textDark: "#11140f",

    // Accent Colors
    accentPrimary: "#b48b68",
    accentSecondary: "#d6c7ad",
    accentGlow: "#f0e2c8",

    // Glass/Neuro Surfaces - Crystal Glass Effect
    glassCardBg: "linear-gradient(145deg, rgba(129, 139, 126, 0.82) 0%, rgba(111, 121, 110, 0.78) 100%)",
    glassCardBorder: "rgba(255, 255, 255, 0.55)",
    glassCardShadow: "16px 22px 36px rgba(58, 65, 55, 0.45), -10px -12px 20px rgba(255, 255, 255, 0.25), 0 4px 8px rgba(0, 0, 0, 0.15)",

    glassButtonBg: "linear-gradient(135deg, rgba(129, 139, 126, 0.85) 0%, rgba(111, 121, 110, 0.82) 100%)",
    glassButtonBorder: "rgba(255, 255, 255, 0.58)",
    glassButtonShadow: "0 12px 24px rgba(58, 65, 55, 0.38), 0 4px 6px rgba(0, 0, 0, 0.12)",
    glassButtonHoverShadow: "0 16px 32px rgba(58, 65, 55, 0.48), 0 0 36px rgba(180, 139, 104, 0.4), 0 6px 12px rgba(0, 0, 0, 0.15)",

    glassAccentBg: "linear-gradient(145deg, rgba(180, 139, 104, 0.9) 0%, rgba(150, 114, 82, 0.88) 100%)",
    glassAccentBorder: "rgba(255, 237, 213, 0.7)",
    glassAccentShadow: "0 14px 28px rgba(77, 57, 39, 0.42), 0 4px 8px rgba(0, 0, 0, 0.15)",
    glassAccentHoverShadow: "0 18px 38px rgba(77, 57, 39, 0.5), 0 0 48px rgba(180, 139, 104, 0.5), 0 6px 12px rgba(0, 0, 0, 0.18)",

    glassAccentMossBg: "linear-gradient(145deg, rgba(129, 139, 126, 0.9) 0%, rgba(107, 116, 104, 0.88) 100%)",
    glassAccentMossBorder: "rgba(255, 255, 255, 0.65)",
    glassAccentMossShadow: "0 14px 28px rgba(58, 65, 55, 0.4), 0 4px 8px rgba(0, 0, 0, 0.12)",
    glassAccentMossHoverShadow: "0 18px 38px rgba(58, 65, 55, 0.48), 0 0 42px rgba(129, 139, 126, 0.5), 0 6px 12px rgba(0, 0, 0, 0.15)",

    glassInputBg: "linear-gradient(135deg, rgba(129, 139, 126, 0.58) 0%, rgba(111, 121, 110, 0.52) 100%)",
    glassInputBorder: "rgba(255, 255, 255, 0.4)",
    glassInputShadow: "inset 0 2px 4px rgba(38, 44, 36, 0.25)",
    glassInputFocusBg: "linear-gradient(135deg, rgba(129, 139, 126, 0.65) 0%, rgba(111, 121, 110, 0.6) 100%)",
    glassInputFocusBorder: "rgba(180, 139, 104, 0.55)",
    glassInputFocusShadow: "0 0 0 4px rgba(180, 139, 104, 0.25), inset 0 1px 2px rgba(38, 44, 36, 0.2)",
    glassInputPlaceholder: "rgba(90, 97, 88, 0.7)",

    // Neuro Surfaces
    neuroCardBg: "linear-gradient(145deg, rgba(129, 139, 126, 0.8) 0%, rgba(107, 116, 104, 0.76) 100%)",
    neuroCardShadow: "16px 16px 28px rgba(58, 65, 55, 0.35), -16px -16px 28px rgba(248, 246, 240, 0.35), inset 2px 2px 4px rgba(255, 255, 255, 0.25), inset -2px -2px 4px rgba(58, 65, 55, 0.18)",
    neuroCardBorder: "rgba(255, 255, 255, 0.48)",

    // Crystal Glass Navigation Buttons
    neuroButtonBg: "linear-gradient(145deg, rgba(255, 255, 255, 0.45) 0%, rgba(220, 230, 225, 0.38) 25%, rgba(180, 195, 188, 0.42) 50%, rgba(160, 175, 168, 0.48) 100%)",
    neuroButtonShadow: `
      0 8px 32px rgba(0, 0, 0, 0.25),
      0 2px 8px rgba(0, 0, 0, 0.15),
      inset 0 3px 6px rgba(255, 255, 255, 0.7),
      inset 0 -3px 8px rgba(80, 90, 85, 0.25),
      inset 3px 0 6px rgba(255, 255, 255, 0.4),
      inset -3px 0 6px rgba(80, 90, 85, 0.15),
      inset 0 1px 1px rgba(255, 255, 255, 0.9),
      0 1px 0 rgba(255, 255, 255, 0.6)
    `,
    neuroButtonBorder: "rgba(255, 255, 255, 0.7)",
    neuroButtonHoverShadow: `
      0 12px 40px rgba(0, 0, 0, 0.3),
      0 4px 12px rgba(0, 0, 0, 0.2),
      inset 0 4px 8px rgba(255, 255, 255, 0.8),
      inset 0 -4px 10px rgba(80, 90, 85, 0.3),
      inset 4px 0 8px rgba(255, 255, 255, 0.5),
      inset -4px 0 8px rgba(80, 90, 85, 0.2),
      inset 0 1px 2px rgba(255, 255, 255, 1),
      0 1px 0 rgba(255, 255, 255, 0.7),
      0 0 20px rgba(180, 139, 104, 0.3)
    `,
    neuroButtonActiveShadow: `
      inset 0 4px 12px rgba(80, 90, 85, 0.4),
      inset 0 -2px 6px rgba(255, 255, 255, 0.3),
      inset 2px 2px 8px rgba(80, 90, 85, 0.35),
      inset -2px -2px 8px rgba(255, 255, 255, 0.2),
      0 2px 8px rgba(0, 0, 0, 0.2)
    `,

    neuroInputBg: "linear-gradient(145deg, rgba(129, 139, 126, 0.7) 0%, rgba(107, 116, 104, 0.65) 100%)",
    neuroInputShadow: "inset 10px 10px 18px rgba(58, 65, 55, 0.35), inset -10px -10px 18px rgba(248, 246, 240, 0.25), inset 3px 3px 6px rgba(58, 65, 55, 0.28)",
    neuroInputBorder: "rgba(255, 255, 255, 0.45)",
    neuroInputFocusBorder: "rgba(180, 139, 104, 0.6)",
    neuroInputFocusShadow: "0 0 0 4px rgba(180, 139, 104, 0.22), inset 0 1px 2px rgba(38, 44, 36, 0.2)",
    neuroInputPlaceholder: "rgba(90, 97, 88, 0.7)",

    neuroAccentBg: "linear-gradient(145deg, rgba(180, 139, 104, 0.85) 0%, rgba(150, 114, 82, 0.8) 100%)",
    neuroAccentShadow: "16px 16px 32px rgba(77, 57, 39, 0.35), -16px -16px 32px rgba(248, 246, 240, 0.28), inset 3px 3px 6px rgba(255, 255, 255, 0.28), inset -2px -2px 4px rgba(77, 57, 39, 0.18), 0 2px 8px rgba(255, 237, 213, 0.18)",
    neuroAccentBorder: "rgba(255, 237, 213, 0.6)",
    neuroAccentHoverShadow: "20px 20px 40px rgba(77, 57, 39, 0.42), -20px -20px 40px rgba(248, 246, 240, 0.32), inset 3px 3px 6px rgba(255, 255, 255, 0.3), inset -2px -2px 4px rgba(77, 57, 39, 0.2), 0 4px 16px rgba(180, 139, 104, 0.35), 0 0 30px rgba(180, 139, 104, 0.35)",
    neuroAccentActiveShadow: "inset 10px 10px 20px rgba(77, 57, 39, 0.35), inset -10px -10px 20px rgba(248, 246, 240, 0.22), inset 3px 3px 6px rgba(77, 57, 39, 0.26)",

    // Misc
    dividerBg: "linear-gradient(90deg, rgba(255, 255, 255, 0) 0%, rgba(255, 237, 213, 0.5) 50%, rgba(255, 255, 255, 0) 100%)",
    dividerShadow: "0 1px 2px rgba(58, 65, 55, 0.08), 0 -1px 2px rgba(58, 65, 55, 0.04)",
    headingShadow: "0 2px 8px rgba(58, 65, 55, 0.35), 0 1px 3px rgba(0, 0, 0, 0.25)",
    backdropFilter: "blur(24px) brightness(1.03) saturate(1.25)",
    lightSpotGradient1: "radial-gradient(circle, rgba(255, 237, 213, 0.28) 0%, transparent 70%)",
    lightSpotGradient2: "radial-gradient(circle, rgba(180, 139, 104, 0.18) 0%, transparent 70%)",
    scrollbarTrackBg: "linear-gradient(135deg, rgba(111, 121, 110, 0.28) 0%, rgba(92, 101, 92, 0.22) 100%)",
    scrollbarThumbBg: "linear-gradient(135deg, rgba(180, 139, 104, 0.4) 0%, rgba(150, 114, 82, 0.35) 100%)",
    glassCardDarkBg: "linear-gradient(145deg, rgba(129, 139, 126, 0.85) 0%, rgba(107, 116, 104, 0.82) 100%)",
    glassCardDarkShadow: "14px 18px 32px rgba(58, 65, 55, 0.45), 0 4px 8px rgba(0, 0, 0, 0.15)",
    glassCardDarkBorder: "3px solid rgba(255, 255, 255, 0.55)",
    glowViolet: "rgba(129, 139, 126, 0.35)",
    glowVioletSoft: "rgba(129, 139, 126, 0.18)",
    glowMint: "rgba(180, 139, 104, 0.35)",
    glowMintSoft: "rgba(180, 139, 104, 0.18)",
    iconGradient: "linear-gradient(135deg, #818b7e 0%, #6b7568 100%)",
    iconGradientAlt: "linear-gradient(135deg, #b48b68 0%, #9a6f4d 100%)",
  },
  high_contrast: {
    name: "High Contrast",
    description: "Maximum readability with bold contrast",
    background: "#000000",
    showFloatingFlowers: false,
    showLightSpots: false,
    
    textPrimary: "#FFFFFF",
    textSecondary: "#FFFFFF",
    textMuted: "#E5E5E5",
    textDark: "#000000",
    
    accentPrimary: "#FFD700",
    accentSecondary: "#00FF00",
    accentGlow: "#FFD700",
    
    glassCardBg: "#000000",
    glassCardBorder: "#FFFFFF",
    glassCardShadow: "0 0 0 3px #FFD700",
    
    glassButtonBg: "#1A1A1A",
    glassButtonBorder: "#FFFFFF",
    glassButtonShadow: "none",
    glassButtonHoverBg: "#2D2D2D",
    glassButtonHoverBorder: "#FFD700",
    glassButtonHoverShadow: "0 0 30px #FFD700, 0 0 60px rgba(255, 215, 0, 0.5)",
    
    glassAccentBg: "#FFD700",
    glassAccentBorder: "#FFFFFF",
    glassAccentColor: "#000000",
    glassAccentShadow: "0 0 0 3px #FFD700",
    glassAccentHoverShadow: "0 0 0 3px #FFD700, 0 0 40px #FFD700, 0 0 80px rgba(255, 215, 0, 0.6)",
    
    glassAccentMossBg: "#00FF00",
    glassAccentMossBorder: "#FFFFFF",
    glassAccentMossColor: "#000000",
    glassAccentMossShadow: "0 0 0 3px #00FF00",
    glassAccentMossHoverShadow: "0 0 0 3px #00FF00, 0 0 40px #00FF00, 0 0 80px rgba(0, 255, 0, 0.5)",
    
    glassInputBg: "#000000",
    glassInputBorder: "#FFFFFF",
    glassInputShadow: "0 0 0 3px #FFD700",
    glassInputFocusBorder: "#FFD700",
    glassInputFocusShadow: "0 0 0 5px #FFD700",
    glassInputPlaceholder: "#CCCCCC",
    
    neuroCardBg: "#1A1A1A",
    neuroCardShadow: "16px 16px 32px #000000, -16px -16px 32px #555555",
    neuroCardBorder: "#FFFFFF",
    
    neuroButtonBg: "#1A1A1A",
    neuroButtonShadow: "10px 10px 20px #000000, -10px -10px 20px #555555",
    neuroButtonBorder: "#FFFFFF",
    neuroButtonHoverShadow: "12px 12px 24px #000000, -12px -12px 24px #666666, 0 0 30px #FFD700, 0 0 60px rgba(255, 215, 0, 0.3)",
    neuroButtonActiveShadow: "inset 8px 8px 16px #000000, inset -8px -8px 16px #333333",
    
    neuroInputBg: "#000000",
    neuroInputShadow: "inset 8px 8px 16px #000000, inset -8px -8px 16px #222222",
    neuroInputBorder: "#FFFFFF",
    neuroInputFocusBorder: "#FFD700",
    neuroInputFocusShadow: "inset 8px 8px 16px #000000, inset -8px -8px 16px #222222, 0 0 0 5px #FFD700",
    neuroInputPlaceholder: "#CCCCCC",
    
    neuroAccentBg: "linear-gradient(145deg, rgba(227, 201, 255, 0.4) 0%, rgba(168, 159, 239, 0.36) 100%)",
    neuroAccentShadow: "16px 16px 32px rgba(15, 10, 31, 0.5), -16px -16px 32px rgba(95, 79, 135, 0.4)",
    neuroAccentBorder: "rgba(227, 201, 255, 0.45)",
    
    dividerBg: "#FFFFFF",
    dividerShadow: "none",
    headingShadow: "none",
    backdropFilter: "none",
    scrollbarTrackBg: "#000000",
    scrollbarThumbBg: "#FFD700",
  },
  light: {
    name: "Light Mode",
    description: "Clean and bright workspace",
    background: "linear-gradient(135deg, #fffdf3 0%, #e7e7ff 50%, #deddff 100%)",
    showFloatingFlowers: false,
    showLightSpots: false,
    
    textPrimary: "#1a1a2e",
    textSecondary: "#2d2d45",
    textMuted: "#4a4a6a",
    textDark: "#0f0a1f",
    
    accentPrimary: "#bfbcfc",
    accentSecondary: "#f0cbdc",
    accentGlow: "#d1cfff",
    
    glassCardBg: "#fffdf3",
    glassCardBorder: "#e7e7ff",
    glassCardShadow: "0 4px 12px rgba(191, 188, 252, 0.15)",
    
    glassButtonBg: "#f9f8ff",
    glassButtonBorder: "#deddff",
    glassButtonShadow: "0 1px 3px rgba(191, 188, 252, 0.1)",
    glassButtonHoverBg: "#f3f2ff",
    glassButtonHoverShadow: "0 4px 12px rgba(191, 188, 252, 0.25), 0 0 24px rgba(191, 188, 252, 0.2), 0 0 48px rgba(191, 188, 252, 0.1)",
    
    glassAccentBg: "linear-gradient(135deg, #bfbcfc 0%, #d1cfff 100%)",
    glassAccentBorder: "#bfbcfc",
    glassAccentColor: "#FFFFFF",
    glassAccentShadow: "0 4px 12px rgba(191, 188, 252, 0.35)",
    glassAccentHoverShadow: "0 8px 24px rgba(191, 188, 252, 0.5), 0 0 40px rgba(191, 188, 252, 0.4), 0 0 80px rgba(191, 188, 252, 0.2)",
    
    glassAccentMossBg: "linear-gradient(135deg, #f0cbdc 0%, #f7e1e3 100%)",
    glassAccentMossBorder: "#f0cbdc",
    glassAccentMossColor: "#FFFFFF",
    glassAccentMossShadow: "0 4px 12px rgba(240, 203, 220, 0.35)",
    glassAccentMossHoverShadow: "0 8px 24px rgba(240, 203, 220, 0.5), 0 0 40px rgba(240, 203, 220, 0.4), 0 0 80px rgba(240, 203, 220, 0.2)",
    
    glassInputBg: "#FFFFFF",
    glassInputBorder: "#deddff",
    glassInputShadow: "inset 0 1px 2px rgba(191, 188, 252, 0.08)",
    glassInputFocusBorder: "#bfbcfc",
    glassInputFocusShadow: "0 0 0 3px rgba(191, 188, 252, 0.15)",
    glassInputPlaceholder: "#9db3c1",
    
    neuroCardBg: "linear-gradient(145deg, #fefeff 0%, #f9f8ff 100%)",
    neuroCardShadow: "18px 18px 36px rgba(200, 199, 230, 0.8), -18px -18px 36px rgba(255, 255, 255, 1), inset 3px 3px 6px rgba(255, 255, 255, 0.9), inset -2px -2px 4px rgba(200, 199, 230, 0.5)",
    neuroCardBorder: "rgba(222, 221, 255, 0.6)",
    
    neuroButtonBg: "linear-gradient(145deg, #fefeff 0%, #f9f8ff 100%)",
    neuroButtonShadow: "14px 14px 28px rgba(200, 199, 230, 0.7), -14px -14px 28px rgba(255, 255, 255, 1), inset 2px 2px 4px rgba(255, 255, 255, 0.95), inset -2px -2px 4px rgba(200, 199, 230, 0.4)",
    neuroButtonBorder: "rgba(222, 221, 255, 0.6)",
    neuroButtonHoverShadow: "16px 16px 32px rgba(200, 199, 230, 0.85), -16px -16px 32px rgba(255, 255, 255, 1), inset 2px 2px 4px rgba(255, 255, 255, 1), inset -2px -2px 4px rgba(200, 199, 230, 0.45), 0 0 24px rgba(191, 188, 252, 0.25)",
    neuroButtonActiveShadow: "inset 12px 12px 24px rgba(200, 199, 230, 0.75), inset -12px -12px 24px rgba(255, 255, 255, 0.5), inset 3px 3px 6px rgba(200, 199, 230, 0.65)",
    
    neuroInputBg: "linear-gradient(145deg, #f9f8ff 0%, #fefeff 100%)",
    neuroInputShadow: "inset 12px 12px 24px rgba(200, 199, 230, 0.75), inset -12px -12px 24px rgba(255, 255, 255, 0.95), inset 3px 3px 6px rgba(200, 199, 230, 0.65)",
    neuroInputBorder: "rgba(222, 221, 255, 0.6)",
    neuroInputFocusBorder: "#bfbcfc",
    neuroInputFocusShadow: "inset 12px 12px 24px rgba(200, 199, 230, 0.85), inset -12px -12px 24px rgba(255, 255, 255, 1), inset 3px 3px 6px rgba(200, 199, 230, 0.7), 0 0 0 4px rgba(191, 188, 252, 0.25), 0 2px 16px rgba(191, 188, 252, 0.35)",
    neuroInputPlaceholder: "#9db3c1",
    
    neuroAccentBg: "linear-gradient(145deg, #bfbcfc 0%, #d1cfff 100%)",
    neuroAccentShadow: "18px 18px 36px rgba(165, 162, 220, 0.7), -18px -18px 36px rgba(220, 218, 255, 0.5), inset 3px 3px 6px rgba(255, 255, 255, 0.45), inset -2px -2px 4px rgba(120, 118, 180, 0.4), 0 3px 12px rgba(191, 188, 252, 0.35)",
    neuroAccentBorder: "rgba(120, 118, 180, 0.6)",
    neuroAccentHoverShadow: "22px 22px 44px rgba(165, 162, 220, 0.85), -22px -22px 44px rgba(220, 218, 255, 0.6), inset 3px 3px 6px rgba(255, 255, 255, 0.5), inset -2px -2px 4px rgba(120, 118, 180, 0.45), 0 4px 20px rgba(191, 188, 252, 0.45), 0 0 32px rgba(191, 188, 252, 0.4), 0 0 60px rgba(191, 188, 252, 0.2)",
    neuroAccentActiveShadow: "inset 12px 12px 24px rgba(165, 162, 220, 0.7), inset -12px -12px 24px rgba(255, 255, 255, 0.35), inset 3px 3px 6px rgba(120, 118, 180, 0.5)",
    
    dividerBg: "linear-gradient(90deg, rgba(231, 231, 255, 0) 0%, rgba(231, 231, 255, 1) 50%, rgba(231, 231, 255, 0) 100%)",
    dividerShadow: "0 1px 2px rgba(191, 188, 252, 0.1)",
    headingShadow: "none",
    backdropFilter: "none",
    scrollbarTrackBg: "#f9f8ff",
    scrollbarThumbBg: "#d1cfff",
  },
  dark: {
    name: "Dark Mode",
    description: "Easy on the eyes in low light",
    background: "linear-gradient(135deg, #0F0A1F 0%, #1E1B2E 50%, #2D2640 100%)",
    showFloatingFlowers: false,
    showLightSpots: false,
    
    textPrimary: "#F9FAFB",
    textSecondary: "#E5E7EB",
    textMuted: "#D1D5DB",
    textDark: "#0F0A1F",
    
    accentPrimary: "#A78BFA",
    accentSecondary: "#34D399",
    accentGlow: "#8B5CF6",
    
    glassCardBg: "rgba(30, 27, 46, 0.95)",
    glassCardBorder: "rgba(167, 139, 250, 0.2)",
    glassCardShadow: "0 8px 32px rgba(0, 0, 0, 0.5)",
    
    glassButtonBg: "rgba(45, 38, 64, 0.8)",
    glassButtonBorder: "rgba(167, 139, 250, 0.25)",
    glassButtonShadow: "0 2px 8px rgba(0, 0, 0, 0.3)",
    glassButtonHoverBg: "rgba(60, 50, 85, 0.9)",
    glassButtonHoverShadow: "0 6px 20px rgba(167, 139, 250, 0.4), 0 0 32px rgba(167, 139, 250, 0.35), 0 0 64px rgba(167, 139, 250, 0.2)",
    
    glassAccentBg: "linear-gradient(135deg, rgba(167, 139, 250, 0.3) 0%, rgba(139, 92, 246, 0.25) 100%)",
    glassAccentBorder: "rgba(167, 139, 250, 0.5)",
    glassAccentShadow: "0 4px 20px rgba(167, 139, 250, 0.3)",
    glassAccentHoverShadow: "0 8px 32px rgba(167, 139, 250, 0.6), 0 0 48px rgba(167, 139, 250, 0.5), 0 0 96px rgba(167, 139, 250, 0.3)",
    
    glassAccentMossBg: "linear-gradient(135deg, rgba(52, 211, 153, 0.3) 0%, rgba(16, 185, 129, 0.25) 100%)",
    glassAccentMossBorder: "rgba(52, 211, 153, 0.5)",
    glassAccentMossShadow: "0 4px 20px rgba(52, 211, 153, 0.3)",
    glassAccentMossHoverShadow: "0 8px 32px rgba(52, 211, 153, 0.6), 0 0 48px rgba(52, 211, 153, 0.5), 0 0 96px rgba(52, 211, 153, 0.25)",
    
    glassInputBg: "rgba(15, 10, 31, 0.6)",
    glassInputBorder: "rgba(167, 139, 250, 0.3)",
    glassInputShadow: "inset 0 1px 2px rgba(0, 0, 0, 0.3)",
    glassInputFocusBorder: "rgba(167, 139, 250, 0.6)",
    glassInputFocusShadow: "0 0 0 3px rgba(167, 139, 250, 0.15)",
    glassInputPlaceholder: "#9CA3AF",
    
    neuroCardBg: "linear-gradient(145deg, rgba(30, 27, 46, 0.95) 0%, rgba(15, 10, 31, 0.98) 100%)",
    neuroCardShadow: "16px 16px 32px rgba(0, 0, 0, 0.6), -16px -16px 32px rgba(60, 50, 85, 0.3), inset 2px 2px 4px rgba(60, 50, 85, 0.2), inset -2px -2px 4px rgba(0, 0, 0, 0.25)",
    neuroCardBorder: "rgba(167, 139, 250, 0.2)",
    
    neuroButtonBg: "linear-gradient(145deg, rgba(30, 27, 46, 0.92) 0%, rgba(15, 10, 31, 0.96) 100%)",
    neuroButtonShadow: "12px 12px 24px rgba(0, 0, 0, 0.55), -12px -12px 24px rgba(60, 50, 85, 0.35), inset 1px 1px 2px rgba(60, 50, 85, 0.2), inset -1px -1px 2px rgba(0, 0, 0, 0.15)",
    neuroButtonBorder: "rgba(167, 139, 250, 0.25)",
    neuroButtonHoverShadow: "14px 14px 28px rgba(0, 0, 0, 0.65), -14px -14px 28px rgba(60, 50, 85, 0.45), inset 1px 1px 2px rgba(60, 50, 85, 0.25), inset -1px -1px 2px rgba(0, 0, 0, 0.18), 0 0 24px rgba(167, 139, 250, 0.25), 0 0 48px rgba(167, 139, 250, 0.12)",
    neuroButtonActiveShadow: "inset 10px 10px 20px rgba(0, 0, 0, 0.65), inset -10px -10px 20px rgba(60, 50, 85, 0.25), inset 3px 3px 6px rgba(0, 0, 0, 0.5)",
    
    neuroInputBg: "linear-gradient(145deg, rgba(15, 10, 31, 0.96) 0%, rgba(30, 27, 46, 0.92) 100%)",
    neuroInputShadow: "inset 10px 10px 20px rgba(0, 0, 0, 0.6), inset -10px -10px 20px rgba(60, 50, 85, 0.2), inset 3px 3px 6px rgba(0, 0, 0, 0.45)",
    neuroInputBorder: "rgba(167, 139, 250, 0.25)",
    neuroInputFocusBorder: "rgba(167, 139, 250, 0.7)",
    neuroInputFocusShadow: "inset 10px 10px 20px rgba(0, 0, 0, 0.65), inset -10px -10px 20px rgba(60, 50, 85, 0.25), inset 3px 3px 6px rgba(0, 0, 0, 0.5), 0 0 0 4px rgba(167, 139, 250, 0.25), 0 2px 12px rgba(167, 139, 250, 0.3)",
    neuroInputPlaceholder: "#9CA3AF",
    
    neuroAccentBg: "linear-gradient(145deg, rgba(167, 139, 250, 0.4) 0%, rgba(139, 92, 246, 0.36) 100%)",
    neuroAccentShadow: "16px 16px 32px rgba(0, 0, 0, 0.6), -16px -16px 32px rgba(60, 50, 85, 0.4), inset 3px 3px 6px rgba(167, 139, 250, 0.3), inset -2px -2px 4px rgba(0, 0, 0, 0.2), 0 2px 8px rgba(167, 139, 250, 0.18)",
    neuroAccentBorder: "rgba(167, 139, 250, 0.4)",
    neuroAccentHoverShadow: "20px 20px 40px rgba(0, 0, 0, 0.65), -20px -20px 40px rgba(60, 50, 85, 0.5), inset 3px 3px 6px rgba(167, 139, 250, 0.35), inset -2px -2px 4px rgba(0, 0, 0, 0.22), 0 4px 16px rgba(167, 139, 250, 0.25), 0 0 30px rgba(167, 139, 250, 0.35), 0 0 60px rgba(167, 139, 250, 0.18)",
    neuroAccentActiveShadow: "inset 10px 10px 20px rgba(0, 0, 0, 0.5), inset -10px -10px 20px rgba(60, 50, 85, 0.25)",
    
    dividerBg: "linear-gradient(90deg, rgba(227, 201, 255, 0) 0%, rgba(227, 201, 255, 0.3) 50%, rgba(227, 201, 255, 0) 100%)",
    dividerShadow: "0 1px 2px rgba(168, 159, 239, 0.1)",
    headingShadow: "0 2px 6px rgba(0, 0, 0, 0.6), 0 1px 3px rgba(0, 0, 0, 0.4)",
    backdropFilter: "blur(16px)",
    scrollbarTrackBg: "rgba(15, 10, 31, 0.6)",
    scrollbarThumbBg: "linear-gradient(135deg, rgba(167, 139, 250, 0.4) 0%, rgba(139, 92, 246, 0.35) 100%)",
  },
  nature: {
    name: "Nature Mode",
    description: "Earthy tones and soft low contrast",
    background: "linear-gradient(135deg, #556a58 0%, #8fa388 50%, #c9d6c4 100%)",
    showFloatingFlowers: true,
    showLightSpots: true,
    floatingFlowerImage: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/690e3cd78523fb5fba0a8466/b1ffb8df9_PlantLogos3.png",
    
    textPrimary: "#fefdfb",
    textSecondary: "#f5f7f3",
    textMuted: "#d8e4e1",
    textDark: "#68412f",
    
    accentPrimary: "#fbd8ca",
    accentSecondary: "#5a7a8b",
    accentGlow: "#8fa388",
    
    glassCardBg: "linear-gradient(135deg, rgba(143, 163, 136, 0.18) 0%, rgba(85, 106, 88, 0.12) 100%)",
    glassCardBorder: "rgba(143, 163, 136, 0.35)",
    glassCardShadow: "0 8px 32px rgba(85, 106, 88, 0.65), inset 0 1px 1px 0 rgba(255, 255, 255, 0.25)",
    
    glassButtonBg: "linear-gradient(135deg, rgba(143, 163, 136, 0.25) 0%, rgba(85, 106, 88, 0.18) 100%)",
    glassButtonBorder: "rgba(143, 163, 136, 0.4)",
    glassButtonShadow: "0 4px 16px rgba(85, 106, 88, 0.45), inset 0 1px 0.5px 0 rgba(255, 255, 255, 0.25)",
    glassButtonHoverShadow: "0 6px 24px rgba(143, 163, 136, 0.6), 0 0 36px rgba(143, 163, 136, 0.5), 0 0 72px rgba(143, 163, 136, 0.25), inset 0 1px 0.5px 0 rgba(255, 255, 255, 0.35)",
    
    glassAccentBg: "linear-gradient(135deg, rgba(251, 216, 202, 0.32) 0%, rgba(143, 163, 136, 0.25) 100%)",
    glassAccentBorder: "rgba(251, 216, 202, 0.55)",
    glassAccentShadow: "0 4px 20px 0 rgba(251, 216, 202, 0.5), inset 0 1px 0.5px 0 rgba(255, 255, 255, 0.3)",
    glassAccentHoverShadow: "0 8px 32px rgba(251, 216, 202, 0.8), 0 0 48px rgba(251, 216, 202, 0.6), 0 0 96px rgba(251, 216, 202, 0.35), inset 0 1px 0.5px 0 rgba(255, 255, 255, 0.4)",
    
    glassAccentMossBg: "linear-gradient(135deg, rgba(90, 122, 139, 0.32) 0%, rgba(168, 191, 201, 0.25) 100%)",
    glassAccentMossBorder: "rgba(90, 122, 139, 0.55)",
    glassAccentMossShadow: "0 4px 20px 0 rgba(90, 122, 139, 0.45), inset 0 1px 0.5px 0 rgba(255, 255, 255, 0.3)",
    glassAccentMossHoverShadow: "0 8px 32px rgba(90, 122, 139, 0.75), 0 0 48px rgba(90, 122, 139, 0.55), 0 0 96px rgba(90, 122, 139, 0.3), inset 0 1px 0.5px 0 rgba(255, 255, 255, 0.4)",
    
    glassInputBg: "linear-gradient(135deg, rgba(201, 214, 196, 0.12) 0%, rgba(233, 229, 219, 0.08) 100%)",
    glassInputBorder: "rgba(143, 163, 136, 0.35)",
    glassInputShadow: "inset 0 1px 2px rgba(85, 106, 88, 0.35)",
    glassInputFocusBorder: "rgba(251, 216, 202, 0.7)",
    glassInputFocusShadow: "0 0 0 3px rgba(251, 216, 202, 0.25)",
    glassInputPlaceholder: "rgba(168, 191, 201, 0.7)",
    
    neuroCardBg: "linear-gradient(145deg, rgba(85, 106, 88, 0.52) 0%, rgba(143, 163, 136, 0.48) 100%)",
    neuroCardShadow: "16px 16px 32px rgba(85, 106, 88, 0.55), -16px -16px 32px rgba(201, 214, 196, 0.4), inset 2px 2px 4px rgba(201, 214, 196, 0.25), inset -2px -2px 4px rgba(85, 106, 88, 0.22)",
    neuroCardBorder: "rgba(143, 163, 136, 0.3)",
    
    neuroButtonBg: "linear-gradient(145deg, rgba(85, 106, 88, 0.6) 0%, rgba(143, 163, 136, 0.55) 100%)",
    neuroButtonShadow: "12px 12px 24px rgba(85, 106, 88, 0.5), -12px -12px 24px rgba(201, 214, 196, 0.45), inset 1px 1px 2px rgba(201, 214, 196, 0.25), inset -1px -1px 2px rgba(85, 106, 88, 0.18)",
    neuroButtonBorder: "rgba(143, 163, 136, 0.35)",
    neuroButtonHoverShadow: "14px 14px 28px rgba(85, 106, 88, 0.6), -14px -14px 28px rgba(201, 214, 196, 0.55), inset 1px 1px 2px rgba(201, 214, 196, 0.3), inset -1px -1px 2px rgba(85, 106, 88, 0.2), 0 0 24px rgba(251, 216, 202, 0.3), 0 0 48px rgba(251, 216, 202, 0.15)",
    neuroButtonActiveShadow: "inset 10px 10px 20px rgba(85, 106, 88, 0.6), inset -10px -10px 20px rgba(201, 214, 196, 0.3), inset 3px 3px 6px rgba(85, 106, 88, 0.5)",
    
    neuroInputBg: "linear-gradient(145deg, rgba(85, 106, 88, 0.58) 0%, rgba(143, 163, 136, 0.52) 100%)",
    neuroInputShadow: "inset 10px 10px 20px rgba(85, 106, 88, 0.5), inset -10px -10px 20px rgba(201, 214, 196, 0.25), inset 3px 3px 6px rgba(85, 106, 88, 0.4)",
    neuroInputBorder: "rgba(143, 163, 136, 0.35)",
    neuroInputFocusBorder: "rgba(251, 216, 202, 0.8)",
    neuroInputFocusShadow: "inset 10px 10px 20px rgba(85, 106, 88, 0.55), inset -10px -10px 20px rgba(201, 214, 196, 0.3), inset 3px 3px 6px rgba(85, 106, 88, 0.45), 0 0 0 4px rgba(251, 216, 202, 0.3), 0 2px 12px rgba(251, 216, 202, 0.4)",
    neuroInputPlaceholder: "rgba(216, 228, 225, 0.8)",
    
    neuroAccentBg: "linear-gradient(145deg, rgba(251, 216, 202, 0.5) 0%, rgba(143, 163, 136, 0.45) 100%)",
    neuroAccentShadow: "16px 16px 32px rgba(85, 106, 88, 0.5), -16px -16px 32px rgba(201, 214, 196, 0.5), inset 3px 3px 6px rgba(251, 216, 202, 0.4), inset -2px -2px 4px rgba(85, 106, 88, 0.2), 0 2px 8px rgba(251, 216, 202, 0.2)",
    neuroAccentBorder: "rgba(251, 216, 202, 0.55)",
    neuroAccentHoverShadow: "20px 20px 40px rgba(85, 106, 88, 0.6), -20px -20px 40px rgba(201, 214, 196, 0.6), inset 3px 3px 6px rgba(251, 216, 202, 0.45), inset -2px -2px 4px rgba(85, 106, 88, 0.22), 0 4px 16px rgba(251, 216, 202, 0.28), 0 0 30px rgba(251, 216, 202, 0.4), 0 0 60px rgba(251, 216, 202, 0.22)",
    neuroAccentActiveShadow: "inset 10px 10px 20px rgba(85, 106, 88, 0.5), inset -10px -10px 20px rgba(201, 214, 196, 0.3)",
    
    dividerBg: "linear-gradient(90deg, rgba(143, 163, 136, 0) 0%, rgba(143, 163, 136, 0.4) 50%, rgba(143, 163, 136, 0) 100%)",
    dividerShadow: "0 1px 2px rgba(143, 163, 136, 0.15)",
    headingShadow: "0 2px 6px rgba(85, 106, 88, 0.35), 0 1px 2px rgba(0, 0, 0, 0.25)",
    backdropFilter: "blur(16px) brightness(1.05)",
    lightSpotGradient1: "radial-gradient(circle, rgba(251, 216, 202, 0.45) 0%, transparent 70%)",
    lightSpotGradient2: "radial-gradient(circle, rgba(143, 163, 136, 0.4) 0%, transparent 70%)",
    scrollbarTrackBg: "linear-gradient(135deg, rgba(85, 106, 88, 0.4) 0%, rgba(143, 163, 136, 0.3) 100%)",
    scrollbarThumbBg: "linear-gradient(135deg, rgba(251, 216, 202, 0.5) 0%, rgba(143, 163, 136, 0.45) 100%)",
  },
  minimal: {
    name: "Minimal",
    description: "Clean and distraction-free",
    background: "#FFFFFF",
    showFloatingFlowers: false,
    showLightSpots: false,
    
    textPrimary: "#111827",
    textSecondary: "#374151",
    textMuted: "#6B7280",
    textDark: "#111827",
    
    accentPrimary: "#6366F1",
    accentSecondary: "#10B981",
    accentGlow: "#4F46E5",
    
    glassCardBg: "#F9FAFB",
    glassCardBorder: "#E5E7EB",
    glassCardShadow: "0 1px 3px rgba(0, 0, 0, 0.05)",
    
    glassButtonBg: "#FFFFFF",
    glassButtonBorder: "#E5E7EB",
    glassButtonShadow: "0 1px 2px rgba(0, 0, 0, 0.04)",
    glassButtonHoverBg: "#F9FAFB",
    glassButtonHoverShadow: "0 4px 12px rgba(99, 102, 241, 0.15), 0 0 24px rgba(99, 102, 241, 0.1)",
    
    glassAccentBg: "#6366F1",
    glassAccentBorder: "#4F46E5",
    glassAccentColor: "#FFFFFF",
    glassAccentShadow: "0 2px 8px rgba(99, 102, 241, 0.3)",
    glassAccentHoverShadow: "0 6px 20px rgba(99, 102, 241, 0.5), 0 0 36px rgba(99, 102, 241, 0.4)",
    
    glassAccentMossBg: "#10B981",
    glassAccentMossBorder: "#059669",
    glassAccentMossColor: "#FFFFFF",
    glassAccentMossShadow: "0 2px 8px rgba(16, 185, 129, 0.3)",
    glassAccentMossHoverShadow: "0 6px 20px rgba(16, 185, 129, 0.5), 0 0 36px rgba(16, 185, 129, 0.3)",
    
    glassInputBg: "#FFFFFF",
    glassInputBorder: "#D1D5DB",
    glassInputShadow: "inset 0 1px 2px rgba(0, 0, 0, 0.05)",
    glassInputFocusBorder: "#6366F1",
    glassInputFocusShadow: "0 0 0 3px rgba(99, 102, 241, 0.1)",
    glassInputPlaceholder: "#9CA3AF",
    
    neuroCardBg: "#FFFFFF",
    neuroCardShadow: "12px 12px 24px rgba(209, 213, 219, 0.5), -12px -12px 24px rgba(255, 255, 255, 1)",
    neuroCardBorder: "rgba(229, 231, 235, 0.8)",
    
    neuroButtonBg: "#FFFFFF",
    neuroButtonShadow: "8px 8px 16px rgba(209, 213, 219, 0.5), -8px -8px 16px rgba(255, 255, 255, 1)",
    neuroButtonBorder: "rgba(229, 231, 235, 0.7)",
    neuroButtonHoverShadow: "10px 10px 20px rgba(209, 213, 219, 0.6), -10px -10px 20px rgba(255, 255, 255, 1), 0 0 16px rgba(99, 102, 241, 0.15)",
    neuroButtonActiveShadow: "inset 8px 8px 16px rgba(209, 213, 219, 0.6), inset -8px -8px 16px rgba(255, 255, 255, 0.6)",
    
    neuroInputBg: "#FFFFFF",
    neuroInputShadow: "inset 8px 8px 16px rgba(209, 213, 219, 0.6), inset -8px -8px 16px rgba(255, 255, 255, 1)",
    neuroInputBorder: "rgba(229, 231, 235, 0.7)",
    neuroInputFocusBorder: "#6366F1",
    neuroInputFocusShadow: "inset 8px 8px 16px rgba(209, 213, 219, 0.7), inset -8px -8px 16px rgba(255, 255, 255, 1), 0 0 0 4px rgba(99, 102, 241, 0.2)",
    neuroInputPlaceholder: "#9CA3AF",
    
    neuroAccentBg: "#6366F1",
    neuroAccentShadow: "12px 12px 24px rgba(99, 102, 241, 0.4), -12px -12px 24px rgba(99, 102, 241, 0.2)",
    neuroAccentBorder: "rgba(79, 70, 229, 0.5)",
    
    dividerBg: "linear-gradient(90deg, rgba(229, 231, 235, 0) 0%, rgba(229, 231, 235, 1) 50%, rgba(229, 231, 235, 0) 100%)",
    dividerShadow: "0 1px 2px rgba(0, 0, 0, 0.05)",
    headingShadow: "none",
    backdropFilter: "none",
    scrollbarTrackBg: "#F9FAFB",
    scrollbarThumbBg: "#D1D5DB",
  }
};

export default function Layout({ children }) {
  const [currentTheme, setCurrentTheme] = useState("glassmorphism");

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me().catch(() => null),
  });

  useEffect(() => {
    if (user?.theme) {
      setCurrentTheme(user.theme);
    }
  }, [user]);
const handleLogout = async () => {
  console.log("Logout button clicked");

  const { error } = await supabase.auth.signOut();

  if (error) {
    console.error("Error during sign out:", error);
    alert("Sign-out error: " + error.message);
    return;
  }

  // Force AuthGate to re-check the session
  window.location.reload();
};

  const theme = THEMES[currentTheme] || THEMES.glassmorphism;

  return (
    <TooltipProvider>
    <div className="min-h-screen relative overflow-hidden flex flex-col" style={{
        background: theme.background,
        backgroundSize: '100% auto',
        backgroundAttachment: 'fixed',
        backgroundPosition: 'top center',
        backgroundRepeat: 'no-repeat'
      }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@500;600;700;800;900&family=Inter:wght@300;400;500;600;700&display=swap');

        :root {
          --text-primary: ${theme.textPrimary};
          --text-secondary: ${theme.textSecondary};
          --text-muted: ${theme.textMuted};
          --text-dark: ${theme.textDark};
          --accent: ${theme.accentPrimary};
          --accent-secondary: ${theme.accentSecondary};
          --accent-glow: ${theme.accentGlow};
          
          --glass-card-bg: ${theme.glassCardBg};
          --glass-card-border: ${theme.glassCardBorder};
          --glass-card-shadow: ${theme.glassCardShadow};
          
          --glass-button-bg: ${theme.glassButtonBg};
          --glass-button-border: ${theme.glassButtonBorder};
          --glass-button-shadow: ${theme.glassButtonShadow};
          --glass-button-hover-shadow: ${theme.glassButtonHoverShadow};
          
          --glass-accent-bg: ${theme.glassAccentBg};
          --glass-accent-border: ${theme.glassAccentBorder};
          --glass-accent-shadow: ${theme.glassAccentShadow};
          --glass-accent-hover-shadow: ${theme.glassAccentHoverShadow};
          
          --glass-accent-moss-bg: ${theme.glassAccentMossBg};
          --glass-accent-moss-border: ${theme.glassAccentMossBorder};
          --glass-accent-moss-shadow: ${theme.glassAccentMossShadow};
          --glass-accent-moss-hover-shadow: ${theme.glassAccentMossHoverShadow};
          
          --glass-input-bg: ${theme.glassInputBg};
          --glass-input-border: ${theme.glassInputBorder};
          --glass-input-shadow: ${theme.glassInputShadow};
          --glass-input-focus-border: ${theme.glassInputFocusBorder};
          --glass-input-focus-shadow: ${theme.glassInputFocusShadow};
          --glass-input-placeholder: ${theme.glassInputPlaceholder};
          
          --neuro-card-bg: ${theme.neuroCardBg};
          --neuro-card-shadow: ${theme.neuroCardShadow};
          --neuro-card-border: ${theme.neuroCardBorder};
          
          --neuro-button-bg: ${theme.neuroButtonBg};
          --neuro-button-shadow: ${theme.neuroButtonShadow};
          --neuro-button-border: ${theme.neuroButtonBorder};
          --neuro-button-hover-shadow: ${theme.neuroButtonHoverShadow};
          --neuro-button-active-shadow: ${theme.neuroButtonActiveShadow};
          
          --neuro-input-bg: ${theme.neuroInputBg};
          --neuro-input-shadow: ${theme.neuroInputShadow};
          --neuro-input-border: ${theme.neuroInputBorder};
          --neuro-input-focus-border: ${theme.neuroInputFocusBorder};
          --neuro-input-focus-shadow: ${theme.neuroInputFocusShadow};
          --neuro-input-placeholder: ${theme.neuroInputPlaceholder};
          
          --neuro-accent-bg: ${theme.neuroAccentBg};
          --neuro-accent-shadow: ${theme.neuroAccentShadow};
          --neuro-accent-border: ${theme.neuroAccentBorder};
          --neuro-accent-hover-shadow: ${theme.neuroAccentHoverShadow};
          --neuro-accent-active-shadow: ${theme.neuroAccentActiveShadow};
          
          --divider-bg: ${theme.dividerBg};
          --divider-shadow: ${theme.dividerShadow};
          --heading-shadow: ${theme.headingShadow};
          --backdrop-filter: ${theme.backdropFilter};
        }

        * {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
          letter-spacing: 0.02em;
        }

        h1, h2, h3, h4, h5, h6 {
          font-family: 'Playfair Display', Georgia, serif;
          font-weight: 700;
          letter-spacing: 0.01em;
          line-height: 1.3;
          text-shadow: var(--heading-shadow);
        }

        h1 { font-size: 2.25rem; font-weight: 800; }
        h2 { font-size: 1.5rem; font-weight: 700; }
        h3 { font-size: 1.25rem; font-weight: 700; }

        body {
          background: ${theme.background};
          background-attachment: fixed;
        }

        ${theme.showFloatingFlowers ? `
        /* Floating Flowers Animation */
        @keyframes float1 {
          0%, 100% { transform: translate(0, 0) rotate(0deg); opacity: 0.15; }
          25% { transform: translate(30px, -40px) rotate(90deg); opacity: 0.25; }
          50% { transform: translate(-20px, -80px) rotate(180deg); opacity: 0.2; }
          75% { transform: translate(-40px, -40px) rotate(270deg); opacity: 0.15; }
        }

        @keyframes float2 {
          0%, 100% { transform: translate(0, 0) rotate(0deg) scale(1); opacity: 0.2; }
          33% { transform: translate(-40px, 50px) rotate(120deg) scale(1.1); opacity: 0.3; }
          66% { transform: translate(20px, 100px) rotate(240deg) scale(0.9); opacity: 0.25; }
        }

        @keyframes float3 {
          0%, 100% { transform: translate(0, 0) rotate(360deg); opacity: 0.12; }
          50% { transform: translate(-60px, 80px) rotate(180deg); opacity: 0.22; }
        }

        @keyframes float4 {
          0%, 100% { transform: translate(0, 0) rotate(0deg) scale(1); opacity: 0.18; }
          40% { transform: translate(50px, -60px) rotate(-120deg) scale(1.15); opacity: 0.28; }
          80% { transform: translate(-30px, -30px) rotate(-240deg) scale(0.95); opacity: 0.2; }
        }

        @keyframes float5 {
          0%, 100% { transform: translate(0, 0) rotate(0deg); opacity: 0.16; }
          30% { transform: translate(-50px, -50px) rotate(135deg); opacity: 0.26; }
          60% { transform: translate(40px, 30px) rotate(270deg); opacity: 0.22; }
        }

        .floating-flower {
          position: fixed;
          background-image: url('${theme.floatingFlowerImage || 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/690e3cd78523fb5fba0a8466/f0efee9e3_PlantLogos2.png'}');
          background-size: contain;
          background-repeat: no-repeat;
          background-position: center;
          pointer-events: none;
          z-index: 0;
          filter: blur(0.5px);
        }

        .floating-flower-1 { width: 120px; height: 120px; top: 10%; left: 5%; animation: float1 25s ease-in-out infinite; }
        .floating-flower-2 { width: 80px; height: 80px; top: 15%; right: 10%; animation: float2 30s ease-in-out infinite; animation-delay: -5s; }
        .floating-flower-3 { width: 100px; height: 100px; top: 40%; left: 15%; animation: float3 35s ease-in-out infinite; animation-delay: -10s; }
        .floating-flower-4 { width: 90px; height: 90px; top: 50%; right: 8%; animation: float4 28s ease-in-out infinite; animation-delay: -15s; }
        .floating-flower-5 { width: 110px; height: 110px; top: 70%; left: 8%; animation: float5 32s ease-in-out infinite; animation-delay: -8s; }
        .floating-flower-6 { width: 75px; height: 75px; top: 75%; right: 15%; animation: float1 27s ease-in-out infinite; animation-delay: -20s; }
        .floating-flower-7 { width: 95px; height: 95px; top: 25%; left: 50%; animation: float3 33s ease-in-out infinite; animation-delay: -12s; }
        .floating-flower-8 { width: 85px; height: 85px; top: 60%; left: 45%; animation: float2 29s ease-in-out infinite; animation-delay: -18s; }
        .floating-flower-9 { width: 105px; height: 105px; top: 5%; left: 35%; animation: float4 31s ease-in-out infinite; animation-delay: -6s; }
        .floating-flower-10 { width: 70px; height: 70px; top: 85%; right: 30%; animation: float5 26s ease-in-out infinite; animation-delay: -14s; }
        .floating-flower-11 { width: 115px; height: 115px; top: 35%; right: 25%; animation: float1 34s ease-in-out infinite; animation-delay: -22s; }
        .floating-flower-12 { width: 65px; height: 65px; top: 90%; left: 25%; animation: float3 24s ease-in-out infinite; animation-delay: -16s; }
        ` : ''}

        /* Glass Styles - Crystal Glass Effect */
        .glass-card {
          background: var(--glass-card-bg);
          ${theme.backdropFilter ? `backdrop-filter: ${theme.backdropFilter}; -webkit-backdrop-filter: ${theme.backdropFilter};` : ''}
          border: ${currentTheme === 'high_contrast' ? '4px' : '3px'} solid var(--glass-card-border);
          border-top-color: ${currentTheme === 'high_contrast' ? 'var(--glass-card-border)' : 'rgba(255, 255, 255, 0.65)'};
          border-left-color: ${currentTheme === 'high_contrast' ? 'var(--glass-card-border)' : 'rgba(255, 255, 255, 0.55)'};
          box-shadow: var(--glass-card-shadow),
            inset 0 1px 2px rgba(255, 255, 255, 0.4),
            inset 0 -1px 1px rgba(0, 0, 0, 0.1),
            inset 2px 0 2px rgba(255, 255, 255, 0.15),
            inset -2px 0 2px rgba(0, 0, 0, 0.05);
        }

        .glass-button {
          background: var(--glass-button-bg);
          ${theme.backdropFilter ? `backdrop-filter: ${theme.backdropFilter}; -webkit-backdrop-filter: ${theme.backdropFilter};` : ''}
          border: ${currentTheme === 'high_contrast' ? '3px' : '2.5px'} solid var(--glass-button-border);
          border-top-color: ${currentTheme === 'high_contrast' ? 'var(--glass-button-border)' : 'rgba(255, 255, 255, 0.6)'};
          border-left-color: ${currentTheme === 'high_contrast' ? 'var(--glass-button-border)' : 'rgba(255, 255, 255, 0.5)'};
          box-shadow: var(--glass-button-shadow),
            inset 0 1px 1px rgba(255, 255, 255, 0.35),
            inset 0 -1px 1px rgba(0, 0, 0, 0.08);
          transition: all 0.3s ease;
        }

        .glass-button:hover {
          ${theme.glassButtonHoverBg ? `background: ${theme.glassButtonHoverBg};` : ''}
          ${theme.glassButtonHoverBorder ? `border-color: ${theme.glassButtonHoverBorder};` : ''}
          box-shadow: var(--glass-button-hover-shadow),
            inset 0 1px 2px rgba(255, 255, 255, 0.45),
            inset 0 -1px 1px rgba(0, 0, 0, 0.1);
        }

        .glass-accent-lavender {
          background: var(--glass-accent-bg);
          ${theme.backdropFilter ? `backdrop-filter: ${theme.backdropFilter}; -webkit-backdrop-filter: ${theme.backdropFilter};` : ''}
          border: ${currentTheme === 'high_contrast' ? '4px' : '3px'} solid var(--glass-accent-border);
          border-top-color: ${currentTheme === 'high_contrast' ? 'var(--glass-accent-border)' : 'rgba(255, 255, 255, 0.7)'};
          border-left-color: ${currentTheme === 'high_contrast' ? 'var(--glass-accent-border)' : 'rgba(255, 255, 255, 0.6)'};
          ${theme.glassAccentColor ? `color: ${theme.glassAccentColor} !important;` : ''}
          box-shadow: var(--glass-accent-shadow),
            inset 0 2px 3px rgba(255, 255, 255, 0.45),
            inset 0 -1px 2px rgba(0, 0, 0, 0.12),
            inset 2px 0 2px rgba(255, 255, 255, 0.2),
            inset -2px 0 2px rgba(0, 0, 0, 0.06);
          transition: all 0.3s ease;
        }

        .glass-accent-lavender:hover {
          box-shadow: var(--glass-accent-hover-shadow),
            inset 0 2px 4px rgba(255, 255, 255, 0.5),
            inset 0 -1px 2px rgba(0, 0, 0, 0.15);
        }

        .glass-accent-moss {
          background: var(--glass-accent-moss-bg);
          ${theme.backdropFilter ? `backdrop-filter: ${theme.backdropFilter}; -webkit-backdrop-filter: ${theme.backdropFilter};` : ''}
          border: ${currentTheme === 'high_contrast' ? '4px' : '3px'} solid var(--glass-accent-moss-border);
          border-top-color: ${currentTheme === 'high_contrast' ? 'var(--glass-accent-moss-border)' : 'rgba(255, 255, 255, 0.7)'};
          border-left-color: ${currentTheme === 'high_contrast' ? 'var(--glass-accent-moss-border)' : 'rgba(255, 255, 255, 0.6)'};
          ${theme.glassAccentMossColor ? `color: ${theme.glassAccentMossColor} !important;` : ''}
          box-shadow: var(--glass-accent-moss-shadow),
            inset 0 2px 3px rgba(255, 255, 255, 0.45),
            inset 0 -1px 2px rgba(0, 0, 0, 0.12),
            inset 2px 0 2px rgba(255, 255, 255, 0.2),
            inset -2px 0 2px rgba(0, 0, 0, 0.06);
          transition: all 0.3s ease;
        }

        .glass-accent-moss:hover {
          box-shadow: var(--glass-accent-moss-hover-shadow),
            inset 0 2px 4px rgba(255, 255, 255, 0.5),
            inset 0 -1px 2px rgba(0, 0, 0, 0.15);
        }

        .glass-card-dark {
          background: ${currentTheme === 'glassmorphism' ? theme.glassCardDarkBg :
            currentTheme === 'high_contrast' ? '#1A1A1A' :
            currentTheme === 'light' ? '#F3F4F6' :
            currentTheme === 'dark' ? 'rgba(15, 10, 31, 0.95)' :
            currentTheme === 'nature' ? 'linear-gradient(135deg, rgba(102, 123, 104, 0.4) 0%, rgba(104, 65, 47, 0.3) 100%)' :
            '#FFFFFF'};
          ${theme.backdropFilter && (currentTheme === 'glassmorphism' || currentTheme === 'nature') ? `backdrop-filter: ${theme.backdropFilter}; -webkit-backdrop-filter: ${theme.backdropFilter};` : ''}
          border: ${currentTheme === 'high_contrast' ? '4px solid #FFFFFF' : currentTheme === 'glassmorphism' ? '3px solid rgba(255, 255, 255, 0.42)' : '3px solid var(--glass-card-border)'};
          border-top-color: ${currentTheme === 'high_contrast' ? '#FFFFFF' : 'rgba(255, 255, 255, 0.65)'};
          border-left-color: ${currentTheme === 'high_contrast' ? '#FFFFFF' : 'rgba(255, 255, 255, 0.55)'};
          box-shadow: ${currentTheme === 'glassmorphism' ? theme.glassCardDarkShadow :
            currentTheme === 'high_contrast' ? '0 0 0 3px #FFD700' :
            currentTheme === 'light' ? '0 2px 8px rgba(0, 0, 0, 0.06)' :
            currentTheme === 'dark' ? '0 8px 24px rgba(0, 0, 0, 0.6)' :
            currentTheme === 'nature' ? '0 8px 32px rgba(104, 65, 47, 0.7), inset 0 1px 1px 0 rgba(255, 255, 255, 0.12)' :
            '0 2px 6px rgba(0, 0, 0, 0.08)'},
            inset 0 1px 2px rgba(255, 255, 255, 0.4),
            inset 0 -1px 1px rgba(0, 0, 0, 0.1),
            inset 2px 0 2px rgba(255, 255, 255, 0.15),
            inset -2px 0 2px rgba(0, 0, 0, 0.05);
        }

        .glass-input {
          background: var(--glass-input-bg);
          ${theme.backdropFilter && (currentTheme === 'glassmorphism' || currentTheme === 'nature') ? `backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px);` : ''}
          border: ${currentTheme === 'high_contrast' ? '3px' : '2px'} solid var(--glass-input-border);
          border-top-color: ${currentTheme === 'high_contrast' ? 'var(--glass-input-border)' : 'rgba(255, 255, 255, 0.55)'};
          border-left-color: ${currentTheme === 'high_contrast' ? 'var(--glass-input-border)' : 'rgba(255, 255, 255, 0.45)'};
          color: var(--text-primary);
          box-shadow: var(--glass-input-shadow),
            inset 0 1px 1px rgba(255, 255, 255, 0.25);
        }

        .glass-input::placeholder {
          color: var(--glass-input-placeholder);
        }

        .glass-input:focus {
          ${theme.glassInputFocusBg ? `background: ${theme.glassInputFocusBg};` : ''}
          border: ${currentTheme === 'high_contrast' ? '3px' : currentTheme === 'light' || currentTheme === 'minimal' ? '2px' : '1px'} solid var(--glass-input-focus-border);
          outline: none;
          box-shadow: var(--glass-input-focus-shadow);
        }

        .glass-input option {
          background: ${currentTheme === 'high_contrast' ? '#000000' :
            currentTheme === 'light' || currentTheme === 'minimal' ? '#FFFFFF' : '#1E1B2E'};
          color: var(--text-primary);
        }

        select.glass-input {
          color: var(--text-primary);
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='${currentTheme === 'light' || currentTheme === 'minimal' ? '%234a4a6a' : '%23F5F3FF'}' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3E%3C/svg%3E");
          background-position: right 0.5rem center;
          background-repeat: no-repeat;
          background-size: 1.5em 1.5em;
          padding-right: 2.5rem;
        }

        input[type="date"].glass-input,
        input[type="datetime-local"].glass-input,
        input[type="time"].glass-input {
          color: var(--text-primary);
          color-scheme: ${currentTheme === 'light' || currentTheme === 'minimal' ? 'light' : 'dark'};
        }

        ${currentTheme !== 'light' && currentTheme !== 'minimal' ? `
        input[type="date"].glass-input::-webkit-calendar-picker-indicator,
        input[type="datetime-local"].glass-input::-webkit-calendar-picker-indicator,
        input[type="time"].glass-input::-webkit-calendar-picker-indicator {
          filter: invert(1);
        }
        ` : ''}

        ${theme.showLightSpots ? `
        .light-spot {
          position: fixed;
          pointer-events: none;
          z-index: 0;
          border-radius: 50%;
          opacity: ${currentTheme === 'nature' ? '0.06' : '0.08'};
        }

        .light-spot-1 {
          width: 300px;
          height: 300px;
          top: 15%;
          left: 20%;
          background: ${theme.lightSpotGradient1};
        }

        .light-spot-2 {
          width: 250px;
          height: 250px;
          bottom: 25%;
          right: 25%;
          background: ${theme.lightSpotGradient2};
        }
        ` : ''}

        ${(currentTheme === 'glassmorphism' || currentTheme === 'nature') ? `
        body::before {
          content: '';
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: 
            radial-gradient(circle at 25% 35%, ${currentTheme === 'nature' ? 'rgba(248, 211, 197, 0.015)' : 'rgba(227, 201, 255, 0.015)'} 0%, transparent 50%),
            radial-gradient(circle at 75% 65%, ${currentTheme === 'nature' ? 'rgba(163, 184, 153, 0.015)' : 'rgba(154, 226, 211, 0.015)'} 0%, transparent 50%);
          pointer-events: none;
          z-index: 1;
        }
        ` : ''}

        /* NEUMORPHISM STYLES */
        .neuro-card {
          background: var(--neuro-card-bg);
          box-shadow: var(--neuro-card-shadow);
          border: ${currentTheme === 'high_contrast' ? '4px' : '1px'} solid var(--neuro-card-border);
        }

        .neuro-button {
          background: var(--neuro-button-bg);
          box-shadow: var(--neuro-button-shadow);
          border: ${currentTheme === 'high_contrast' ? '3px solid var(--neuro-button-border)' : '4px solid var(--neuro-button-border)'};
          border-top-color: ${currentTheme === 'high_contrast' ? 'var(--neuro-button-border)' : 'rgba(255, 255, 255, 0.9)'};
          border-left-color: ${currentTheme === 'high_contrast' ? 'var(--neuro-button-border)' : 'rgba(255, 255, 255, 0.8)'};
          border-right-color: ${currentTheme === 'high_contrast' ? 'var(--neuro-button-border)' : 'rgba(140, 150, 145, 0.6)'};
          border-bottom-color: ${currentTheme === 'high_contrast' ? 'var(--neuro-button-border)' : 'rgba(120, 130, 125, 0.7)'};
          backdrop-filter: blur(12px) saturate(1.2);
          -webkit-backdrop-filter: blur(12px) saturate(1.2);
          transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          overflow: hidden;
        }

        .neuro-button::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 50%;
          background: linear-gradient(180deg, rgba(255, 255, 255, 0.25) 0%, rgba(255, 255, 255, 0.05) 100%);
          pointer-events: none;
          border-radius: inherit;
        }

        .neuro-button::after {
          content: '';
          position: absolute;
          top: 2px;
          left: 2px;
          right: 2px;
          bottom: 2px;
          border-radius: calc(1.5rem - 4px);
          border: 1px solid rgba(255, 255, 255, 0.3);
          border-bottom-color: transparent;
          border-right-color: transparent;
          pointer-events: none;
        }

        .neuro-button:hover {
          box-shadow: var(--neuro-button-hover-shadow);
          transform: translateY(-3px);
          border-top-color: ${currentTheme === 'high_contrast' ? 'var(--neuro-button-border)' : 'rgba(255, 255, 255, 1)'};
          border-left-color: ${currentTheme === 'high_contrast' ? 'var(--neuro-button-border)' : 'rgba(255, 255, 255, 0.9)'};
        }

        .neuro-button:active, .neuro-pressed {
          box-shadow: var(--neuro-button-active-shadow);
          transform: translateY(1px);
        }

        .neuro-input {
          background: var(--neuro-input-bg);
          box-shadow: var(--neuro-input-shadow);
          border: ${currentTheme === 'high_contrast' ? '3px' : '1px'} solid var(--neuro-input-border);
          color: var(--text-primary);
        }

        .neuro-input::placeholder {
          color: var(--neuro-input-placeholder);
        }

        .neuro-input:focus {
          box-shadow: var(--neuro-input-focus-shadow);
          border: ${currentTheme === 'high_contrast' ? '3px' : currentTheme === 'light' || currentTheme === 'minimal' ? '2px' : '1px'} solid var(--neuro-input-focus-border);
          outline: none;
        }

        .neuro-badge {
          background: ${currentTheme === 'glassmorphism' ? theme.neuroCardBg :
            currentTheme === 'light' ? 'linear-gradient(145deg, #fefeff 0%, #f9f8ff 100%)' :
            'linear-gradient(145deg, rgba(30, 27, 46, 0.92) 0%, rgba(15, 10, 31, 0.96) 100%)'};
          box-shadow: ${currentTheme === 'glassmorphism' ? theme.neuroCardShadow :
            currentTheme === 'light' ? '5px 5px 10px rgba(222, 221, 255, 0.5), -5px -5px 10px rgba(255, 255, 255, 0.9), inset 1px 1px 2px rgba(255, 255, 255, 0.7)' :
            '6px 6px 12px rgba(0, 0, 0, 0.5), -6px -6px 12px rgba(60, 50, 85, 0.3), inset 1px 1px 2px rgba(60, 50, 85, 0.2)'};
          border: 1px solid ${currentTheme === 'glassmorphism' ? theme.neuroCardBorder :
            currentTheme === 'light' ? 'rgba(231, 231, 255, 0.5)' :
            'rgba(167, 139, 250, 0.22)'};
        }

        .neuro-accent-raised {
          background: var(--neuro-accent-bg);
          box-shadow: var(--neuro-accent-shadow);
          border: 1px solid var(--neuro-accent-border);
          transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
          ${currentTheme === 'light' || currentTheme === 'minimal' ? 'color: #1a1a2e !important;' : ''}
        }

        .neuro-accent-raised:hover {
          transform: translateY(-3px);
          box-shadow: var(--neuro-accent-hover-shadow);
        }

        .neuro-accent-raised:active {
          transform: translateY(1px);
          box-shadow: var(--neuro-accent-active-shadow);
        }

        .neuro-surface {
          background: ${currentTheme === 'glassmorphism' ? theme.neuroInputBg :
            currentTheme === 'light' ? 'linear-gradient(145deg, #fefeff 0%, #FFFFFF 100%)' :
            'linear-gradient(145deg, rgba(15, 10, 31, 0.92) 0%, rgba(30, 27, 46, 0.88) 100%)'};
          box-shadow: ${currentTheme === 'glassmorphism' ? theme.neuroInputShadow :
            currentTheme === 'light' ? 'inset 3px 3px 6px rgba(222, 221, 255, 0.4), inset -3px -3px 6px rgba(255, 255, 255, 1)' :
            'inset 3px 3px 6px rgba(0, 0, 0, 0.35), inset -3px -3px 6px rgba(60, 50, 85, 0.2)'};
        }

        .neuro-icon-well {
          background: ${currentTheme === 'glassmorphism' ? theme.neuroInputBg :
            currentTheme === 'light' ? 'linear-gradient(145deg, #f3f2ff 0%, #f9f8ff 100%)' :
            'linear-gradient(145deg, rgba(15, 10, 31, 0.96) 0%, rgba(30, 27, 46, 0.92) 100%)'};
          box-shadow: ${currentTheme === 'glassmorphism' ? theme.neuroInputShadow :
            currentTheme === 'light' ? 'inset 6px 6px 12px rgba(222, 221, 255, 0.5), inset -6px -6px 12px rgba(255, 255, 255, 0.9), inset 2px 2px 4px rgba(222, 221, 255, 0.4)' :
            'inset 8px 8px 16px rgba(0, 0, 0, 0.5), inset -8px -8px 16px rgba(60, 50, 85, 0.28), inset 2px 2px 4px rgba(0, 0, 0, 0.4)'};
          border: 1px solid ${currentTheme === 'glassmorphism' ? theme.neuroInputBorder :
            currentTheme === 'light' ? 'rgba(231, 231, 255, 0.4)' :
            'rgba(167, 139, 250, 0.22)'};
        }

        .neuro-accent-extreme {
          background: ${currentTheme === 'glassmorphism' ? theme.neuroAccentBg :
            currentTheme === 'light' ? 'linear-gradient(145deg, #bfbcfc 0%, #d1cfff 100%)' :
            'linear-gradient(145deg, rgba(167, 139, 250, 0.45) 0%, rgba(139, 92, 246, 0.4) 100%)'};
          box-shadow: ${currentTheme === 'glassmorphism' ? theme.neuroAccentShadow :
            currentTheme === 'light' ? '16px 16px 32px rgba(191, 188, 252, 0.55), -16px -16px 32px rgba(209, 207, 255, 0.4), inset 3px 3px 6px rgba(255, 255, 255, 0.35), inset -3px -3px 6px rgba(137, 139, 188, 0.3), 0 3px 16px rgba(191, 188, 252, 0.3)' :
            '20px 20px 40px rgba(0, 0, 0, 0.65), -20px -20px 40px rgba(60, 50, 85, 0.5), inset 4px 4px 8px rgba(167, 139, 250, 0.35), inset -3px -3px 6px rgba(0, 0, 0, 0.25), 0 3px 16px rgba(167, 139, 250, 0.28)'};
          border: 1px solid ${currentTheme === 'glassmorphism' ? theme.neuroAccentBorder :
            currentTheme === 'light' ? 'rgba(137, 139, 188, 0.5)' :
            'rgba(167, 139, 250, 0.4)'};
        }

        /* Universal text color classes */
        .text-moonlight { 
          color: var(--text-primary); 
          ${currentTheme !== 'high_contrast' && currentTheme !== 'light' && currentTheme !== 'minimal' ? 'text-shadow: 0 1px 2px rgba(32, 24, 51, 0.3);' : ''} 
        }
        
        .text-violet-glow { 
          color: var(--text-primary); 
          ${currentTheme !== 'high_contrast' && currentTheme !== 'light' && currentTheme !== 'minimal' ? 'text-shadow: 0 1px 3px rgba(32, 24, 51, 0.4);' : ''} 
        }
        
        .text-midnight { 
          color: var(--text-dark); 
        }
        
        .text-muted { 
          color: var(--text-muted); 
          ${currentTheme !== 'high_contrast' && currentTheme !== 'light' && currentTheme !== 'minimal' ? 'text-shadow: 0 1px 1px rgba(32, 24, 51, 0.2);' : ''} 
        }

        .text-secondary {
          color: var(--text-secondary);
        }

        ${currentTheme !== 'high_contrast' && currentTheme !== 'minimal' ? `
        .glow-violet {
          box-shadow:
            0 0 15px ${currentTheme === 'nature' ? 'rgba(248, 211, 197, 0.35)' : currentTheme === 'light' ? 'rgba(191, 188, 252, 0.35)' : theme.glowViolet},
            0 0 30px ${currentTheme === 'nature' ? 'rgba(248, 211, 197, 0.15)' : currentTheme === 'light' ? 'rgba(191, 188, 252, 0.15)' : theme.glowVioletSoft},
            inset 0 1px 0 rgba(255, 255, 255, 0.2);
        }

        .glow-mint {
          box-shadow:
            0 0 15px ${currentTheme === 'light' ? 'rgba(240, 203, 220, 0.35)' : theme.glowMint},
            0 0 30px ${currentTheme === 'light' ? 'rgba(240, 203, 220, 0.15)' : theme.glowMintSoft},
            inset 0 1px 0 rgba(255, 255, 255, 0.2);
        }
        ` : ''}

        .icon-gradient-lavender {
          ${currentTheme === 'high_contrast' ? `
            color: #FFD700;
          ` : currentTheme === 'light' ? `
            background: linear-gradient(135deg, #bfbcfc 0%, #d1cfff 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
          ` : currentTheme === 'minimal' ? `
            background: linear-gradient(135deg, #6366F1 0%, #4F46E5 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
          ` : currentTheme === 'nature' ? `
            background: linear-gradient(135deg, #fbd8ca 0%, #8fa388 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
          ` : `
            background: ${theme.iconGradient};
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
          `}
        }

        .icon-gradient-mint {
          ${currentTheme === 'high_contrast' ? `
            color: #00FF00;
          ` : currentTheme === 'light' ? `
            background: linear-gradient(135deg, #f0cbdc 0%, #f7e1e3 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
          ` : currentTheme === 'minimal' ? `
            background: linear-gradient(135deg, #10B981 0%, #059669 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
          ` : `
            background: ${theme.iconGradientAlt};
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
          `}
        }

        .icon-duotone { opacity: ${currentTheme === 'high_contrast' ? '1' : '0.9'}; }

        /* Custom Scrollbar Styles */
        ::-webkit-scrollbar {
          width: ${currentTheme === 'high_contrast' ? '14px' : '10px'};
          height: ${currentTheme === 'high_contrast' ? '14px' : '10px'};
        }

        ::-webkit-scrollbar-track {
          background: ${theme.scrollbarTrackBg};
          ${currentTheme !== 'high_contrast' && currentTheme !== 'minimal' ? 'border-radius: 10px;' : ''}
          ${currentTheme === 'high_contrast' ? 'border: 3px solid #FFFFFF;' :
            currentTheme === 'glassmorphism' ? `border: 1px solid ${theme.glassCardBorder};` :
            currentTheme === 'nature' ? 'border: 1px solid rgba(143, 163, 136, 0.15);' :
            currentTheme === 'dark' ? 'border: 1px solid rgba(167, 139, 250, 0.2);' : ''}
        }

        ::-webkit-scrollbar-thumb {
          background: ${theme.scrollbarThumbBg};
          ${currentTheme !== 'high_contrast' && currentTheme !== 'minimal' ? 'border-radius: 10px;' : ''}
          ${currentTheme === 'high_contrast' ? 'border: 3px solid #FFFFFF; box-shadow: 0 0 0 3px #FFD700;' :
            currentTheme === 'glassmorphism' ? 'border: 1px solid rgba(255, 255, 255, 0.35); box-shadow: inset 0 1px 1px rgba(255, 255, 255, 0.3);' :
            currentTheme === 'light' ? 'border: 2px solid #f3f2ff;' :
            currentTheme === 'dark' ? 'border: 1px solid rgba(167, 139, 250, 0.3);' :
            currentTheme === 'nature' ? 'border: 1px solid rgba(251, 216, 202, 0.3); box-shadow: inset 0 1px 1px rgba(255, 255, 255, 0.15);' :
            'border: 2px solid #F9FAFB;'}
        }

        ::-webkit-scrollbar-thumb:hover {
          background: ${currentTheme === 'high_contrast' ? '#FFF700' :
            currentTheme === 'glassmorphism' ? 'linear-gradient(135deg, rgba(180, 139, 104, 0.55) 0%, rgba(150, 114, 82, 0.5) 100%)' :
            currentTheme === 'light' ? 'linear-gradient(135deg, #bfbcfc 0%, #d1cfff 100%)' :
            currentTheme === 'dark' ? 'linear-gradient(135deg, rgba(167, 139, 250, 0.6) 0%, rgba(139, 92, 246, 0.5) 100%)' :
            currentTheme === 'nature' ? 'linear-gradient(135deg, rgba(251, 216, 202, 0.55) 0%, rgba(143, 163, 136, 0.5) 100%)' :
            '#6366F1'};
          ${currentTheme === 'high_contrast' ? 'box-shadow: 0 0 0 3px #FFF700;' :
            currentTheme === 'glassmorphism' ? 'box-shadow: 0 0 8px rgba(58, 65, 55, 0.35), inset 0 1px 1px rgba(255, 255, 255, 0.3);' :
            currentTheme === 'nature' ? 'box-shadow: 0 0 8px rgba(251, 216, 202, 0.4), inset 0 1px 1px rgba(255, 255, 255, 0.2);' :
            currentTheme === 'dark' ? 'box-shadow: 0 0 6px rgba(167, 139, 250, 0.3);' : ''}
        }

        ${currentTheme === 'glassmorphism' ? `
        ::-webkit-scrollbar-thumb:active {
          background: linear-gradient(135deg, rgba(180, 139, 104, 0.65) 0%, rgba(150, 114, 82, 0.6) 100%);
        }
        ` : ''}

        * {
          scrollbar-width: ${currentTheme === 'high_contrast' ? 'auto' : 'thin'};
          scrollbar-color: ${currentTheme === 'glassmorphism' ? 'rgba(180, 139, 104, 0.45) rgba(111, 121, 110, 0.3)' :
            currentTheme === 'high_contrast' ? '#FFD700 #000000' :
            currentTheme === 'light' ? '#d1cfff #f3f2ff' :
            currentTheme === 'dark' ? 'rgba(167, 139, 250, 0.4) rgba(15, 10, 31, 0.6)' :
            currentTheme === 'nature' ? 'rgba(251, 216, 202, 0.4) rgba(85, 106, 88, 0.4)' :
            '#D1D5DB #F9FAFB'};
        }

        ${currentTheme === 'high_contrast' ? `
        * {
          font-weight: 500 !important;
        }
        button {
          font-weight: 700 !important;
          min-height: 48px;
        }
        a {
          text-decoration: underline;
        }
        ` : ''}
      `}</style>

      {theme.showFloatingFlowers && (
        <>
          <div className="floating-flower floating-flower-1"></div>
          <div className="floating-flower floating-flower-2"></div>
          <div className="floating-flower floating-flower-3"></div>
          <div className="floating-flower floating-flower-4"></div>
          <div className="floating-flower floating-flower-5"></div>
          <div className="floating-flower floating-flower-6"></div>
          <div className="floating-flower floating-flower-7"></div>
          <div className="floating-flower floating-flower-8"></div>
          <div className="floating-flower floating-flower-9"></div>
          <div className="floating-flower floating-flower-10"></div>
          <div className="floating-flower floating-flower-11"></div>
          <div className="floating-flower floating-flower-12"></div>
        </>
      )}

      {theme.showLightSpots && (
        <>
          <div className="light-spot light-spot-1"></div>
          <div className="light-spot light-spot-2"></div>
        </>
      )}

      <div className="relative z-10 flex-1">
        {children}
      </div>

      <footer className="relative z-10 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="mb-8 h-px backdrop-blur-xl" 
            style={{
              background: theme.dividerBg,
              boxShadow: theme.dividerShadow
            }}
          />

          <div className="glass-card rounded-3xl p-8">
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-lg font-bold mb-3" style={{ color: theme.textPrimary }}>
                  About Saintpaulia Studio
                </h3>
                <p className="text-sm leading-relaxed" style={{ color: theme.textSecondary }}>
                  Your comprehensive companion for African Violet enthusiasts. Track your collection, 
                  document care routines, manage breeding projects, and connect with a passionate 
                  community of growers.
                </p>
              </div>

              <div className="flex flex-col justify-between">
                <div className="mb-4">
                  <p className="text-sm font-semibold mb-2" style={{ color: theme.textPrimary }}>
                    Inspired by heritage. Designed for precision.
                  </p>
                  <p className="text-xs" style={{ color: theme.textSecondary }}>
                    Track • Breed • Share • Grow
                  </p>
                </div>

                <div className="pt-4" style={{ 
                  borderTop: currentTheme === 'high_contrast' 
                    ? "2px solid #FFFFFF" 
                    : currentTheme === 'light' || currentTheme === 'minimal'
                    ? "1px solid #E5E7EB"
                    : currentTheme === 'nature'
                    ? "1px solid rgba(254, 253, 251, 0.3)"
                    : "1px solid rgba(227, 201, 255, 0.2)" 
                }}>
                  <p className="text-xs" style={{ color: theme.textSecondary }}>
                    © {new Date().getFullYear()} Katrina Brye. All rights reserved.
                  </p>
                  <p className="text-xs mt-1" style={{ color: theme.textSecondary, opacity: 0.8 }}>
                    Made with love for the African Violet community
                  </p>
                  <div className="flex flex-wrap gap-3 mt-2 text-xs">
                    <Link to={createPageUrl("TermsOfService")} className="hover:underline" style={{ color: theme.accentPrimary }}>
                      Terms of Service
                    </Link>
                    <span style={{ color: theme.textSecondary, opacity: 0.5 }}>•</span>
                    <Link to={createPageUrl("PrivacyPolicy")} className="hover:underline" style={{ color: theme.accentPrimary }}>
                      Privacy Policy
                    </Link>
                    <span style={{ color: theme.textSecondary, opacity: 0.5 }}>•</span>
                    <Link to={createPageUrl("ContactUs")} className="hover:underline" style={{ color: theme.accentPrimary }}>
                      Contact Us
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </footer>
      <button
  onClick={handleLogout}
  style={{
    position: "fixed",
    bottom: "1rem",
    left: "1rem",
    zIndex: 9999,
    fontSize: "11px",
    padding: "4px 8px",
    borderRadius: "6px",
    background: "rgba(15, 23, 42, 0.75)",
    color: "#e5e7eb",
    border: "1px solid rgba(148, 163, 184, 0.6)",
    cursor: "pointer",
    backdropFilter: "blur(8px)",
    opacity: 0.8,
  }}
  title="Log out"
>
  Log out
</button>
    </div>
    </TooltipProvider>
  );
}

