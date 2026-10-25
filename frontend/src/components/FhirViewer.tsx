import React, { useState } from "react";

interface FhirViewerProps {
  bundle: any;
  userId?: string;
}

export const FhirViewer: React.FC<FhirViewerProps> = ({ bundle, userId = "athlete" }) => {
  const [copied, setCopied] = useState(false);

  const jsonStr = JSON.stringify(bundle, null, 2);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(jsonStr);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy FHIR bundle:", err);
    }
  };

  const handleDownload = () => {
    const blob = new Blob([jsonStr], { type: "application/fhir+json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `fhir-bundle-${userId.slice(0, 8)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-bg-main rounded-2xl p-6 border border-border-card shadow-xl space-y-4">
      <div className="flex justify-between items-center border-b border-border-card pb-3">
        <span className="text-xs font-mono text-accent-emerald font-semibold">
          &bull; HL7 FHIR R4 Collection Bundle &bull; LOINC &amp; SNOMED-CT Compliant
        </span>
        <div className="flex space-x-2">
          <button
            onClick={handleCopy}
            className="px-3 py-1 bg-bg-card hover:bg-border-card text-xs text-text-primary rounded font-semibold transition border border-border-card"
          >
            {copied ? "Copied!" : "Copy JSON"}
          </button>
          <button
            onClick={handleDownload}
            className="px-3 py-1 bg-accent-cyan hover:bg-cyan-400 text-xs text-slate-950 rounded font-semibold transition"
          >
            Download JSON
          </button>
        </div>
      </div>
      <pre className="text-xs text-accent-emerald font-mono overflow-x-auto max-h-[480px] leading-relaxed">
        {jsonStr}
      </pre>
    </div>
  );
};
