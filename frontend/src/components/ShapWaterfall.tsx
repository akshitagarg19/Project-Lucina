import React from "react";

export interface ShapAttribution {
  feature: string;
  shap_value: number;
  user_value: number;
}

interface ShapWaterfallProps {
  attributions: ShapAttribution[];
  baseExpectedValue: number;
  predictedRiskScore: number;
}

export const ShapWaterfall: React.FC<ShapWaterfallProps> = ({
  attributions,
  baseExpectedValue,
  predictedRiskScore,
}) => {
  const maxAbsValue = Math.max(
    ...attributions.map((a) => Math.abs(a.shap_value)),
    0.1
  );

  return (
    <div className="bg-bg-card rounded-2xl p-6 border border-border-card shadow-sm space-y-4 text-text-primary">
      <div className="flex justify-between items-center border-b border-border-card pb-3">
        <div>
          <h4 className="text-sm font-bold text-text-primary">
            Localized TreeSHAP Waterfall &amp; Attribution Plot
          </h4>
          <p className="text-xs text-text-secondary">
            Additive feature attribution vectors (f(x) = φ0 + Σ φi)
          </p>
        </div>
        <div className="text-right">
          <span className="text-[10px] font-mono uppercase text-text-secondary block">
            Base Value (φ0)
          </span>
          <span className="text-xs font-mono font-bold text-accent-cyan">
            {(baseExpectedValue * 100).toFixed(1)}%
          </span>
        </div>
      </div>

      <div className="space-y-3 pt-2">
        {attributions.map((attr, idx) => {
          const isPositive = attr.shap_value > 0;
          const widthPct = Math.min(
            100,
            (Math.abs(attr.shap_value) / maxAbsValue) * 100
          );

          return (
            <div key={idx} className="space-y-1">
              <div className="flex justify-between text-xs font-medium">
                <span className="text-text-primary font-semibold">{attr.feature}</span>
                <span className="font-mono text-text-secondary text-[11px]">
                  Value: <strong className="text-text-primary">{attr.user_value}</strong>
                  {" | "}
                  <strong className={isPositive ? "text-accent-rose" : "text-accent-emerald"}>
                    {isPositive ? "+" : ""}
                    {attr.shap_value.toFixed(4)}
                  </strong>
                </span>
              </div>

              <div className="h-4 bg-bg-main rounded-full overflow-hidden flex relative border border-border-card">
                <div className="w-1/2 flex justify-end">
                  {!isPositive && (
                    <div
                      className="bg-accent-emerald h-full rounded-l-full transition-all duration-500"
                      style={{ width: `${widthPct}%` }}
                    />
                  )}
                </div>
                <div className="w-px bg-border-card h-full z-10" />
                <div className="w-1/2 flex justify-start">
                  {isPositive && (
                    <div
                      className="bg-accent-rose h-full rounded-r-full transition-all duration-500"
                      style={{ width: `${widthPct}%` }}
                    />
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="border-t border-border-card pt-3 flex justify-between items-center text-xs">
        <span className="text-text-secondary">Predicted Probabilistic Risk Output:</span>
        <span className="font-mono font-black text-accent-rose text-sm">
          {(predictedRiskScore * 100).toFixed(1)}%
        </span>
      </div>
    </div>
  );
};
