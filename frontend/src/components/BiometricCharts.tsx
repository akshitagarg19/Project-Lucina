import React from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from "recharts";

export interface TelemetryItem {
  recorded_date: string;
  systolic_bp: number;
  diastolic_bp: number;
  map_mmhg: number;
  rhr_bpm: number;
  hrv_rmssd_ms: number;
}

interface BiometricChartsProps {
  data: TelemetryItem[];
}

export const BiometricCharts: React.FC<BiometricChartsProps> = ({ data }) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Blood Pressure & MAP */}
      <div className="bg-bg-card rounded-2xl p-6 border border-border-card shadow-sm space-y-2">
        <h4 className="text-sm font-bold text-text-primary">
          Blood Pressure &amp; Calculated MAP Trend (LOINC 8478-0)
        </h4>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
              <XAxis dataKey="recorded_date" stroke="#9ca3af" fontSize={11} />
              <YAxis domain={["auto", "auto"]} stroke="#9ca3af" fontSize={11} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#111827",
                  border: "1px solid #374151",
                  borderRadius: 12,
                  color: "#f9fafb",
                  fontSize: 12,
                }}
              />
              <Legend wrapperStyle={{ color: "#d1d5db", fontSize: 11 }} />
              <Line
                type="monotone"
                dataKey="systolic_bp"
                stroke="#ef4444"
                name="Systolic BP"
                strokeWidth={2}
              />
              <Line
                type="monotone"
                dataKey="map_mmhg"
                stroke="#4f46e5"
                name="MAP (mmHg)"
                strokeWidth={3}
              />
              <Line
                type="monotone"
                dataKey="diastolic_bp"
                stroke="#3b82f6"
                name="Diastolic BP"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Resting HR & HRV */}
      <div className="bg-bg-card rounded-2xl p-6 border border-border-card shadow-sm space-y-2">
        <h4 className="text-sm font-bold text-text-primary">
          Resting HR (LOINC 8867-4) &amp; HRV RMSSD (LOINC 80404-7)
        </h4>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
              <XAxis dataKey="recorded_date" stroke="#9ca3af" fontSize={11} />
              <YAxis domain={["auto", "auto"]} stroke="#9ca3af" fontSize={11} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#111827",
                  border: "1px solid #374151",
                  borderRadius: 12,
                  color: "#f9fafb",
                  fontSize: 12,
                }}
              />
              <Legend wrapperStyle={{ color: "#d1d5db", fontSize: 11 }} />
              <Line
                type="monotone"
                dataKey="rhr_bpm"
                stroke="#e11d48"
                name="Resting HR (bpm)"
                strokeWidth={2}
              />
              <Line
                type="monotone"
                dataKey="hrv_rmssd_ms"
                stroke="#10b981"
                name="HRV RMSSD (ms)"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
