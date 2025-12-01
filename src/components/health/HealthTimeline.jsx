import React, { useState } from "react";
import { format } from "date-fns";
import { ChevronDown, ChevronUp, Sparkles } from "lucide-react";
import HealthStatusBadge from "./HealthStatusBadge";

export default function HealthTimeline({ logs }) {
  const [expandedLog, setExpandedLog] = useState(null);

  if (logs.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="clay-card w-16 h-16 rounded-[18px] bg-gradient-to-br from-emerald-100 to-emerald-200 flex items-center justify-center mx-auto mb-4">
          <Sparkles className="w-8 h-8 text-emerald-600" />
        </div>
        <p className="text-purple-600">No health observations yet. Your plant is looking great!</p>
      </div>
    );
  }

  const toggleLog = (logId) => {
    setExpandedLog(expandedLog === logId ? null : logId);
  };

  return (
    <div className="space-y-3">
      {logs.map((log, index) => {
        const isExpanded = expandedLog === log.id;
        const isLatest = index === 0;

        return (
          <div
            key={log.id}
            className={`clay-card rounded-[16px] bg-white/70 p-4 transition-all ${
              isLatest ? "ring-2 ring-purple-300" : ""
            }`}
          >
            <button
              onClick={() => toggleLog(log.id)}
              className="w-full flex items-start justify-between gap-4 text-left"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-2">
                  <HealthStatusBadge status={log.health_status} size="sm" />
                  <span className="text-sm font-medium text-purple-700">
                    {format(new Date(log.observation_date), "MMM d, yyyy")}
                  </span>
                  {isLatest && (
                    <span className="text-xs font-semibold text-purple-600 clay-card px-2 py-0.5 rounded-[6px] bg-purple-100">
                      Latest
                    </span>
                  )}
                </div>
                
                {log.symptoms && log.symptoms.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {log.symptoms.slice(0, isExpanded ? undefined : 3).map((symptom, i) => (
                      <span
                        key={i}
                        className="text-xs clay-card px-2 py-1 rounded-[8px] bg-purple-50 text-purple-800"
                      >
                        {symptom}
                      </span>
                    ))}
                    {!isExpanded && log.symptoms.length > 3 && (
                      <span className="text-xs clay-card px-2 py-1 rounded-[8px] bg-purple-50 text-purple-600">
                        +{log.symptoms.length - 3} more
                      </span>
                    )}
                  </div>
                )}
              </div>

              <button className="clay-button w-8 h-8 rounded-[10px] bg-white/70 flex items-center justify-center text-purple-700 flex-shrink-0">
                {isExpanded ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </button>
            </button>

            {isExpanded && (
              <div className="mt-4 space-y-4 pt-4 border-t border-purple-100">
                {log.notes && (
                  <div>
                    <p className="text-xs font-semibold text-purple-700 mb-1">Notes:</p>
                    <p className="text-sm text-purple-800">{log.notes}</p>
                  </div>
                )}

                {log.photos && log.photos.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-purple-700 mb-2">Photos:</p>
                    <div className="flex gap-2 flex-wrap">
                      {log.photos.map((photo, i) => (
                        <a
                          key={i}
                          href={photo}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="clay-card rounded-[12px] overflow-hidden w-20 h-20 hover:ring-2 hover:ring-purple-300 transition-all"
                        >
                          <img src={photo} alt={`Observation ${i + 1}`} className="w-full h-full object-cover" />
                        </a>
                      ))}
                    </div>
                  </div>
                )}

              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}