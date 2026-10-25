import React from "react";

export type Mode = "endocrine" | "athletic" | "gestational" | "telemetry" | "fhir";

interface ModeSwitcherProps {
  currentMode: Mode;
  onSelectMode: (mode: Mode) => void;
}

export const ModeSwitcher: React.FC<ModeSwitcherProps> = ({ currentMode, onSelectMode }) => {
  const modes: { id: Mode; label: string; icon: string }[] = [
    { id: "endocrine", label: "Endocrine & PCOS (TreeSHAP)", icon: "🔬" },
    { id: "athletic", label: "Athletic Engine & RED-S", icon: "🏃‍♀️" },
    { id: "gestational", label: "Gestational MAP Velocity", icon: "🤰" },
    { id: "telemetry", label: "Longitudinal Telemetry", icon: "📊" },
    { id: "fhir", label: "HL7 FHIR R4 & Handoff", icon: "🏥" },
  ];

  return (
    <div className="flex space-x-2 overflow-x-auto py-2">
      {modes.map((m) => {
        const isActive = currentMode === m.id;
        return (
          <button
            key={m.id}
            onClick={() => onSelectMode(m.id)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-2 shrink-0 ${
              isActive
                ? "bg-indigo-600 text-white shadow-md"
                : "bg-white text-slate-600 hover:text-slate-900 border border-slate-200"
            }`}
          >
            <span>{m.icon}</span>
            <span>{m.label}</span>
          </button>
        );
      })}
    </div>
  );
};
