import React from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export interface MetricChartPoint {
  label: string;
  value: number;
  color?: string;
}

export interface MetricChartDefinition {
  title: string;
  unit: string;
  data: MetricChartPoint[];
  maxValue?: number;
}

interface MetricChartsProps {
  charts: MetricChartDefinition[];
}

export const MetricCharts: React.FC<MetricChartsProps> = ({ charts }) => (
  <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
    {charts.map((chart) => (
      <section
        key={chart.title}
        className="rounded-2xl border border-border-card bg-bg-card p-5 shadow-sm"
        aria-label={chart.title}
      >
        <h3 className="text-sm font-bold text-text-primary">{chart.title}</h3>
        <p className="mt-1 text-[11px] text-text-secondary">
          Values shown in {chart.unit}
        </p>
        <div className="mt-4 h-56">
          {chart.data.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chart.data}
                margin={{ top: 8, right: 8, left: -16, bottom: 4 }}
              >
                <CartesianGrid
                  stroke="#1f2937"
                  strokeDasharray="3 3"
                  vertical={false}
                />
                <XAxis
                  dataKey="label"
                  tick={{ fill: "#9ca3af", fontSize: 11 }}
                  axisLine={{ stroke: "#374151" }}
                  tickLine={false}
                />
                <YAxis
                  domain={[0, chart.maxValue ?? "auto"]}
                  tick={{ fill: "#9ca3af", fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  cursor={{ fill: "#1f2937", opacity: 0.5 }}
                  contentStyle={{
                    backgroundColor: "#111827",
                    border: "1px solid #374151",
                    borderRadius: 12,
                    color: "#f9fafb",
                    fontSize: 12,
                  }}
                  formatter={(value) => [
                    `${Number(value).toFixed(1)} ${chart.unit}`,
                    chart.title,
                  ]}
                />
                <Bar dataKey="value" name={chart.title} radius={[6, 6, 0, 0]}>
                  {chart.data.map((point, index) => (
                    <Cell
                      key={`${point.label}-${index}`}
                      fill={point.color ?? "#06b6d4"}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-full items-center justify-center rounded-xl border border-dashed border-border-card text-xs text-text-secondary">
              No chart data available yet.
            </div>
          )}
        </div>
      </section>
    ))}
  </div>
);
