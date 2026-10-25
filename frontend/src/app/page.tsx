"use client";

import React, { useState, useEffect } from "react";
import { Sidebar, Workspace } from "@/components/Sidebar";
import { ProblemGateway } from "@/components/ProblemGateway";
import { CommunityHub } from "@/components/CommunityHub";
import { ShapWaterfall, ShapAttribution } from "@/components/ShapWaterfall";
import { ModeSwitcher, Mode } from "@/components/ModeSwitcher";
import { BiometricCharts, TelemetryItem } from "@/components/BiometricCharts";
import { MetricCharts } from "@/components/MetricCharts";
import { FhirViewer } from "@/components/FhirViewer";
import { api } from "@/lib/api";

export default function DashboardPage() {
  // Layer state: 1 (Public Landing), 2 (Post-Login Gateway), 3 (Operational Workspaces)
  const [currentLayer, setCurrentLayer] = useState<1 | 2 | 3>(1);
  const [workspace, setWorkspace] = useState<Workspace>("gateway");
  const [userId, setUserId] = useState<string>("123e4567-e89b-12d3-a456-426614174000"); // Maya Patel
  const [doctorView, setDoctorView] = useState<"simple" | "clinical">("simple");

  // Everyday Questionnaire Wizard Modal States
  const [isCycleWizardOpen, setIsCycleWizardOpen] = useState<boolean>(false);
  const [isEnergyWizardOpen, setIsEnergyWizardOpen] = useState<boolean>(false);

  // Wizard Questions State
  const [wizTiming, setWizTiming] = useState<string>("ontime");
  const [wizSkin, setWizSkin] = useState<string>("none");
  const [wizIntensity, setWizIntensity] = useState<string>("mild");

  const [wizLegs, setWizLegs] = useState<string>("fresh");
  const [wizMeals, setWizMeals] = useState<string>("well");
  const [wizSleep, setWizSleep] = useState<string>("deep");

  // Endocrine State
  const [mode, setMode] = useState<Mode>("endocrine");
  const [lhFsh, setLhFsh] = useState<number>(2.8);
  const [freeT, setFreeT] = useState<number>(68.5);
  const [cycleVar, setCycleVar] = useState<number>(12.4);
  const [hirsutism, setHirsutism] = useState<number>(14);
  const [bmi, setBmi] = useState<number>(23.2);
  const [pcosRisk, setPcosRisk] = useState<number>(0.825);
  const [endoRisk, setEndoRisk] = useState<number>(0.31);
  const [riskClassification, setRiskClassification] = useState<string>("HIGH_PCOS_PROBABILITY");
  const [baseExpectedValue, setBaseExpectedValue] = useState<number>(0.15);
  const [shapAttributions, setShapAttributions] = useState<ShapAttribution[]>([
    { feature: "lh_fsh_ratio", shap_value: 0.32, user_value: 2.8 },
    { feature: "free_testosterone_ng_dl", shap_value: 0.21, user_value: 68.5 },
    { feature: "cycle_length_variance_days", shap_value: 0.145, user_value: 12.4 },
    { feature: "hirsutism_score", shap_value: 0.08, user_value: 14.0 },
    { feature: "bmi", shap_value: -0.08, user_value: 23.2 },
  ]);
  const [plainInsights, setPlainInsights] = useState<string[]>([
    "Hormone Balance Score (2.80) is elevated above the 1.5 target, adding +0.320 toward PCOS pattern match.",
    "Skin & Energy Marker (68.5 ng/dL) is elevated, impacting muscle recovery and oil production (+0.210).",
    "Cycle Shift of ~12 days month-to-month contributes +0.145 to pattern match.",
  ]);

  // Athletic State (Energy OS)
  const [ffm, setFfm] = useState<number>(50.0);
  const [calIn, setCalIn] = useState<number>(1500.0);
  const [calExp, setCalExp] = useState<number>(600.0);
  const [acuteLoad, setAcuteLoad] = useState<number>(1400.0);
  const [chronicLoad, setChronicLoad] = useState<number>(1000.0);
  const [ea, setEa] = useState<number>(18.0);
  const [acwr, setAcwr] = useState<number>(1.4);
  const [redsFlag, setRedsFlag] = useState<boolean>(true);
  const [athleticWarning, setAthleticWarning] = useState<string>(
    "CRITICAL: Low Energy Availability (<30 kcal/kg FFM) detected. High risk of neuroendocrine suppression and RED-S."
  );

  // Gestational State (Vascular Strain Index)
  const [gestWeeks, setGestWeeks] = useState<number>(22);
  const [gestSys, setGestSys] = useState<number>(134.0);
  const [gestDia, setGestDia] = useState<number>(88.0);
  const [currentMap, setCurrentMap] = useState<number>(103.33);
  const [baselineMap, setBaselineMap] = useState<number>(83.02);
  const [velocityAlert, setVelocityAlert] = useState<boolean>(true);
  const [preeclampsiaClass, setPreeclampsiaClass] = useState<string>("HIGH_PREECLAMPSIA_RISK");
  const [gestRecommendation, setGestRecommendation] = useState<string>(
    "Elevated Mean Arterial Pressure (103.33 mmHg >= 90 mmHg threshold at 22 weeks). Accelerating MAP velocity detected."
  );

  // Telemetry History & FHIR Bundle
  const [telemetryHistory, setTelemetryHistory] = useState<TelemetryItem[]>([]);
  const [fhirBundle, setFhirBundle] = useState<any>(null);
  const [dashboardError, setDashboardError] = useState<string | null>(null);
  const fhirResourceCounts = Array.isArray(fhirBundle?.entry)
    ? Object.entries(
        fhirBundle.entry.reduce(
          (
            counts: Record<string, number>,
            entry: { resource?: { resourceType?: string } }
          ) => {
            const resourceType = entry.resource?.resourceType;
            if (resourceType) {
              counts[resourceType] = (counts[resourceType] ?? 0) + 1;
            }
            return counts;
          },
          {}
        )
      ).map(([label, value]) => ({
        label,
        value: Number(value),
        color: "#10b981",
      }))
    : [];

  // Athlete Name lookup
  const athleteNames: Record<string, string> = {
    "223e4567-e89b-12d3-a456-426614174001": "Sarah Jenkins",
    "123e4567-e89b-12d3-a456-426614174000": "Maya Patel",
    "323e4567-e89b-12d3-a456-426614174002": "Priya Sharma",
  };

  // Handlers
  const handleEndocrineInference = async (overrideLh?: number, overrideFreeT?: number, overrideVar?: number, overrideHair?: number) => {
    setDashboardError(null);
    try {
      const data = await api.predictEndocrine({
        user_id: userId,
        lh_fsh_ratio: overrideLh !== undefined ? overrideLh : lhFsh,
        free_testosterone_ng_dl: overrideFreeT !== undefined ? overrideFreeT : freeT,
        cycle_length_variance_days: overrideVar !== undefined ? overrideVar : cycleVar,
        hirsutism_score: overrideHair !== undefined ? overrideHair : hirsutism,
        bmi: bmi,
      });
      setPcosRisk(data.pcos_risk_score);
      setEndoRisk(data.endometriosis_risk_score);
      setRiskClassification(data.risk_classification);
      setBaseExpectedValue(data.base_expected_value);
      setShapAttributions(data.shap_attributions);
      if (data.plain_english_insights) setPlainInsights(data.plain_english_insights);
    } catch (err) {
      console.error(err);
      setDashboardError("Could not run the cycle analysis. Check that the backend is running and try again.");
    }
  };

  const handleAthleticEvaluation = async (overrideCalIn?: number, overrideCalExp?: number, overrideAcute?: number, overrideChronic?: number) => {
    setDashboardError(null);
    try {
      const data = await api.checkReds({
        user_id: userId,
        fat_free_mass_kg: ffm,
        caloric_intake_kcal: overrideCalIn !== undefined ? overrideCalIn : calIn,
        exercise_energy_expenditure_kcal: overrideCalExp !== undefined ? overrideCalExp : calExp,
        acute_7d_workload: overrideAcute !== undefined ? overrideAcute : acuteLoad,
        chronic_28d_workload: overrideChronic !== undefined ? overrideChronic : chronicLoad,
      });
      setEa(data.energy_availability_kcal_ffm);
      setAcwr(data.acwr_index);
      setRedsFlag(data.reds_risk_flag);
      setAthleticWarning(data.warning_message);
    } catch (err) {
      console.error(err);
      setDashboardError("Could not update the energy metrics. Check that the backend is running and try again.");
    }
  };

  const handleGestationalCheck = async () => {
    setDashboardError(null);
    try {
      const data = await api.checkGestational({
        user_id: userId,
        gestational_age_weeks: gestWeeks,
        systolic_bp: gestSys,
        diastolic_bp: gestDia,
      });
      setCurrentMap(data.current_map);
      setBaselineMap(data.bayesian_baseline_map);
      setVelocityAlert(data.velocity_alert);
      setPreeclampsiaClass(data.preeclampsia_risk_classification);
      setGestRecommendation(data.recommendation);
    } catch (err) {
      console.error(err);
      setDashboardError("Could not check the gestational metrics. Check that the backend is running and try again.");
    }
  };

  // Cycle Wizard Submit
  const handleCycleWizardSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    let calculatedLh = 1.2;
    let calculatedFreeT = 32.0;
    let calculatedVar = 2.0;
    let calculatedHair = 6;

    if (wizTiming === "skipped") {
      calculatedLh += 1.2;
      calculatedVar = 14.5;
    } else if (wizTiming === "late5_10") {
      calculatedLh += 0.6;
      calculatedVar = 8.0;
    }

    if (wizSkin === "high") {
      calculatedFreeT = 72.0;
      calculatedHair += 8;
    } else if (wizSkin === "mild") {
      calculatedFreeT = 52.0;
      calculatedHair += 4;
    }

    if (wizIntensity === "intense") {
      calculatedLh += 0.2;
    }

    setLhFsh(calculatedLh);
    setFreeT(calculatedFreeT);
    setCycleVar(calculatedVar);
    setHirsutism(calculatedHair);
    setIsCycleWizardOpen(false);
    handleEndocrineInference(calculatedLh, calculatedFreeT, calculatedVar, calculatedHair);
  };

  // Energy Wizard Submit
  const handleEnergyWizardSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    let calculatedCalIn = 2400.0;
    let calculatedCalExp = 550.0;
    let calculatedAcute = 1100.0;
    let calculatedChronic = 1050.0;

    if (wizMeals === "skipped") {
      calculatedCalIn = 1400.0;
    } else if (wizMeals === "low") {
      calculatedCalIn = 1800.0;
    }

    if (wizLegs === "exhausted") {
      calculatedCalExp = 750.0;
      calculatedAcute = 1500.0;
    } else if (wizLegs === "heavy") {
      calculatedCalExp = 650.0;
      calculatedAcute = 1350.0;
    }

    if (wizSleep === "poor") {
      calculatedCalExp += 50.0;
    }

    setCalIn(calculatedCalIn);
    setCalExp(calculatedCalExp);
    setAcuteLoad(calculatedAcute);
    setChronicLoad(calculatedChronic);
    setIsEnergyWizardOpen(false);
    handleAthleticEvaluation(calculatedCalIn, calculatedCalExp, calculatedAcute, calculatedChronic);
  };

  useEffect(() => {
    api.getFhirBundle(userId)
      .then(setFhirBundle)
      .catch((err) => {
        console.error("Failed to load the FHIR bundle:", err);
        setFhirBundle(null);
        setDashboardError("The backend API is unavailable. Start the backend to load live data and use analysis actions.");
      });
    api.getTelemetryHistory(userId)
      .then(setTelemetryHistory)
      .catch((err) => {
        console.error("Failed to load telemetry history:", err);
        setDashboardError("Telemetry data could not be loaded. Check that the backend is running.");
      });
  }, [userId]);

  // If in Layer 1: Public Landing & Sign In Page
  if (currentLayer === 1) {
    return (
      <div className="min-h-screen bg-bg-main text-text-primary flex flex-col justify-between">
        <header className="border-b border-border-card bg-bg-card/80 backdrop-blur-md sticky top-0 z-50 px-6 py-4">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-accent-cyan via-indigo-600 to-accent-rose flex items-center justify-center text-white font-black text-xl shadow-lg shadow-cyan-950/50">
                &Psi;
              </div>
              <div>
                <span className="text-xl font-black tracking-tight text-text-primary">
                  Lucina <span className="text-accent-cyan">AI</span>
                </span>
                <span className="hidden sm:inline-block ml-2 text-[11px] font-semibold text-text-secondary border-l border-border-card pl-2">
                  Athlete Health OS
                </span>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="hidden md:inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-bg-card border border-border-card text-xs font-semibold text-accent-cyan">
                <span className="w-2 h-2 rounded-full bg-accent-emerald animate-pulse"></span>
                <span>recHERsion '26 &bull; ACM-W NITK Surathkal</span>
              </div>
              <button
                onClick={() => {
                  setCurrentLayer(2);
                  setWorkspace("gateway");
                }}
                className="px-5 py-2.5 rounded-xl bg-accent-cyan hover:bg-cyan-400 text-slate-950 font-bold text-xs tracking-wide shadow-lg shadow-cyan-500/20 transition-all transform hover:-translate-y-0.5"
              >
                Sign In to Platform &rarr;
              </button>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-6 py-12 lg:py-16 flex-1 w-full">
          <ProblemGateway
            onSelectWorkspace={(ws) => {
              setCurrentLayer(3);
              setWorkspace(ws);
            }}
            isLoggedIn={false}
            onSignIn={() => {
              setCurrentLayer(2);
              setWorkspace("gateway");
            }}
          />
        </main>

        <footer className="border-t border-border-card bg-bg-card/40 py-6 px-6 text-center text-xs text-text-secondary">
          <p>Lucina AI &bull; Built for recHERsion '26 &bull; ACM-W NITK Surathkal &bull; HL7 FHIR R4 &amp; TreeSHAP Verified</p>
        </footer>
      </div>
    );
  }

  // Layer 2 & 3: Authenticated Platform
  return (
    <div className="flex min-h-screen bg-bg-main text-text-primary">
      <Sidebar
        currentWorkspace={workspace}
        onSelectWorkspace={(ws) => {
          if (ws === "gateway") {
            setCurrentLayer(2);
          } else {
            setCurrentLayer(3);
          }
          setWorkspace(ws);
        }}
        activeUserId={userId}
        onChangeUser={(newId) => {
          setUserId(newId);
          if (newId === "223e4567-e89b-12d3-a456-426614174001") setWorkspace("energy");
          else if (newId === "123e4567-e89b-12d3-a456-426614174000") setWorkspace("cycle");
          else if (newId === "323e4567-e89b-12d3-a456-426614174002") setWorkspace("gestational");
        }}
        onSignOut={() => setCurrentLayer(1)}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <main className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto w-full space-y-6">
          <nav className="md:hidden flex gap-2 overflow-x-auto pb-2" aria-label="Workspace navigation">
            {([
              ["gateway", "Overview"],
              ["energy", "Energy"],
              ["cycle", "Cycle"],
              ["gestational", "Gestational"],
              ["community", "Community"],
              ["doctor", "Doctor"],
            ] as const).map(([ws, label]) => (
              <button
                key={ws}
                type="button"
                onClick={() => {
                  setWorkspace(ws);
                  setCurrentLayer(ws === "gateway" ? 2 : 3);
                }}
                className={`shrink-0 px-3 py-2 rounded-lg text-xs font-semibold ${
                  workspace === ws
                    ? "bg-accent-cyan text-slate-950"
                    : "bg-bg-card border border-border-card text-text-secondary"
                }`}
              >
                {label}
              </button>
            ))}
          </nav>

          {dashboardError && (
            <div role="alert" className="rounded-xl border border-rose-500/40 bg-rose-950/40 p-3 text-sm text-rose-200">
              {dashboardError}
              <button
                type="button"
                onClick={() => setDashboardError(null)}
                className="ml-3 font-bold underline"
              >
                Dismiss
              </button>
            </div>
          )}

          {workspace === "gateway" && (
            <ProblemGateway
              onSelectWorkspace={(ws) => {
                setCurrentLayer(3);
                setWorkspace(ws);
              }}
              isLoggedIn={true}
              activeUserName={athleteNames[userId] || "Sarah Jenkins"}
            />
          )}

          {workspace === "energy" && (
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-bg-card via-slate-900 to-bg-card border border-border-card rounded-3xl p-6 text-text-primary shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-cyan-950 border border-accent-cyan/30 px-2.5 py-1 rounded-full text-accent-cyan">
                    Energy OS &bull; Low Fuel Defense Shield
                  </span>
                  <h2 className="text-2xl font-black mt-2">Energy Availability (EA) &amp; Workload Balance</h2>
                  <p className="text-text-secondary text-xs mt-1 max-w-xl">
                    Real-time physiological defense against REDs, hypothalamic period pauses, and bone stress fractures.
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setIsEnergyWizardOpen(true)}
                    className="px-4 py-2.5 bg-accent-cyan hover:bg-cyan-400 text-slate-950 font-bold rounded-xl text-xs shadow-md shadow-cyan-500/20 transition flex items-center space-x-1.5"
                  >
                    <span>⚡</span>
                    <span>3-Question Fuel Check-In</span>
                  </button>
                  <button
                    onClick={() => handleAthleticEvaluation()}
                    className="px-4 py-2.5 bg-border-card hover:bg-slate-700 text-text-primary font-semibold rounded-xl text-xs transition"
                  >
                    Recalculate
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-5 bg-bg-card rounded-2xl p-6 border border-border-card shadow-sm space-y-4">
                  <div className="flex justify-between items-center border-b border-border-card pb-3">
                    <h3 className="text-sm font-bold text-text-primary">Training &amp; Fuel Inputs</h3>
                    <button
                      onClick={() => setIsEnergyWizardOpen(true)}
                      className="text-[10px] text-accent-cyan hover:underline font-bold bg-cyan-950/50 px-2 py-0.5 rounded border border-accent-cyan/30"
                    >
                      ✨ Use 3-Question Wizard
                    </button>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-semibold">
                      <span>Fat-Free Mass (FFM)</span>
                      <span className="font-mono text-accent-cyan">{ffm.toFixed(1)} kg</span>
                    </div>
                    <input
                      type="range"
                      min="35"
                      max="80"
                      step="0.5"
                      value={ffm}
                      onChange={(e) => setFfm(parseFloat(e.target.value))}
                      className="w-full mt-1 accent-accent-cyan"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-semibold">
                      <span>Daily Food Intake (Caloric Fuel)</span>
                      <span className="font-mono text-accent-cyan">{calIn} kcal</span>
                    </div>
                    <input
                      type="range"
                      min="1000"
                      max="4000"
                      step="50"
                      value={calIn}
                      onChange={(e) => setCalIn(parseFloat(e.target.value))}
                      className="w-full mt-1 accent-accent-cyan"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-semibold">
                      <span>Workout Energy Burnt (Expenditure)</span>
                      <span className="font-mono text-accent-cyan">{calExp} kcal</span>
                    </div>
                    <input
                      type="range"
                      min="200"
                      max="2500"
                      step="50"
                      value={calExp}
                      onChange={(e) => setCalExp(parseFloat(e.target.value))}
                      className="w-full mt-1 accent-accent-cyan"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <div>
                      <label className="text-xs font-semibold text-text-secondary">Acute 7d Load</label>
                      <input
                        type="number"
                        value={acuteLoad}
                        onChange={(e) => setAcuteLoad(parseFloat(e.target.value))}
                        className="w-full mt-1 p-2 bg-bg-main border border-border-card rounded-xl font-mono text-xs text-text-primary"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-text-secondary">Chronic 28d Load</label>
                      <input
                        type="number"
                        value={chronicLoad}
                        onChange={(e) => setChronicLoad(parseFloat(e.target.value))}
                        className="w-full mt-1 p-2 bg-bg-main border border-border-card rounded-xl font-mono text-xs text-text-primary"
                      />
                    </div>
                  </div>

                  <button
                    onClick={() => handleAthleticEvaluation()}
                    className="w-full py-2.5 bg-accent-cyan hover:bg-cyan-400 text-slate-950 font-bold rounded-xl text-xs shadow transition"
                  >
                    Update Live Metrics &rarr;
                  </button>
                </div>

                <div className="lg:col-span-7 space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-bg-card rounded-2xl p-5 border border-border-card shadow-sm">
                      <span className="text-[10px] font-bold text-text-secondary uppercase">
                        Energy Availability (Fuel Index)
                      </span>
                      <div className="text-3xl font-black text-accent-rose mt-1">
                        {ea.toFixed(2)}{" "}
                        <span className="text-xs text-text-secondary font-normal">kcal/kg FFM/day</span>
                      </div>
                      <div className="mt-2">
                        {redsFlag ? (
                          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-rose-950 text-accent-rose border border-accent-rose/30">
                            Low Fuel Energy Deficit Alert (&lt;30)
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-950 text-accent-emerald border border-accent-emerald/30">
                            Optimal Fuel Availability
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="bg-bg-card rounded-2xl p-5 border border-border-card shadow-sm">
                      <span className="text-[10px] font-bold text-text-secondary uppercase">
                        Acute:Chronic Workload Ratio (ACWR)
                      </span>
                      <div className="text-3xl font-black text-amber-400 mt-1">
                        {acwr.toFixed(2)}{" "}
                        <span className="text-xs text-text-secondary font-normal">Ratio (7d/28d)</span>
                      </div>
                      <div className="mt-2">
                        <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-950 text-amber-400 border border-amber-500/30">
                          {acwr > 1.3 ? "High Load Caution Zone" : "Sweet Spot (0.8 - 1.3)"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {redsFlag && (
                    <div className="bg-rose-950/40 border border-accent-rose/40 rounded-2xl p-5">
                      <h4 className="text-sm font-bold text-accent-rose flex items-center space-x-2">
                        <span>🛡️</span>
                        <span>Low Fuel Defense Shield Triggered</span>
                      </h4>
                      <p className="text-xs text-text-secondary mt-1 leading-relaxed">
                        {athleticWarning}
                      </p>
                    </div>
                  )}
                  <MetricCharts
                    charts={[
                      {
                        title: "Energy availability",
                        unit: "kcal/kg FFM/day",
                        maxValue: 50,
                        data: [
                          { label: "Current", value: ea, color: "#f43f5e" },
                          { label: "Reference", value: 30, color: "#10b981" },
                        ],
                      },
                      {
                        title: "Acute-to-chronic workload",
                        unit: "ratio",
                        maxValue: 2,
                        data: [
                          { label: "Current", value: acwr, color: "#f59e0b" },
                          { label: "Guide", value: 1.3, color: "#06b6d4" },
                        ],
                      },
                    ]}
                  />
                  {telemetryHistory.length > 0 && (
                    <BiometricCharts data={telemetryHistory} />
                  )}
                </div>
              </div>
            </div>
          )}

          {workspace === "cycle" && (
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-bg-card via-slate-900 to-bg-card border border-border-card rounded-3xl p-6 text-text-primary shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-rose-950 border border-accent-rose/30 px-2.5 py-1 rounded-full text-accent-rose">
                    Dual-Translation Engine &bull; Pillar 2
                  </span>
                  <h2 className="text-2xl font-black mt-2">Cycle &amp; Hormonal Patterns Intelligence</h2>
                  <p className="text-text-secondary text-xs mt-1 max-w-xl">
                    Plain-English body signal awareness powered by Rotterdam diagnostic criteria and localized TreeSHAP additive explanations.
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setIsCycleWizardOpen(true)}
                    className="px-4 py-2.5 bg-accent-rose hover:bg-rose-400 text-slate-950 font-bold rounded-xl text-xs shadow-md shadow-rose-500/20 transition flex items-center space-x-1.5"
                  >
                    <span>🌸</span>
                    <span>3-Question Body Check-In</span>
                  </button>
                  <button
                    onClick={() => handleEndocrineInference()}
                    className="px-4 py-2.5 bg-border-card hover:bg-slate-700 text-text-primary font-semibold rounded-xl text-xs transition"
                  >
                    Run Inference
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-5 bg-bg-card rounded-2xl p-6 border border-border-card shadow-sm space-y-4">
                  <div className="flex justify-between items-center border-b border-border-card pb-3">
                    <h3 className="text-sm font-bold text-text-primary">Body Signal Markers</h3>
                    <button
                      onClick={() => setIsCycleWizardOpen(true)}
                      className="text-[10px] text-accent-cyan hover:underline font-bold bg-cyan-950/50 px-2 py-0.5 rounded border border-accent-cyan/30"
                    >
                      ✨ 3-Question Check-In
                    </button>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-semibold">
                      <span>Hormone Balance Score</span>
                      <span className="font-mono text-accent-cyan">{lhFsh.toFixed(2)}</span>
                    </div>
                    <input
                      type="range"
                      min="0.5"
                      max="5.0"
                      step="0.1"
                      value={lhFsh}
                      onChange={(e) => setLhFsh(parseFloat(e.target.value))}
                      className="w-full mt-1 accent-accent-cyan"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-semibold">
                      <span>Skin &amp; Energy Marker</span>
                      <span className="font-mono text-accent-cyan">{freeT.toFixed(1)} ng/dL</span>
                    </div>
                    <input
                      type="range"
                      min="10"
                      max="120"
                      step="0.5"
                      value={freeT}
                      onChange={(e) => setFreeT(parseFloat(e.target.value))}
                      className="w-full mt-1 accent-accent-cyan"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-semibold">
                      <span>Cycle Shift (Days)</span>
                      <span className="font-mono text-accent-cyan">{cycleVar.toFixed(1)} days</span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="30"
                      step="0.2"
                      value={cycleVar}
                      onChange={(e) => setCycleVar(parseFloat(e.target.value))}
                      className="w-full mt-1 accent-accent-cyan"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-semibold">
                      <span>Body Hair Density</span>
                      <span className="font-mono text-accent-cyan">{hirsutism} / 36</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="36"
                      step="1"
                      value={hirsutism}
                      onChange={(e) => setHirsutism(parseInt(e.target.value))}
                      className="w-full mt-1 accent-accent-cyan"
                    />
                  </div>

                  <button
                    onClick={() => handleEndocrineInference()}
                    className="w-full py-2.5 bg-accent-cyan hover:bg-cyan-400 text-slate-950 font-bold rounded-xl text-xs shadow transition"
                  >
                    Re-analyze Pattern Similarity &rarr;
                  </button>
                </div>

                <div className="lg:col-span-7 space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-bg-card rounded-2xl p-5 border border-border-card shadow-sm">
                      <span className="text-[10px] font-bold text-text-secondary uppercase">
                        PCOS Pattern Match
                      </span>
                      <div className="flex items-baseline space-x-2 mt-1">
                        <span className="text-3xl font-black text-accent-rose">
                          {(pcosRisk * 100).toFixed(1)}%
                        </span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-950 text-accent-rose border border-accent-rose/30">
                          {riskClassification.replace(/_/g, " ")}
                        </span>
                      </div>
                      <div className="w-full bg-border-card rounded-full h-2 mt-3 overflow-hidden">
                        <div
                          className="bg-accent-rose h-2 rounded-full"
                          style={{ width: `${pcosRisk * 100}%` }}
                        ></div>
                      </div>
                    </div>

                    <div className="bg-bg-card rounded-2xl p-5 border border-border-card shadow-sm">
                      <span className="text-[10px] font-bold text-text-secondary uppercase">
                        Endometriosis Correlation Index
                      </span>
                      <div className="text-3xl font-black text-amber-400 mt-1">
                        {(endoRisk * 100).toFixed(1)}%
                      </div>
                    </div>
                  </div>
                  <MetricCharts
                    charts={[
                      {
                        title: "Pattern risk scores",
                        unit: "%",
                        maxValue: 100,
                        data: [
                          {
                            label: "PCOS pattern",
                            value: pcosRisk * 100,
                            color: "#f43f5e",
                          },
                          {
                            label: "Endometriosis",
                            value: endoRisk * 100,
                            color: "#f59e0b",
                          },
                        ],
                      },
                    ]}
                  />
                  {telemetryHistory.length > 0 && (
                    <BiometricCharts data={telemetryHistory} />
                  )}
                </div>
              </div>
            </div>
          )}

          {workspace === "gestational" && (
            <section className="space-y-6">
              <header className="rounded-3xl border border-border-card bg-gradient-to-r from-bg-card via-slate-900 to-bg-card p-6">
                <span className="text-[10px] font-bold uppercase tracking-wider text-purple-300">Pillar 3 · Gestational Safety</span>
                <h2 className="mt-2 text-2xl font-black">Vascular Strain &amp; MAP Trends</h2>
                <p className="mt-1 text-xs text-text-secondary">Review blood pressure signals and run a gestational risk check.</p>
              </header>
              <div className="grid gap-6 lg:grid-cols-2">
                <div className="space-y-4 rounded-2xl border border-border-card bg-bg-card p-6">
                  <label className="block text-xs font-semibold text-text-secondary">
                    Gestational age (weeks)
                    <input type="number" min="1" max="42" value={gestWeeks} onChange={(e) => setGestWeeks(Number(e.target.value))} className="mt-1 w-full rounded-xl border border-border-card bg-bg-main p-2 text-text-primary" />
                  </label>
                  <label className="block text-xs font-semibold text-text-secondary">
                    Systolic blood pressure (mmHg)
                    <input type="number" min="50" max="250" value={gestSys} onChange={(e) => setGestSys(Number(e.target.value))} className="mt-1 w-full rounded-xl border border-border-card bg-bg-main p-2 text-text-primary" />
                  </label>
                  <label className="block text-xs font-semibold text-text-secondary">
                    Diastolic blood pressure (mmHg)
                    <input type="number" min="30" max="150" value={gestDia} onChange={(e) => setGestDia(Number(e.target.value))} className="mt-1 w-full rounded-xl border border-border-card bg-bg-main p-2 text-text-primary" />
                  </label>
                  <button type="button" onClick={handleGestationalCheck} className="w-full rounded-xl bg-accent-cyan py-2.5 text-xs font-bold text-slate-950 hover:bg-cyan-400">
                    Check gestational metrics
                  </button>
                </div>
                <div className="space-y-4 rounded-2xl border border-border-card bg-bg-card p-6">
                  <div>
                    <p className="text-xs uppercase text-text-secondary">Current mean arterial pressure</p>
                    <p className="mt-1 text-3xl font-black text-purple-300">{currentMap.toFixed(2)} <span className="text-sm font-normal">mmHg</span></p>
                  </div>
                  <div>
                    <p className="text-xs uppercase text-text-secondary">Bayesian baseline</p>
                    <p className="mt-1 text-xl font-bold">{baselineMap.toFixed(2)} mmHg</p>
                  </div>
                  <p className={`rounded-xl border p-3 text-xs ${velocityAlert ? "border-rose-500/40 bg-rose-950/40 text-rose-200" : "border-emerald-500/40 bg-emerald-950/40 text-emerald-200"}`}>
                    {preeclampsiaClass.replace(/_/g, " ")} — {gestRecommendation}
                  </p>
                </div>
              </div>
              <MetricCharts
                charts={[
                  {
                    title: "Mean arterial pressure",
                    unit: "mmHg",
                    data: [
                      { label: "Current", value: currentMap, color: "#c084fc" },
                      { label: "Baseline", value: baselineMap, color: "#06b6d4" },
                    ],
                  },
                ]}
              />
              {telemetryHistory.length > 0 && <BiometricCharts data={telemetryHistory} />}
            </section>
          )}

          {workspace === "community" && (
            <CommunityHub userId={userId} athleteName={athleteNames[userId]} />
          )}

          {workspace === "doctor" && (
            <section className="space-y-6">
              <header className="rounded-3xl border border-border-card bg-gradient-to-r from-bg-card via-slate-900 to-bg-card p-6">
                <span className="text-[10px] font-bold uppercase tracking-wider text-accent-emerald">Clinical Handoff</span>
                <h2 className="mt-2 text-2xl font-black">FHIR R4 Doctor Brief</h2>
                <p className="mt-1 text-xs text-text-secondary">Review or download the current patient bundle and open the printable clinical report.</p>
              </header>
              <div className="flex flex-wrap gap-3">
                <a href={api.getReportUrl(userId)} target="_blank" rel="noreferrer" className="rounded-xl bg-accent-cyan px-4 py-2.5 text-xs font-bold text-slate-950 hover:bg-cyan-400">
                  Open clinical report
                </a>
                <button type="button" onClick={() => api.getFhirBundle(userId).then(setFhirBundle).catch((err) => {
                  console.error("Failed to refresh the FHIR bundle:", err);
                  setDashboardError("Could not load the FHIR bundle. Check that the backend is running and try again.");
                })} className="rounded-xl border border-border-card bg-bg-card px-4 py-2.5 text-xs font-semibold hover:bg-slate-800">
                  Refresh FHIR bundle
                </button>
              </div>
              {fhirBundle ? (
                <FhirViewer bundle={fhirBundle} userId={userId} />
              ) : (
                <p className="rounded-xl border border-border-card bg-bg-card p-4 text-sm text-text-secondary">FHIR data is unavailable until the backend responds.</p>
              )}
              <MetricCharts
                charts={[
                  {
                    title: "FHIR resources in current bundle",
                    unit: "resources",
                    data: fhirResourceCounts,
                  },
                ]}
              />
              {telemetryHistory.length > 0 && <BiometricCharts data={telemetryHistory} />}
            </section>
          )}

          {isCycleWizardOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
              <form onSubmit={handleCycleWizardSubmit} className="w-full max-w-lg space-y-4 rounded-2xl border border-border-card bg-bg-card p-6 shadow-2xl">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-bold">Cycle body check-in</h2>
                  <button type="button" onClick={() => setIsCycleWizardOpen(false)} aria-label="Close cycle check-in" className="text-xl text-text-secondary">&times;</button>
                </div>
                <label className="block text-xs text-text-secondary">Cycle timing
                  <select value={wizTiming} onChange={(e) => setWizTiming(e.target.value)} className="mt-1 w-full rounded-lg border border-border-card bg-bg-main p-2 text-text-primary">
                    <option value="ontime">On time</option><option value="late5_10">5–10 days late</option><option value="skipped">Skipped</option>
                  </select>
                </label>
                <label className="block text-xs text-text-secondary">Skin and hair changes
                  <select value={wizSkin} onChange={(e) => setWizSkin(e.target.value)} className="mt-1 w-full rounded-lg border border-border-card bg-bg-main p-2 text-text-primary">
                    <option value="none">None</option><option value="mild">Mild</option><option value="high">Significant</option>
                  </select>
                </label>
                <label className="block text-xs text-text-secondary">Symptom intensity
                  <select value={wizIntensity} onChange={(e) => setWizIntensity(e.target.value)} className="mt-1 w-full rounded-lg border border-border-card bg-bg-main p-2 text-text-primary">
                    <option value="mild">Mild</option><option value="intense">Intense</option>
                  </select>
                </label>
                <button type="submit" className="w-full rounded-xl bg-accent-cyan py-2.5 text-xs font-bold text-slate-950">Analyze check-in</button>
              </form>
            </div>
          )}

          {isEnergyWizardOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
              <form onSubmit={handleEnergyWizardSubmit} className="w-full max-w-lg space-y-4 rounded-2xl border border-border-card bg-bg-card p-6 shadow-2xl">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-bold">Fuel check-in</h2>
                  <button type="button" onClick={() => setIsEnergyWizardOpen(false)} aria-label="Close fuel check-in" className="text-xl text-text-secondary">&times;</button>
                </div>
                <label className="block text-xs text-text-secondary">Meals and fuel
                  <select value={wizMeals} onChange={(e) => setWizMeals(e.target.value)} className="mt-1 w-full rounded-lg border border-border-card bg-bg-main p-2 text-text-primary">
                    <option value="well">Meals as usual</option><option value="low">Less than usual</option><option value="skipped">Skipped meals</option>
                  </select>
                </label>
                <label className="block text-xs text-text-secondary">Leg fatigue
                  <select value={wizLegs} onChange={(e) => setWizLegs(e.target.value)} className="mt-1 w-full rounded-lg border border-border-card bg-bg-main p-2 text-text-primary">
                    <option value="fresh">Fresh</option><option value="heavy">Heavy</option><option value="exhausted">Exhausted</option>
                  </select>
                </label>
                <label className="block text-xs text-text-secondary">Sleep quality
                  <select value={wizSleep} onChange={(e) => setWizSleep(e.target.value)} className="mt-1 w-full rounded-lg border border-border-card bg-bg-main p-2 text-text-primary">
                    <option value="deep">Restful</option><option value="poor">Poor</option>
                  </select>
                </label>
                <button type="submit" className="w-full rounded-xl bg-accent-cyan py-2.5 text-xs font-bold text-slate-950">Update energy metrics</button>
              </form>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}