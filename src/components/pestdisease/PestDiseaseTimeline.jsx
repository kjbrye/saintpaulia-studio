import React from "react";
import { format } from "date-fns";
import { Bug, AlertOctagon, AlertCircle, Edit, CheckCircle, Eye, Syringe } from "lucide-react";

const SEVERITY_CONFIG = {
  minor: { color: "#93C5FD", bg: "rgba(147, 197, 253, 0.2)", border: "rgba(147, 197, 253, 0.4)", text: "Minor" },
  moderate: { color: "#FCD34D", bg: "rgba(252, 211, 77, 0.2)", border: "rgba(252, 211, 77, 0.4)", text: "Moderate" },
  severe: { color: "#FB923C", bg: "rgba(251, 146, 60, 0.2)", border: "rgba(251, 146, 60, 0.4)", text: "Severe" },
  critical: { color: "#FCA5A5", bg: "rgba(239, 68, 68, 0.2)", border: "rgba(239, 68, 68, 0.4)", text: "Critical" }
};

const STATUS_CONFIG = {
  active: { icon: AlertCircle, color: "#FCA5A5", text: "Active" },
  treating: { icon: Syringe, color: "#FCD34D", text: "Treating" },
  monitoring: { icon: Eye, color: "#93C5FD", text: "Monitoring" },
  resolved: { icon: CheckCircle, color: "#A7F3D0", text: "Resolved" }
};

export default function PestDiseaseTimeline({ logs, onEdit }) {
  if (logs.length === 0) {
    return (
      <div className="text-center py-8" style={{ color: "#DDD6FE" }}>
        No pest or disease issues logged
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {logs.map((log, index) => {
        const severityConfig = SEVERITY_CONFIG[log.severity] || SEVERITY_CONFIG.moderate;
        const statusConfig = STATUS_CONFIG[log.status] || STATUS_CONFIG.active;
        const StatusIcon = statusConfig.icon;

        return (
          <div key={log.id} className="glass-card rounded-3xl p-5 relative group">
            {/* Timeline Connector */}
            {index < logs.length - 1 && (
              <div 
                className="absolute left-8 top-16 bottom-0 w-px"
                style={{
                  background: "linear-gradient(180deg, rgba(227, 201, 255, 0.3) 0%, rgba(227, 201, 255, 0) 100%)"
                }}
              />
            )}

            <div className="flex items-start gap-4">
              {/* Icon */}
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
                style={{
                  background: severityConfig.bg,
                  border: `1px solid ${severityConfig.border}`
                }}>
                {log.issue_type === "pest" ? (
                  <Bug className="w-6 h-6" style={{ color: severityConfig.color, strokeWidth: 1.8 }} />
                ) : log.issue_type === "disease" ? (
                  <AlertOctagon className="w-6 h-6" style={{ color: severityConfig.color, strokeWidth: 1.8 }} />
                ) : (
                  <AlertCircle className="w-6 h-6" style={{ color: severityConfig.color, strokeWidth: 1.8 }} />
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <h3 className="font-bold text-lg" style={{ color: "#F5F3FF" }}>
                        {log.name}
                      </h3>
                      <span
                        className="px-2 py-0.5 rounded-lg text-xs font-semibold backdrop-blur-xl"
                        style={{
                          background: severityConfig.bg,
                          border: `1px solid ${severityConfig.border}`,
                          color: severityConfig.color
                        }}
                      >
                        {severityConfig.text}
                      </span>
                      <span
                        className="px-2 py-0.5 rounded-lg text-xs font-semibold backdrop-blur-xl flex items-center gap-1"
                        style={{
                          background: log.status === "resolved" ? "rgba(154, 226, 211, 0.2)" : "rgba(239, 68, 68, 0.2)",
                          border: `1px solid ${log.status === "resolved" ? "rgba(154, 226, 211, 0.4)" : "rgba(239, 68, 68, 0.4)"}`,
                          color: statusConfig.color
                        }}
                      >
                        <StatusIcon className="w-3 h-3" />
                        {statusConfig.text}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-xs mb-2" style={{ color: "#DDD6FE" }}>
                      <span>Observed: {format(new Date(log.date_observed), "MMM d, yyyy")}</span>
                      {log.resolution_date && (
                        <span>• Resolved: {format(new Date(log.resolution_date), "MMM d, yyyy")}</span>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => onEdit(log)}
                    className="glass-button w-9 h-9 rounded-xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    style={{ color: "#C4B5FD" }}
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                </div>

                {/* Symptoms */}
                {log.symptoms && log.symptoms.length > 0 && (
                  <div className="mb-3">
                    <p className="text-xs font-semibold mb-1" style={{ color: "#DDD6FE" }}>Symptoms:</p>
                    <div className="flex flex-wrap gap-1.5">
                      {log.symptoms.map((symptom, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded-lg text-xs backdrop-blur-xl"
                          style={{
                            background: "rgba(168, 159, 239, 0.15)",
                            border: "1px solid rgba(168, 159, 239, 0.3)",
                            color: "#C4B5FD"
                          }}
                        >
                          {symptom}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Treatment */}
                {log.treatment_applied && (
                  <div className="glass-button rounded-2xl p-3 mb-3">
                    <div className="flex items-start gap-2 mb-1">
                      <Syringe className="w-4 h-4 mt-0.5" style={{ color: "#A7F3D0", strokeWidth: 1.8 }} />
                      <div className="flex-1">
                        <p className="text-xs font-semibold mb-1" style={{ color: "#F5F3FF" }}>Treatment:</p>
                        <p className="text-sm" style={{ color: "#DDD6FE" }}>
                          {log.treatment_applied}
                        </p>
                        {log.treatment_date && (
                          <p className="text-xs mt-1" style={{ color: "#DDD6FE", opacity: 0.7 }}>
                            Applied: {format(new Date(log.treatment_date), "MMM d, yyyy")}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Notes */}
                {log.notes && (
                  <p className="text-sm mb-3" style={{ color: "#DDD6FE" }}>
                    {log.notes}
                  </p>
                )}

                {/* Photos */}
                {log.photos && log.photos.length > 0 && (
                  <div className="grid grid-cols-3 gap-2">
                    {log.photos.map((photo, idx) => (
                      <img
                        key={idx}
                        src={photo}
                        alt={`Issue ${idx + 1}`}
                        className="w-full h-20 object-cover rounded-xl"
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}