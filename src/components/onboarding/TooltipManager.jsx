import React, { createContext, useContext, useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const TooltipContext = createContext();

export const useTooltips = () => {
  const context = useContext(TooltipContext);
  if (!context) {
    throw new Error("useTooltips must be used within TooltipProvider");
  }
  return context;
};

export function TooltipProvider({ children }) {
  const queryClient = useQueryClient();
  const [localDismissed, setLocalDismissed] = useState(new Set());

  const { data: currentUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me().catch(() => null),
  });

  const dismissedTooltips = currentUser?.dismissed_tooltips || [];

  const updateTooltipsMutation = useMutation({
    mutationFn: (tooltips) => base44.auth.updateMe({ dismissed_tooltips: tooltips }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUser'] });
    },
  });

  const isTooltipDismissed = (tooltipId) => {
    return dismissedTooltips.includes(tooltipId) || localDismissed.has(tooltipId);
  };

  const dismissTooltip = (tooltipId) => {
    // Immediately update local state for instant UI feedback
    setLocalDismissed(prev => new Set([...prev, tooltipId]));

    // Update server in background
    if (currentUser) {
      const updatedTooltips = [...new Set([...dismissedTooltips, tooltipId])];
      updateTooltipsMutation.mutate(updatedTooltips);
    }
  };

  const resetTooltips = () => {
    setLocalDismissed(new Set());
    if (currentUser) {
      updateTooltipsMutation.mutate([]);
    }
  };

  const value = {
    isTooltipDismissed,
    dismissTooltip,
    resetTooltips,
    dismissedTooltips
  };

  return (
    <TooltipContext.Provider value={value}>
      {children}
    </TooltipContext.Provider>
  );
}