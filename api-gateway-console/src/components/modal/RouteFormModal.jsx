import { useState } from "react";
import { routeApi } from "../../api/routeApi";
import { useToast } from "../../context/ToastContext";
import { X } from "lucide-react";

export default function RouteFormModal({ route, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    routeId: route?.routeId || "",
    uri: route?.uri || "",
    pathPattern: route?.pathPattern || "",
    stripPrefix: route?.stripPrefix ?? 1,
    order: route?.order ?? 0,
    enabled: route?.enabled ?? true,
  });
  const [loading, setLoading] = useState(false);
  const { addToast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await routeApi.saveRoute(formData);
      addToast(
        `Route ${route ? "updated" : "created"} successfully`,
        "success",
      );
      onSuccess();
    } catch (err) {
      addToast(err.message || "Operation failed", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl border border-slate-200 max-w-md w-full overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-200 flex justify-between items-center bg-slate-50">
          <h3 className="text-xs font-bold text-slate-800 uppercase">
            {route ? "Edit Route" : "Create New Route"}
          </h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-3 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Route ID
            </label>
            <input
              type="text"
              required
              disabled={!!route}
              value={formData.routeId}
              onChange={(e) =>
                setFormData({ ...formData, routeId: e.target.value })
              }
              placeholder="e.g., piisiit-api"
              className="w-full px-3 py-1.5 border border-slate-300 rounded font-mono focus:ring-1 focus:ring-blue-500 outline-none disabled:bg-slate-100"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Target URI
            </label>
            <input
              type="text"
              required
              value={formData.uri}
              onChange={(e) =>
                setFormData({ ...formData, uri: e.target.value })
              }
              placeholder="https://piisiit.com"
              className="w-full px-3 py-1.5 border border-slate-300 rounded font-mono focus:ring-1 focus:ring-blue-500 outline-none"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Path Pattern
            </label>
            <input
              type="text"
              required
              value={formData.pathPattern}
              onChange={(e) =>
                setFormData({ ...formData, pathPattern: e.target.value })
              }
              placeholder="/piisit/**"
              className="w-full px-3 py-1.5 border border-slate-300 rounded font-mono focus:ring-1 focus:ring-blue-500 outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Strip Prefix
              </label>
              <input
                type="number"
                min="0"
                value={formData.stripPrefix}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    stripPrefix: parseInt(e.target.value) || 0,
                  })
                }
                className="w-full px-3 py-1.5 border border-slate-300 rounded font-mono focus:ring-1 focus:ring-blue-500 outline-none"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Execution Order
              </label>
              <input
                type="number"
                value={formData.order}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    order: parseInt(e.target.value) || 0,
                  })
                }
                className="w-full px-3 py-1.5 border border-slate-300 rounded font-mono focus:ring-1 focus:ring-blue-500 outline-none"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="enabledCheck"
              checked={formData.enabled}
              onChange={(e) =>
                setFormData({ ...formData, enabled: e.target.checked })
              }
              className="rounded text-blue-600"
            />
            <label
              htmlFor="enabledCheck"
              className="font-medium text-slate-700"
            >
              Enable Route Traffic
            </label>
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
              {loading ? "Saving..." : "Save Route"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
