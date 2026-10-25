import React from "react";
import { Workspace } from "./Sidebar";

interface ProblemGatewayProps {
  onSelectWorkspace: (ws: Workspace) => void;
  isLoggedIn?: boolean;
  onSignIn?: () => void;
  activeUserName?: string;
}

export const ProblemGateway: React.FC<ProblemGatewayProps> = ({
  onSelectWorkspace,
  isLoggedIn = true,
  onSignIn,
  activeUserName = "Sarah Jenkins",
}) => {
  return (
    <div className="space-y-8 text-text-primary">
      {/* If Not Logged In: Layer 1 Public Hero */}
      {!isLoggedIn ? (
        <div className="space-y-12">
          {/* Hero Banner */}
          <div className="text-center max-w-4xl mx-auto space-y-6 pt-4">
            <div className="inline-flex items-center space-x-2 bg-bg-card border border-border-card px-4 py-1.5 rounded-full text-xs font-semibold text-accent-cyan shadow-inner">
              <span className="w-2 h-2 rounded-full bg-accent-emerald inline-block"></span>
              <span>recHERsion '26 &bull; ACM-W NITK Surathkal</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
              Closing the Diagnostic Gap in <br />
              <span className="bg-gradient-to-r from-accent-cyan via-teal-300 to-accent-emerald bg-clip-text text-transparent">
                Female Athlete Health
              </span>
            </h1>
            <p className="text-base text-text-secondary max-w-2xl mx-auto leading-relaxed">
              Continuous physiological intelligence, energy tracking, and body awareness for active women. Bridging daily fitness tracking, sports science (Low Energy Availability / REDs), and female endocrinology.
            </p>
            <div className="pt-2 flex justify-center">
              <button
                onClick={onSignIn}
                className="px-8 py-3.5 rounded-xl bg-accent-cyan hover:bg-cyan-400 text-slate-950 font-extrabold text-sm shadow-xl shadow-cyan-500/20 transition-all transform hover:-translate-y-0.5"
              >
                Sign In to Platform &rarr;
              </button>
            </div>
          </div>

          {/* 6 Data Banner Grid (PRD v9 Section 5.1) */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-border-card pb-3">
              <div>
                <h2 className="text-lg font-black text-text-primary">
                  The Female Athlete Diagnostic Gap in Numbers
                </h2>
                <p className="text-xs text-text-secondary">
                  Clinical endocrinology, Olympic sports science, and maternal epidemiological benchmarks
                </p>
              </div>
              <span className="text-xs font-mono bg-bg-card text-accent-cyan border border-border-card px-2.5 py-1 rounded-lg font-semibold">
                Rotterdam &bull; IOC RED-S &bull; ACOG
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Stat 1 */}
              <div className="bg-bg-card rounded-2xl p-6 border border-border-card space-y-2 hover:border-accent-cyan/50 transition">
                <div className="text-3xl font-black text-accent-cyan">7–10 Years</div>
                <p className="text-xs text-text-secondary leading-relaxed">
                  Diagnostic delay for complex endocrine conditions like <strong className="text-text-primary">PCOS and endometriosis</strong>.
                </p>
                <span className="text-[10px] text-accent-cyan block font-semibold">
                  TreeSHAP explainability bridges this gap
                </span>
              </div>

              {/* Stat 2 */}
              <div className="bg-bg-card rounded-2xl p-6 border border-border-card space-y-2 hover:border-accent-emerald/50 transition">
                <div className="text-3xl font-black text-accent-emerald">65%</div>
                <p className="text-xs text-text-secondary leading-relaxed">
                  Active women experiencing <strong className="text-text-primary">unmonitored energy availability drops (REDs)</strong>.
                </p>
                <span className="text-[10px] text-accent-emerald block font-semibold">
                  Preempted by Low Fuel Defense Shield
                </span>
              </div>

              {/* Stat 3 */}
              <div className="bg-bg-card rounded-2xl p-6 border border-border-card space-y-2 hover:border-accent-rose/50 transition">
                <div className="text-3xl font-black text-accent-rose">85%</div>
                <p className="text-xs text-text-secondary leading-relaxed">
                  Delayed preeclampsia detection using <strong className="text-text-primary">traditional static blood pressure cutoffs</strong>.
                </p>
                <span className="text-[10px] text-accent-rose block font-semibold">
                  Bayesian hemodynamic velocity tracker
                </span>
              </div>

              {/* Stat 4 */}
              <div className="bg-bg-card rounded-2xl p-6 border border-border-card space-y-2 hover:border-accent-cyan/50 transition">
                <div className="text-3xl font-black text-accent-cyan">78%</div>
                <p className="text-xs text-text-secondary leading-relaxed">
                  Active women reporting symptoms <strong className="text-text-primary">dismissed as routine exercise fatigue</strong>.
                </p>
                <span className="text-[10px] text-accent-cyan block font-semibold">
                  Everyday 3-Question Body Check-In
                </span>
              </div>

              {/* Stat 5 */}
              <div className="bg-bg-card rounded-2xl p-6 border border-border-card space-y-2 hover:border-accent-rose/50 transition">
                <div className="text-3xl font-black text-accent-rose">43%</div>
                <p className="text-xs text-text-secondary leading-relaxed">
                  Teenage girls <strong className="text-text-primary">dropping out of active sports</strong> due to unmanaged cycle friction.
                </p>
                <span className="text-[10px] text-accent-rose block font-semibold">
                  Peer Community Hub &amp; anonymous support
                </span>
              </div>

              {/* Stat 6 */}
              <div className="bg-bg-card rounded-2xl p-6 border border-border-card space-y-2 hover:border-accent-emerald/50 transition">
                <div className="text-3xl font-black text-accent-emerald">15 min &rarr; 1 min</div>
                <p className="text-xs text-text-secondary leading-relaxed">
                  Compression of multi-week telemetry into <strong className="text-text-primary">single-page FHIR doctor briefs</strong>.
                </p>
                <span className="text-[10px] text-accent-emerald block font-semibold">
                  LOINC vital signs &amp; SNOMED handoff
                </span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* If Logged In: Layer 2 Gateway */
        <div className="space-y-8">
          {/* Welcome Banner */}
          <div className="bg-gradient-to-br from-bg-card via-slate-900 to-bg-main rounded-3xl p-6 sm:p-8 border border-border-card shadow-xl relative overflow-hidden">
            <div className="max-w-3xl space-y-3 relative z-10">
              <div className="inline-flex items-center space-x-2 bg-cyan-950/60 border border-accent-cyan/40 px-3 py-1 rounded-full text-xs font-semibold text-accent-cyan">
                <span>Overview &bull; Layer 2</span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight">
                Welcome back, <span className="text-accent-cyan">{activeUserName}</span>
              </h1>
              <p className="text-text-secondary text-xs sm:text-sm leading-relaxed">
                Your continuous body intelligence station. Select an operational workspace below to monitor live fuel metrics, explore cycle and hormonal patterns, track vascular strain velocity, or participate in peer community circles.
              </p>
            </div>
          </div>

          {/* 4 Workspace Selector Cards (PRD v9 Section 5.2) */}
          <div>
            <h2 className="text-lg font-black text-text-primary mb-1">
              Select an Operational Workspace
            </h2>
            <p className="text-xs text-text-secondary mb-4">
              Choose your physiological intelligence hub to view continuous biometrics
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Portal 1: Energy & Athletic OS */}
              <div
                onClick={() => onSelectWorkspace("energy")}
                className="bg-bg-card p-6 rounded-2xl border border-border-card hover:border-accent-cyan shadow-sm transition cursor-pointer group"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-text-primary group-hover:text-accent-cyan transition">
                    Energy &amp; Athletic OS
                  </h3>
                  <span className="text-[10px] bg-cyan-950 text-accent-cyan px-2 py-0.5 rounded-full font-mono font-bold">
                    Pillar 1
                  </span>
                </div>
                <p className="text-xs text-text-secondary mt-2 leading-relaxed">
                  <strong>Fuel index, workload balance, REDs shield.</strong> Real-time calculation of Energy Availability (EA) and ACWR workload spikes to preempt period pauses.
                </p>
                <div className="mt-4 flex items-center text-xs font-bold text-accent-cyan">
                  <span>Launch Energy OS Workspace &rarr;</span>
                </div>
              </div>

              {/* Portal 2: Cycle & Hormonal Patterns */}
              <div
                onClick={() => onSelectWorkspace("cycle")}
                className="bg-bg-card p-6 rounded-2xl border border-border-card hover:border-accent-rose shadow-sm transition cursor-pointer group"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-text-primary group-hover:text-accent-rose transition">
                    Cycle &amp; Hormonal Patterns
                  </h3>
                  <span className="text-[10px] bg-rose-950 text-accent-rose px-2 py-0.5 rounded-full font-mono font-bold">
                    Pillar 2
                  </span>
                </div>
                <p className="text-xs text-text-secondary mt-2 leading-relaxed">
                  <strong>Cycle shifts, body signals, PCOS pattern detection.</strong> Everyday 3-question body check-in translating symptoms into plain-English TreeSHAP insight breakdowns.
                </p>
                <div className="mt-4 flex items-center text-xs font-bold text-accent-rose">
                  <span>Analyze Cycle Signals &rarr;</span>
                </div>
              </div>

              {/* Portal 3: Gestational Safety Engine */}
              <div
                onClick={() => onSelectWorkspace("gestational")}
                className="bg-bg-card p-6 rounded-2xl border border-border-card hover:border-purple-500 shadow-sm transition cursor-pointer group"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-text-primary group-hover:text-purple-400 transition">
                    Gestational Safety Engine
                  </h3>
                  <span className="text-[10px] bg-purple-950 text-purple-400 px-2 py-0.5 rounded-full font-mono font-bold">
                    Pillar 3
                  </span>
                </div>
                <p className="text-xs text-text-secondary mt-2 leading-relaxed">
                  <strong>Blood pressure velocity trends &amp; vascular strain alerts.</strong> Dynamic Bayesian baseline updating (mean and variance tracking) for early preeclampsia risk detection.
                </p>
                <div className="mt-4 flex items-center text-xs font-bold text-purple-400">
                  <span>Track Vascular Strain &rarr;</span>
                </div>
              </div>

              {/* Portal 4: Peer Community Hub */}
              <div
                onClick={() => onSelectWorkspace("community")}
                className="bg-bg-card p-6 rounded-2xl border border-border-card hover:border-accent-emerald shadow-sm transition cursor-pointer group"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-text-primary group-hover:text-accent-emerald transition">
                    Peer Community Hub
                  </h3>
                  <span className="text-[10px] bg-emerald-950 text-accent-emerald px-2 py-0.5 rounded-full font-mono font-bold">
                    Safe Space
                  </span>
                </div>
                <p className="text-xs text-text-secondary mt-2 leading-relaxed">
                  <strong>Topic circles, anonymous posting, and peer advice.</strong> Verified peer recovery advice, coach communication strategies, and dedicated support circles.
                </p>
                <div className="mt-4 flex items-center text-xs font-bold text-accent-emerald">
                  <span>Join Athlete Circles &rarr;</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
