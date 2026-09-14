import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  RefreshCw,
  Edit,
  Trash2,
  Eye,
  CheckCircle2,
  XCircle,
  Search,
} from "lucide-react";

import { routeApi } from "../api/routeApi";
import { useToast } from "../context/ToastContext";
import RouteFormModal from "../components/modal/RouteFormModal";

export default function RoutesList() {
  const [routes, setRoutes] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRoute, setSelectedRoute] = useState(null);

  const { addToast } = useToast();
  const navigate = useNavigate();

  const loadRoutes = async () => {
    setLoading(true);

    try {
      const res = await routeApi.getRoutes();
      setRoutes(res.data || []);
    } catch (err) {
      addToast(err.message || "Failed to fetch routes", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRoutes();
  }, []);

  const handleDelete = async (routeId) => {
    if (!window.confirm(`Are you sure you want to delete "${routeId}"?`)) {
      return;
    }

    try {
      await routeApi.deleteRoute(routeId);

      addToast(`Route "${routeId}" deleted successfully`, "success");

      loadRoutes();
    } catch (err) {
      addToast(err.message || "Delete failed", "error");
    }
  };

  const filteredRoutes = routes.filter((route) => {
    const keyword = search.toLowerCase();

    return (
      route.routeId?.toLowerCase().includes(keyword) ||
      route.pathPattern?.toLowerCase().includes(keyword) ||
      route.uri?.toLowerCase().includes(keyword)
    );
  });

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">
            Gateway Routes
          </h1>

          <p className="text-xs text-slate-500 mt-1">
            Manage API gateway routes and downstream services.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadRoutes}
            className="
              flex items-center gap-2
              px-3 py-2
              border border-slate-200
              bg-white
              rounded-lg
              text-xs text-slate-600
              hover:bg-slate-50
            "
          >
            <RefreshCw
              className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`}
            />
            Refresh
          </button>

          <button
            onClick={() => {
              setSelectedRoute(null);
              setIsModalOpen(true);
            }}
            className="
              flex items-center gap-2
              px-3 py-2
              bg-blue-600
              text-white
              rounded-lg
              text-xs font-medium
              hover:bg-blue-700
            "
          >
            <Plus className="w-3.5 h-3.5" />
            Create Route
          </button>
        </div>
      </div>

      {/* Table Card */}
      <div
        className="
        bg-white
        border border-slate-200
        rounded-xl
        shadow-sm
        overflow-hidden
      "
      >
        {/* Search */}
        <div
          className="
          p-4
          border-b border-slate-200
          flex items-center justify-between gap-4
        "
        >
          <div className="relative w-full max-w-sm">
            <Search
              className="
                absolute left-3 top-1/2
                -translate-y-1/2
                w-4 h-4
                text-slate-400
              "
            />

            <input
              type="text"
              placeholder="Search routes..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="
                w-full
                pl-9 pr-3 py-2
                border border-slate-200
                rounded-lg
                text-xs
                outline-none
                focus:ring-2
                focus:ring-blue-100
                focus:border-blue-400
              "
            />
          </div>

          <span className="text-xs text-slate-400 whitespace-nowrap">
            {filteredRoutes.length} route
            {filteredRoutes.length !== 1 ? "s" : ""}
          </span>
        </div>

        {/* Loading */}
        {loading ? (
          <div className="py-16 text-center">
            <RefreshCw className="w-5 h-5 animate-spin mx-auto text-blue-500" />

            <p className="text-xs text-slate-500 mt-3">Loading routes...</p>
          </div>
        ) : filteredRoutes.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-sm font-medium text-slate-600">
              No routes found
            </p>

            <p className="text-xs text-slate-400 mt-1">
              Try another search or create a new route.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr
                  className="
                  bg-slate-50
                  border-b border-slate-200
                  text-[10px]
                  uppercase
                  tracking-wider
                  text-slate-500
                  font-semibold
                "
                >
                  <th className="px-4 py-3">Route</th>

                  <th className="px-4 py-3">Path</th>

                  <th className="px-4 py-3">Target</th>

                  <th className="px-4 py-3">Status</th>

                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {filteredRoutes.map((route) => (
                  <tr
                    key={route.routeId}
                    className="hover:bg-slate-50/70 transition"
                  >
                    {/* Route */}
                    <td className="px-4 py-4">
                      <div className="font-mono text-sm font-semibold text-slate-800">
                        {route.routeId}
                      </div>

                      <div className="text-[11px] text-slate-400 mt-1">
                        Order: {route.order}
                      </div>
                    </td>

                    {/* Path */}
                    <td className="px-4 py-4">
                      <code
                        className="
                        px-2 py-1
                        rounded
                        bg-slate-100
                        text-xs
                        text-slate-700
                      "
                      >
                        {route.pathPattern}
                      </code>
                    </td>

                    {/* Target */}
                    <td className="px-4 py-4">
                      <span
                        className="
                        block
                        max-w-xs
                        truncate
                        font-mono
                        text-xs
                        text-slate-600
                      "
                      >
                        {route.uri}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="px-4 py-4">
                      {route.enabled ? (
                        <span
                          className="
                          inline-flex
                          items-center
                          gap-1.5
                          px-2
                          py-1
                          rounded-full
                          bg-emerald-50
                          border border-emerald-200
                          text-[10px]
                          font-semibold
                          text-emerald-700
                        "
                        >
                          <CheckCircle2 className="w-3 h-3" />
                          Active
                        </span>
                      ) : (
                        <span
                          className="
                          inline-flex
                          items-center
                          gap-1.5
                          px-2
                          py-1
                          rounded-full
                          bg-slate-100
                          border border-slate-200
                          text-[10px]
                          font-semibold
                          text-slate-500
                        "
                        >
                          <XCircle className="w-3 h-3" />
                          Disabled
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-4">
                      <div
                        className="
                        flex
                        justify-end
                        items-center
                        gap-1
                      "
                      >
                        <button
                          onClick={() => navigate(`/routes/${route.routeId}`)}
                          className="
                            flex items-center gap-1.5
                            px-2.5 py-1.5
                            rounded-md
                            bg-blue-50
                            text-blue-600
                            text-xs
                            font-medium
                            hover:bg-blue-100
                          "
                        >
                          <Eye className="w-3.5 h-3.5" />
                          Details
                        </button>

                        <button
                          onClick={() => {
                            setSelectedRoute(route);
                            setIsModalOpen(true);
                          }}
                          className="
                            p-1.5
                            rounded-md
                            text-slate-500
                            hover:bg-slate-100
                          "
                          title="Edit"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => handleDelete(route.routeId)}
                          className="
                            p-1.5
                            rounded-md
                            text-red-500
                            hover:bg-red-50
                          "
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      {isModalOpen && (
        <RouteFormModal
          route={selectedRoute}
          onClose={() => setIsModalOpen(false)}
          onSuccess={() => {
            setIsModalOpen(false);
            loadRoutes();
          }}
        />
      )}
    </div>
  );
}
