import React, { useEffect, useState } from "react";
import { rateLimitApi } from "../api/rateLimitApi";
import { useToast } from "../context/ToastContext";
import { ShieldAlert, RefreshCw, Unlock } from "lucide-react";

export default function BlockedClients() {
  const [blocked, setBlocked] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToast } = useToast();

  const loadBlockedClients = async () => {
    setLoading(true);
    try {
      const res = await rateLimitApi.getBlockedClients();
      setBlocked(res.data);
    } catch (err) {
      addToast(err.message || "Failed to fetch blocked clients", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBlockedClients();
  }, []);

  const handleUnblock = async (ip, routeId) => {
    if (!window.confirm(`Are you sure you want to unblock IP address ${ip}?`))
      return;
    try {
      await rateLimitApi.unblockClient(ip, routeId);
      addToast(`Client ${ip} unblocked successfully`, "success");
      loadBlockedClients();
    } catch (err) {
      addToast(err.message || "Unblock action failed", "error");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-lg font-bold text-slate-900">Blocked Clients</h1>
          <p className="text-xs text-slate-500">
            Temporarily isolated IP addresses due to security rate limit
            breaches
          </p>
        </div>
        <button
          onClick={loadBlockedClients}
          className="px-3 py-1.5 border border-slate-300 rounded text-xs text-slate-600 hover:bg-slate-100 flex items-center gap-1.5"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Refresh
        </button>
      </div>

      <div className="bg-white rounded border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-xs text-slate-500">
            Fetching blocked client table...
          </div>
        ) : blocked.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500">
            No client IP addresses currently blocked.
          </div>
        ) : (
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100 text-slate-600 border-b border-slate-200 uppercase tracking-wider text-[10px] font-bold">
                <th className="p-3">Client / IP Address</th>
                <th className="p-3">Triggered Route</th>
                <th className="p-3">Reason</th>
                <th className="p-3">Blocked At</th>
                <th className="p-3">Expires At</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {blocked.map((b, idx) => (
                <tr key={idx} className="hover:bg-slate-50/80">
                  <td className="p-3 font-mono font-bold text-red-600">
                    {b.ip}
                  </td>
                  <td className="p-3 font-mono text-slate-700">{b.routeId}</td>
                  <td className="p-3 text-slate-600">{b.reason}</td>
                  <td className="p-3 font-mono text-slate-500">
                    {b.blockedAt}
                  </td>
                  <td className="p-3 font-mono text-slate-500">
                    {b.expiresAt}
                  </td>
                  <td className="p-3">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${b.status === "BLOCKED" ? "bg-red-50 text-red-700 border border-red-200" : "bg-slate-100 text-slate-600"}`}
                    >
                      {b.status}
                    </span>
                  </td>
                  <td className="p-3 text-right">
                    {b.status === "BLOCKED" && (
                      <button
                        onClick={() => handleUnblock(b.ip, b.routeId)}
                        className="px-2.5 py-1 bg-amber-50 text-amber-800 border border-amber-300 rounded text-[11px] font-medium hover:bg-amber-100 flex items-center gap-1 ml-auto"
                      >
                        <Unlock className="w-3 h-3" /> Unblock IP
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
