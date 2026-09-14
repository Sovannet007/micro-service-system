import React, { useEffect, useState } from "react";
import { rateLimitApi } from "../api/rateLimitApi";
import { useToast } from "../context/ToastContext";
import { Gauge, Plus, RefreshCw, Eye, Edit } from "lucide-react";
import { useNavigate } from "react-router-dom";
import RateLimitFormModal from "./RateLimitFormModal";

export default function RateLimits() {
  const [limits, setLimits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedLimit, setSelectedLimit] = useState(null);
  const { addToast } = useToast();
  const navigate = useNavigate();

  const loadRateLimits = async () => {
    setLoading(true);
    try {
      const res = await rateLimitApi.getRateLimits();
      setLimits(res.data);
    } catch (err) {
      addToast(err.message || "Failed to fetch rate limits", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRateLimits();
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-lg font-bold text-slate-900">
            Rate Limit Policies
          </h1>
          <p className="text-xs text-slate-500">
            Redis Token Bucket algorithm configurations per route
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={loadRateLimits}
            className="px-3 py-1.5 border border-slate-300 rounded text-xs text-slate-600 hover:bg-slate-100 flex items-center gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Refresh
          </button>
          <button
            onClick={() => {
              setSelectedLimit(null);
              setIsModalOpen(true);
            }}
            className="px-3 py-1.5 bg-blue-600 text-white rounded text-xs font-medium hover:bg-blue-700 flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" /> Configure Policy
          </button>
        </div>
      </div>

      <div className="bg-white rounded border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-xs text-slate-500">
            Loading Rate Limit Policies...
          </div>
        ) : (
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100 text-slate-600 border-b border-slate-200 uppercase tracking-wider text-[10px] font-bold">
                <th className="p-3">Route ID</th>
                <th className="p-3">Replenish Rate</th>
                <th className="p-3">Burst Capacity</th>
                <th className="p-3">Requested Tokens</th>
                <th className="p-3">Block Duration</th>
                <th className="p-3">Version</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {limits.map((l) => (
                <tr key={l.routeId} className="hover:bg-slate-50/80">
                  <td className="p-3 font-mono font-semibold text-blue-600">
                    {l.routeId}
                  </td>
                  <td className="p-3 font-mono text-slate-700">
                    {l.replenishRate} req/s
                  </td>
                  <td className="p-3 font-mono text-slate-700">
                    {l.burstCapacity} tokens
                  </td>
                  <td className="p-3 font-mono text-slate-700">
                    {l.requestedTokens} token/req
                  </td>
                  <td className="p-3 font-mono text-slate-700">
                    {l.tempBlockEnabled
                      ? `${l.blockDurationSeconds}s`
                      : "Disabled"}
                  </td>
                  <td className="p-3 font-mono font-semibold text-indigo-600">
                    {l.version}
                  </td>
                  <td className="p-3">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-semibold ${l.active ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-slate-100 text-slate-600"}`}
                    >
                      {l.active ? "ACTIVE" : "INACTIVE"}
                    </span>
                  </td>
                  <td className="p-3 text-right space-x-1">
                    <button
                      onClick={() => navigate(`/rate-limits/${l.routeId}`)}
                      title="View Detail & History"
                      className="p-1 hover:bg-slate-100 text-slate-600 rounded"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        setSelectedLimit(l);
                        setIsModalOpen(true);
                      }}
                      title="Edit"
                      className="p-1 hover:bg-slate-100 text-slate-600 rounded"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {isModalOpen && (
        <RateLimitFormModal
          limit={selectedLimit}
          onClose={() => setIsModalOpen(false)}
          onSuccess={() => {
            setIsModalOpen(false);
            loadRateLimits();
          }}
        />
      )}
    </div>
  );
}
