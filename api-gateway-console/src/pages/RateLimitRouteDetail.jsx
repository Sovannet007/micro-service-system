import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { rateLimitApi } from "../api/rateLimitApi";
import { useToast } from "../context/ToastContext";
import { ArrowLeft, History, Shield, CheckCircle } from "lucide-react";

export default function RateLimitRouteDetail() {
  const { routeId } = useParams();
  const navigate = useNavigate();
  const [activePolicy, setActivePolicy] = useState(null);
  const [versions, setVersions] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [pRes, vRes] = await Promise.all([
          rateLimitApi.getActiveLimitOnRoute(routeId),
          rateLimitApi.getLimitVersions(routeId),
        ]);
        setActivePolicy(pRes.data);
        setVersions(vRes.data);
      } catch (err) {
        addToast(err.message || "Failed to fetch policy details", "error");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [routeId]);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate("/rate-limits")}
          className="p-1.5 border border-slate-300 rounded hover:bg-slate-100 text-slate-600"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h1 className="text-lg font-bold text-slate-900">
            Rate Limit Policy Detail
          </h1>
          <p className="text-xs text-slate-500">
            Route target:{" "}
            <code className="text-blue-600 font-mono">{routeId}</code>
          </p>
        </div>
      </div>

      {loading ? (
        <div className="p-8 text-center text-xs text-slate-500">
          Loading policy state...
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Active Policy Status */}
          <div className="lg:col-span-1 bg-white p-5 rounded border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <span className="text-xs font-bold text-slate-700 uppercase flex items-center gap-1.5">
                <Shield className="w-4 h-4 text-emerald-600" /> Active
                Configuration
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                {activePolicy?.version || "v1"}
              </span>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between border-b border-slate-50 pb-2">
                <span className="text-slate-500">Replenish Rate</span>
                <span className="font-mono font-bold text-slate-800">
                  {activePolicy?.replenishRate} / sec
                </span>
              </div>
              <div className="flex justify-between border-b border-slate-50 pb-2">
                <span className="text-slate-500">Burst Capacity</span>
                <span className="font-mono font-bold text-slate-800">
                  {activePolicy?.burstCapacity} tokens
                </span>
              </div>
              <div className="flex justify-between border-b border-slate-50 pb-2">
                <span className="text-slate-500">Tokens per Request</span>
                <span className="font-mono font-bold text-slate-800">
                  {activePolicy?.requestedTokens}
                </span>
              </div>
              <div className="flex justify-between border-b border-slate-50 pb-2">
                <span className="text-slate-500">Temp Block Duration</span>
                <span className="font-mono font-bold text-slate-800">
                  {activePolicy?.blockDurationSeconds || 0} seconds
                </span>
              </div>
            </div>
          </div>

          {/* Revision History */}
          <div className="lg:col-span-2 bg-white p-5 rounded border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-slate-700 uppercase flex items-center gap-1.5 border-b border-slate-100 pb-3">
              <History className="w-4 h-4 text-slate-500" /> Policy Version
              History
            </h3>

            <div className="space-y-3">
              {versions.map((ver) => (
                <div
                  key={ver.version}
                  className="p-3 border border-slate-200 rounded flex items-center justify-between text-xs bg-slate-50/50"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-blue-600">
                        {ver.version}
                      </span>
                      {ver.status === "ACTIVE" && (
                        <span className="px-1.5 py-0.5 rounded text-[10px] bg-emerald-100 text-emerald-800 font-semibold">
                          Active
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 font-mono">
                      Rate: {ver.replenishRate}/s | Burst: {ver.burstCapacity} |
                      Created: {ver.createdAt} by {ver.createdBy}
                    </p>
                  </div>
                  {ver.status !== "ACTIVE" && (
                    <button className="px-2.5 py-1 border border-slate-300 bg-white rounded text-[11px] hover:bg-slate-100 text-slate-700 font-medium">
                      Rollback to {ver.version}
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
