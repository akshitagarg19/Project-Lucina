import React from "react";

export type Workspace = "gateway" | "energy" | "cycle" | "gestational" | "community" | "doctor";

interface SidebarProps {
  currentWorkspace: Workspace;
  onSelectWorkspace: (ws: Workspace) => void;
  activeUserId: string;
  onChangeUser: (userId: string) => void;
  onSignOut?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentWorkspace,
  onSelectWorkspace,
  activeUserId,
  onChangeUser,
  onSignOut,
}) => {
  const navItems = [
    { label: "Overview", path: "/gateway" },
    { label: "Energy & Athletic Intelligence", path: "/energy" },
    { label: "Cycle & Hormonal Patterns", path: "/cycle" },
    { label: "Gestational Safety Engine", path: "/gestational" },
    { label: "Peer Community Hub", path: "/community" },
    { label: "Doctor Brief Export (FHIR PDF)", path: "/export" },
  ];

  const pathToWorkspace: Record<string, Workspace> = {
    "/gateway": "gateway",
    "/energy": "energy",
    "/cycle": "cycle",
    "/gestational": "gestational",
    "/community": "community",
    "/export": "doctor",
  };

  return (
    <aside className="w-64 bg-bg-card border-r border-border-card flex flex-col justify-between shrink-0 min-h-screen sticky top-0 z-40 hidden md:flex text-text-primary">
      <div>
        {/* Platform Branding */}
        <div className="p-5 border-b border-border-card">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-accent-cyan via-indigo-600 to-accent-rose flex items-center justify-center text-white font-black text-xl shadow-md">
              &Psi;
            </div>
            <div>
              <span className="text-lg font-black tracking-tight text-text-primary block leading-tight">
                Lucina <span className="text-accent-cyan">AI</span>
              </span>
              <p className="text-[10px] text-text-secondary font-bold uppercase tracking-wider">
                Athlete Health OS
              </p>
            </div>
          </div>
          <div className="mt-3 px-2 py-1 bg-cyan-950/40 border border-accent-cyan/30 rounded-lg">
            <p className="text-[10px] text-accent-cyan font-bold flex items-center space-x-1">
              <span className="w-1.5 h-1.5 rounded-full bg-accent-emerald inline-block"></span>
              <span>recHERsion '26 &bull; ACM-W NITK</span>
            </p>
          </div>
        </div>

        {/* Navigation Links */}
        <div className="p-3 space-y-1">
          <div className="px-3 py-1.5 text-[10px] font-bold text-text-secondary uppercase tracking-wider">
            Operational Workspaces
          </div>
          {navItems.map((item) => {
            const wsKey = pathToWorkspace[item.path];
            const isActive = currentWorkspace === wsKey;
            return (
              <button
                key={item.path}
                onClick={() => onSelectWorkspace(wsKey)}
                className={`w-full px-3 py-2.5 rounded-xl text-xs font-semibold flex items-center transition ${
                  isActive
                    ? "bg-accent-cyan/15 border-l-2 border-accent-cyan text-accent-cyan font-bold"
                    : "text-text-secondary hover:bg-border-card hover:text-text-primary"
                }`}
              >
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Athlete Selector & Footer */}
      <div className="p-4 border-t border-border-card bg-bg-main/50">
        <label className="block text-[10px] font-bold text-text-secondary uppercase mb-1">
          Active Athlete Profile
        </label>
        <select
          value={activeUserId}
          onChange={(e) => onChangeUser(e.target.value)}
          className="w-full bg-bg-card border border-border-card text-xs rounded-xl p-2 font-semibold text-text-primary shadow-sm focus:outline-none focus:border-accent-cyan"
        >
          <option value="223e4567-e89b-12d3-a456-426614174001">
            Sarah Jenkins (Distance Runner / RED-S)
          </option>
          <option value="123e4567-e89b-12d3-a456-426614174000">
            Maya Patel (Cricket Bowler / PCOS)
          </option>
          <option value="323e4567-e89b-12d3-a456-426614174002">
            Priya Sharma (Gestational 22w)
          </option>
        </select>
        <div className="mt-3 flex items-center justify-between text-[11px] text-text-secondary">
          <a href="http://127.0.0.1:8000/docs" target="_blank" rel="noreferrer" className="text-accent-cyan font-bold hover:underline">
            Swagger Docs &rarr;
          </a>
          {onSignOut && (
            <button onClick={onSignOut} className="text-accent-rose hover:underline font-semibold">
              Sign Out
            </button>
          )}
        </div>
      </div>
    </aside>
  );
};
