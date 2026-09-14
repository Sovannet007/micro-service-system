import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  GitFork,
  ShieldOff,
  Users,
  Activity,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
} from "lucide-react";

export const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(false);

  const navGroups = [
    {
      group: "API GATEWAY",
      items: [
        { label: "Overview", icon: LayoutDashboard, path: "/" },
        { label: "Routes", icon: GitFork, path: "/routes" },
        { label: "Blocked Clients", icon: ShieldOff, path: "/blocked-clients" },
      ],
    },
    {
      group: "AUTHENTICATION",
      items: [{ label: "Sessions", icon: Users, path: "/sessions" }],
    },
    {
      group: "MONITORING",
      items: [
        { label: "Prometheus", icon: Activity, path: "/monitoring/prometheus" },
        { label: "Grafana", icon: BarChart3, path: "/monitoring/grafana" },
      ],
    },
  ];

  return (
    <aside
      className={`bg-sidebar-bg text-slate-300 flex flex-col border-r border-slate-800 transition-all duration-300 z-30 shrink-0 ${
        collapsed ? "w-16" : "w-64"
      }`}
    >
      {/* Brand Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-slate-800">
        {!collapsed && (
          <div className="flex items-center space-x-2.5">
            <div className="p-1.5 bg-brand-600 rounded-md text-white">
              <ShieldCheck size={20} />
            </div>
            <span className="font-bold text-sm tracking-wide text-white">
              GATEWAY CONSOLE
            </span>
          </div>
        )}
        {collapsed && (
          <div className="mx-auto p-1.5 bg-brand-600 rounded-md text-white">
            <ShieldCheck size={20} />
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors hidden md:block"
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto py-4 px-2 space-y-6">
        {navGroups.map((group, idx) => (
          <div key={idx}>
            {!collapsed && (
              <h4 className="px-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                {group.group}
              </h4>
            )}
            <ul className="space-y-1">
              {group.items.map((item) => (
                <li key={item.path}>
                  <NavLink
                    to={item.path}
                    end={item.path === "/"}
                    className={({ isActive }) =>
                      `flex items-center space-x-3 px-3 py-2 rounded-md text-xs font-medium transition-colors ${
                        isActive
                          ? "bg-brand-600 text-white font-semibold shadow-sm"
                          : "text-slate-400 hover:text-slate-100 hover:bg-slate-800/60"
                      }`
                    }
                    title={collapsed ? item.label : undefined}
                  >
                    <item.icon size={18} className="shrink-0" />
                    {!collapsed && <span>{item.label}</span>}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Footer System Nav */}
      <div className="p-2 border-t border-slate-800">
        <NavLink
          to="/profile"
          className={({ isActive }) =>
            `flex items-center space-x-3 px-3 py-2 rounded-md text-xs font-medium transition-colors ${
              isActive
                ? "bg-brand-600 text-white"
                : "text-slate-400 hover:text-white hover:bg-slate-800"
            }`
          }
        >
          <Settings size={18} className="shrink-0" />
          {!collapsed && <span>System Settings</span>}
        </NavLink>
      </div>
    </aside>
  );
};
