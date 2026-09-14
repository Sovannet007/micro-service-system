import { useState } from "react";
import { rateLimitApi } from "../../api/rateLimitApi";
import { useToast } from "../../context/ToastContext";
import { X, Info } from "lucide-react";

export default function RateLimitFormModal({ limit, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    routeId: limit?.routeId || "",
    replenishRate: limit?.replenishRate ?? 5,
    burstCapacity: limit?.burstCapacity ?? 10,
    requestedTokens: limit?.requestedTokens ?? 1,
    tempBlockEnabled: limit?.tempBlockEnabled ?? true,
    blockDurationSeconds: limit?.blockDurationSeconds ?? 300,
    active: limit?.active ?? true,
  });
  const [loading, setLoading] = useState(false);
  const { addToast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await rateLimitApi.saveRateLimit(formData);
      addToast(`Rate limit configuration saved successfully`, "success");
      onSuccess();
    } catch (err) {
      addToast(err.message || "Save failed", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl border border-slate-200 max-w-lg w-full overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-200 flex justify-between items-center bg-slate-50">
          <h3 className="text-xs font-bold text-slate-800 uppercase">
            Token Bucket Rate Limit Configuration
          </h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Route ID
            </label>
            <input
              type="text"
              required
              disabled={!!limit}
              value={formData.routeId}
              onChange={(e) =>
                setFormData({ ...formData, routeId: e.target.value })
              }
              placeholder="e.g., user-service"
              className="w-full px-3 py-1.5 border border-slate-300 rounded font-mono focus:ring-1 focus:ring-blue-500 outline-none disabled:bg-slate-100"
            />
          </div>

          {/* Visual Explanation Banner */}
          <div className="bg-blue-50 border border-blue-200 rounded p-3 text-[11px] text-blue-900 space-y-1">
            <div className="flex items-center gap-1 font-bold text-blue-950">
              <Info className="w-3.5 h-3.5 text-blue-600" /> Token Bucket
              Parameters:
            </div>
            <p>
              • <b>Replenish Rate:</b> Tokens added to bucket per second.
            </p>
            <p>
              • <b>Burst Capacity:</b> Max token capacity for short peak request
              spikes.
            </p>
            <p>
              • <b>Requested Tokens:</b> Tokens required to service 1 incoming
              HTTP call.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Replenish Rate
              </label>
              <input
                type="number"
                min="1"
                required
                value={formData.replenishRate}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    replenishRate: parseInt(e.target.value) || 1,
                  })
                }
                className="w-full px-3 py-1.5 border border-slate-300 rounded font-mono focus:ring-1 focus:ring-blue-500 outline-none"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Burst Capacity
              </label>
              <input
                type="number"
                min="1"
                required
                value={formData.burstCapacity}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    burstCapacity: parseInt(e.target.value) || 1,
                  })
                }
                className="w-full px-3 py-1.5 border border-slate-300 rounded font-mono focus:ring-1 focus:ring-blue-500 outline-none"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Req Tokens
              </label>
              <input
                type="number"
                min="1"
                required
                value={formData.requestedTokens}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    requestedTokens: parseInt(e.target.value) || 1,
                  })
                }
                className="w-full px-3 py-1.5 border border-slate-300 rounded font-mono focus:ring-1 focus:ring-blue-500 outline-none"
              />
            </div>
          </div>

          <div className="space-y-2 pt-2 border-t border-slate-100">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="tempBlock"
                checked={formData.tempBlockEnabled}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    tempBlockEnabled: e.target.checked,
                  })
                }
              />
              <label
                htmlFor="tempBlock"
                className="font-semibold text-slate-700"
              >
                Enable Temporary IP Block upon Violation
              </label>
            </div>

            {formData.tempBlockEnabled && (
              <div className="pl-5">
                <label className="block font-medium text-slate-600 mb-1">
                  Block Duration (Seconds)
                </label>
                <input
                  type="number"
                  min="10"
                  value={formData.blockDurationSeconds}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      blockDurationSeconds: parseInt(e.target.value) || 0,
                    })
                  }
                  className="w-48 px-3 py-1.5 border border-slate-300 rounded font-mono focus:ring-1 focus:ring-blue-500 outline-none"
                />
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 border border-slate-300 rounded text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-1.5 bg-blue-600 text-white rounded font-medium hover:bg-blue-700"
            >
              {loading ? "Saving Policy..." : "Save & Publish"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
