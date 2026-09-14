import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Activity,
  ArrowRight,
  CheckCircle2,
  Gauge,
  Network,
  RefreshCw,
  Server,
  ShieldAlert,
  Users,
  XCircle,
  ExternalLink,
} from "lucide-react";

import { routeApi } from "../api/routeApi";
import { rateLimitApi } from "../api/rateLimitApi";
import { useToast } from "../context/ToastContext";

export default function Dashboard() {
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [routes, setRoutes] = useState([]);
  const [rateLimits, setRateLimits] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    try {
      const [routesResponse, rateLimitsResponse] = await Promise.all([
        routeApi.getRoutes(),
        rateLimitApi.getRateLimits(),
      ]);

      setRoutes(routesResponse.data || []);
      setRateLimits(rateLimitsResponse.data || []);
    } catch (err) {
      addToast(err.message || "Failed to load dashboard data", "error");
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const activeRoutes = routes.filter((r) => r.enabled);
  const disabledRoutes = routes.filter((r) => !r.enabled);
  const activePolicies = rateLimits.filter((p) => p.active);
  const disabledPolicies = rateLimits.filter((p) => !p.active);

  return (
    <main className="space-y-6">
      {/* Header */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/80">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Gateway Dashboard
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time route management and security policy status
          </p>
        </div>

        <button
          onClick={loadDashboard}
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 px-3.5 py-2 rounded-lg border border-slate-300 bg-white text-xs font-medium text-slate-700 hover:bg-slate-50 active:bg-slate-100 disabled:opacity-50 transition-all shadow-sm"
        >
          <RefreshCw
            className={`w-3.5 h-3.5 ${loading ? "animate-spin text-blue-600" : "text-slate-500"}`}
          />
          <span>Refresh Metrics</span>
        </button>
      </header>

      {/* Gateway Status Banner */}
      <section className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-xl p-4 text-white shadow-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
              <Server className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-semibold tracking-wide">
                  API Gateway Core
                </h2>
                <span className="text-[10px] font-mono bg-slate-700/60 px-1.5 py-0.5 rounded text-slate-300">
                  v2.4.0
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Spring Cloud Gateway Subsystem
              </p>
            </div>
          </div>

          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-[11px] font-bold text-emerald-400 tracking-wider">
              OPERATIONAL
            </span>
          </div>
        </div>
      </section>

      {/* Metrics Grid */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryCard
          title="Total Routes"
          value={routes.length}
          description={`${activeRoutes.length} active routing paths`}
          icon={Network}
          iconClass="text-blue-600"
          iconBg="bg-blue-50"
        />
        <SummaryCard
          title="Active Routes"
          value={activeRoutes.length}
          description={`${disabledRoutes.length} disabled`}
          icon={CheckCircle2}
          iconClass="text-emerald-600"
          iconBg="bg-emerald-50"
        />
        <SummaryCard
          title="Rate Limit Policies"
          value={rateLimits.length}
          description={`${activePolicies.length} actively enforced`}
          icon={Gauge}
          iconClass="text-indigo-600"
          iconBg="bg-indigo-50"
        />
        <SummaryCard
          title="Disabled Policies"
          value={disabledPolicies.length}
          description="Requires policy review"
          icon={ShieldAlert}
          iconClass={
            disabledPolicies.length > 0 ? "text-amber-600" : "text-slate-400"
          }
          iconBg={disabledPolicies.length > 0 ? "bg-amber-50" : "bg-slate-100"}
        />
      </section>

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Routes Panel */}
        <section className="lg:col-span-2 bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <div>
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Gateway Routes
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Top active endpoint mappings
              </p>
            </div>
            <button
              onClick={() => navigate("/routes")}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 inline-flex items-center gap-1 group transition"
            >
              View all
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>

          {loading ? (
            <LoadingState />
          ) : routes.length === 0 ? (
            <EmptyState
              icon={Network}
              title="No routes configured"
              description="Register a new route to get started."
            />
          ) : (
            <div className="divide-y divide-slate-100">
              {routes.slice(0, 5).map((route) => (
                <div
                  key={route.routeId}
                  className="p-3.5 flex items-center justify-between gap-4 hover:bg-slate-50/80 transition-colors"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-mono font-semibold text-blue-600 truncate">
                      {route.routeId}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[11px] font-mono text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded">
                        {route.pathPattern}
                      </span>
                      <span className="text-slate-300">→</span>
                      <span className="text-[11px] text-slate-500 font-mono truncate max-w-[200px] sm:max-w-[300px]">
                        {route.uri}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                        route.enabled
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                          : "bg-slate-100 text-slate-600 border-slate-200"
                      }`}
                    >
                      {route.enabled ? (
                        <CheckCircle2 className="w-3 h-3" />
                      ) : (
                        <XCircle className="w-3 h-3" />
                      )}
                      {route.enabled ? "Active" : "Disabled"}
                    </span>
                    <button
                      onClick={() => navigate(`/routes/${route.routeId}`)}
                      className="p-1 rounded-md text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition"
                      aria-label="View route details"
                    >
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Policies Panel */}
        <section className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <div>
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Rate Limit Policies
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Traffic throttling status
              </p>
            </div>
            <Gauge className="w-4 h-4 text-slate-400" />
          </div>

          {loading ? (
            <LoadingState />
          ) : rateLimits.length === 0 ? (
            <EmptyState
              icon={Gauge}
              title="No policies found"
              description="Configure rate limits to protect endpoints."
            />
          ) : (
            <div className="divide-y divide-slate-100">
              {rateLimits.slice(0, 5).map((policy) => (
                <div
                  key={policy.routeId}
                  className="p-3.5 hover:bg-slate-50/80 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-semibold text-slate-700">
                      {policy.routeId}
                    </span>
                    <span
                      className={`text-[10px] font-bold tracking-wider ${
                        policy.active ? "text-emerald-600" : "text-slate-400"
                      }`}
                    >
                      {policy.active ? "ACTIVE" : "INACTIVE"}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 mt-2 text-[10px] font-medium text-slate-500">
                    <span className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-600">
                      {policy.replenishRate} req/s
                    </span>
                    <span>Burst: {policy.burstCapacity}</span>
                    <span className="text-slate-400">v{policy.version}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* Quick Access */}
      <section>
        <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3">
          Quick Actions
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <QuickAction
            icon={Network}
            title="Manage Routes"
            description="Create, update, or disable gateway routes."
            onClick={() => navigate("/routes")}
          />
          <QuickAction
            icon={Users}
            title="Active Sessions"
            description="Audit administrator access and active security sessions."
            onClick={() => navigate("/sessions")}
          />
          <QuickAction
            icon={Activity}
            title="Grafana Metrics"
            description="View real-time traffic, latency, and error metrics."
            isExternal
            onClick={() =>
              window.open(
                "http://localhost:3000",
                "_blank",
                "noopener,noreferrer",
              )
            }
          />
        </div>
      </section>
    </main>
  );
}

function SummaryCard({
  title,
  value,
  description,
  icon: Icon,
  iconClass,
  iconBg,
}) {
  return (
    <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm flex items-start justify-between">
      <div>
        <p className="text-xs font-medium text-slate-500">{title}</p>
        <p className="text-2xl font-bold text-slate-900 mt-1">{value}</p>
        <p className="text-[11px] text-slate-400 mt-0.5">{description}</p>
      </div>
      <div
        className={`w-9 h-9 rounded-lg ${iconBg} flex items-center justify-center`}
      >
        <Icon className={`w-5 h-5 ${iconClass}`} />
      </div>
    </div>
  );
}

function QuickAction({ icon: Icon, title, description, onClick, isExternal }) {
  return (
    <button
      onClick={onClick}
      className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm text-left hover:border-slate-300 hover:shadow transition-all group"
    >
      <div className="flex items-center gap-3.5">
        <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center group-hover:bg-blue-50 transition-colors">
          <Icon className="w-4 h-4 text-slate-600 group-hover:text-blue-600 transition-colors" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-slate-800">{title}</p>
          <p className="text-[11px] text-slate-500 mt-0.5 truncate">
            {description}
          </p>
        </div>
        {isExternal ? (
          <ExternalLink className="w-4 h-4 text-slate-300 group-hover:text-slate-500 transition-colors" />
        ) : (
          <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-slate-500 group-hover:translate-x-0.5 transition-all" />
        )}
      </div>
    </button>
  );
}

function LoadingState() {
  return (
    <div className="p-8 text-center text-xs text-slate-400 flex flex-col items-center justify-center gap-2">
      <RefreshCw className="w-4 h-4 animate-spin text-blue-600" />
      <span>Fetching gateway configuration...</span>
    </div>
  );
}

function EmptyState({ icon: Icon, title, description }) {
  return (
    <div className="p-8 text-center">
      <Icon className="w-6 h-6 mx-auto text-slate-300" />
      <p className="text-xs font-semibold text-slate-700 mt-2">{title}</p>
      <p className="text-[11px] text-slate-400 mt-0.5">{description}</p>
    </div>
  );
}
