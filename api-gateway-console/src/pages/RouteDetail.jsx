import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  ArrowLeft,
  Edit,
  Gauge,
  History,
  RefreshCw,
  ShieldCheck,
  CheckCircle2,
  XCircle,
} from "lucide-react";

import { routeApi } from "../api/routeApi";
import { rateLimitApi } from "../api/rateLimitApi";

import { useToast } from "../context/ToastContext";

import RouteFormModal from "../components/modal/RouteFormModal";
import RateLimitFormModal from "../components/modal/RateLimitFormModal";

export default function RouteDetail() {
  const { routeId } = useParams();
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [route, setRoute] = useState(null);
  const [activePolicy, setActivePolicy] = useState(null);
  const [versions, setVersions] = useState([]);

  const [loading, setLoading] = useState(true);

  const [activeTab, setActiveTab] = useState("overview");

  const [routeModal, setRouteModal] = useState(false);
  const [rateLimitModal, setRateLimitModal] = useState(false);

  const loadData = async () => {
    setLoading(true);

    try {
      const [routeRes, policyRes, versionsRes] = await Promise.all([
        routeApi.getRouteById(routeId),
        rateLimitApi.getActiveLimitOnRoute(routeId),
        rateLimitApi.getLimitVersions(routeId),
      ]);

      setRoute(routeRes.data);

      setActivePolicy(policyRes.data || null);

      setVersions(versionsRes.data || []);
    } catch (err) {
      addToast(err.message || "Failed to load route details", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [routeId]);

  if (loading) {
    return (
      <div
        className="
        flex
        items-center
        justify-center
        min-h-[400px]
      "
      >
        <div
          className="
          flex
          items-center
          gap-2
          text-xs
          text-slate-500
        "
        >
          <RefreshCw className="w-4 h-4 animate-spin" />
          Loading route...
        </div>
      </div>
    );
  }

  if (!route) {
    return (
      <div className="text-center py-16">
        <p className="text-sm text-slate-500">Route not found.</p>

        <button
          onClick={() => navigate("/routes")}
          className="mt-3 text-xs text-blue-600 hover:underline"
        >
          Back to Routes
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate("/routes")}
          className="
            w-9 h-9
            flex items-center justify-center
            rounded-lg
            border border-slate-200
            bg-white
            text-slate-500
            hover:bg-slate-50
          "
        >
          <ArrowLeft className="w-4 h-4" />
        </button>

        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h1
              className="
              text-xl
              font-semibold
              text-slate-900
              font-mono
            "
            >
              {route.routeId}
            </h1>

            {route.enabled ? (
              <span
                className="
                inline-flex
                items-center
                gap-1
                px-2
                py-1
                rounded-full
                bg-emerald-50
                text-emerald-700
                text-[10px]
                font-semibold
              "
              >
                <CheckCircle2 className="w-3 h-3" />
                ACTIVE
              </span>
            ) : (
              <span
                className="
                inline-flex
                items-center
                gap-1
                px-2
                py-1
                rounded-full
                bg-slate-100
                text-slate-500
                text-[10px]
                font-semibold
              "
              >
                <XCircle className="w-3 h-3" />
                DISABLED
              </span>
            )}
          </div>

          <p className="text-xs text-slate-500 mt-1">
            Route configuration and protection
          </p>
        </div>

        <button
          onClick={loadData}
          className="
            p-2
            border border-slate-200
            rounded-lg
            bg-white
            text-slate-500
            hover:bg-slate-50
          "
          title="Refresh"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Route summary */}
      <div
        className="
        bg-white
        border border-slate-200
        rounded-xl
        shadow-sm
        p-4
      "
      >
        <div
          className="
          grid
          grid-cols-1
          md:grid-cols-3
          gap-4
        "
        >
          <Summary label="Target" value={route.uri} />

          <Summary label="Path" value={route.pathPattern} />

          <Summary label="Strip Prefix" value={route.stripPrefix} />
        </div>
      </div>

      {/* Tabs */}
      <div
        className="
        bg-white
        border border-slate-200
        rounded-xl
        shadow-sm
        overflow-hidden
      "
      >
        <div
          className="
          flex
          border-b border-slate-200
          overflow-x-auto
        "
        >
          <Tab
            active={activeTab === "overview"}
            onClick={() => setActiveTab("overview")}
          >
            Overview
          </Tab>

          <Tab
            active={activeTab === "rate-limit"}
            onClick={() => setActiveTab("rate-limit")}
            icon={<Gauge className="w-3.5 h-3.5" />}
          >
            Rate Limit
          </Tab>

          <Tab
            active={activeTab === "history"}
            onClick={() => setActiveTab("history")}
            icon={<History className="w-3.5 h-3.5" />}
          >
            History
          </Tab>
        </div>

        <div className="p-5">
          {/* Overview */}
          {activeTab === "overview" && (
            <Overview
              route={route}
              activePolicy={activePolicy}
              onEdit={() => setRouteModal(true)}
            />
          )}

          {/* Rate Limit */}
          {activeTab === "rate-limit" && (
            <RateLimit
              policy={activePolicy}
              onEdit={() => setRateLimitModal(true)}
            />
          )}

          {/* History */}
          {activeTab === "history" && <HistoryList versions={versions} />}
        </div>
      </div>

      {/* Route edit */}
      {routeModal && (
        <RouteFormModal
          route={route}
          onClose={() => setRouteModal(false)}
          onSuccess={() => {
            setRouteModal(false);
            loadData();
          }}
        />
      )}

      {/* Rate limit edit */}
      {rateLimitModal && (
        <RateLimitFormModal
          limit={activePolicy}
          onClose={() => setRateLimitModal(false)}
          onSuccess={() => {
            setRateLimitModal(false);
            loadData();
          }}
        />
      )}
    </div>
  );
}
function Tab({ active, onClick, icon, children }) {
  return (
    <button
      onClick={onClick}
      className={`
        flex
        items-center
        gap-2
        px-5
        py-3
        text-xs
        font-medium
        whitespace-nowrap
        border-b-2
        transition

        ${
          active
            ? "border-blue-600 text-blue-600 bg-blue-50/40"
            : "border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50"
        }
      `}
    >
      {icon}
      {children}
    </button>
  );
}

function Summary({ label, value }) {
  return (
    <div>
      <p
        className="
        text-[10px]
        uppercase
        font-semibold
        text-slate-400
      "
      >
        {label}
      </p>

      <p
        className="
        mt-1
        text-sm
        font-mono
        text-slate-800
        truncate
      "
      >
        {value}
      </p>
    </div>
  );
}
function Overview({ route, activePolicy, onEdit }) {
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-slate-900">
            Route Overview
          </h2>

          <p className="text-xs text-slate-500 mt-1">
            Current configuration for this gateway route.
          </p>
        </div>

        <button
          onClick={onEdit}
          className="
            flex
            items-center
            gap-2
            px-3
            py-2
            rounded-lg
            bg-blue-600
            text-white
            text-xs
            font-medium
            hover:bg-blue-700
          "
        >
          <Edit className="w-3.5 h-3.5" />
          Edit Route
        </button>
      </div>

      <div
        className="
        grid
        grid-cols-1
        sm:grid-cols-2
        gap-3
      "
      >
        <Info label="Route ID" value={route.routeId} />

        <Info label="Target URI" value={route.uri} />

        <Info label="Path Pattern" value={route.pathPattern} />

        <Info label="Strip Prefix" value={route.stripPrefix} />

        <Info label="Execution Order" value={route.order} />

        <Info label="Status" value={route.enabled ? "Enabled" : "Disabled"} />
      </div>

      {/* Small protection summary */}
      <div
        className="
        flex
        items-center
        justify-between
        p-4
        rounded-lg
        border border-slate-200
        bg-slate-50
      "
      >
        <div className="flex items-center gap-3">
          <div
            className="
            w-9 h-9
            rounded-lg
            bg-white
            border border-slate-200
            flex items-center justify-center
          "
          >
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
          </div>

          <div>
            <p className="text-xs font-semibold text-slate-800">Rate Limit</p>

            <p className="text-[11px] text-slate-500">
              {activePolicy
                ? `${activePolicy.replenishRate} req/s`
                : "Not configured"}
            </p>
          </div>
        </div>

        {activePolicy ? (
          <span
            className="
            text-[10px]
            font-semibold
            text-emerald-700
          "
          >
            ACTIVE
          </span>
        ) : (
          <span
            className="
            text-[10px]
            font-semibold
            text-slate-400
          "
          >
            NOT CONFIGURED
          </span>
        )}
      </div>
    </div>
  );
}

function Info({ label, value }) {
  return (
    <div
      className="
      border border-slate-200
      rounded-lg
      p-4
    "
    >
      <p
        className="
        text-[10px]
        uppercase
        font-semibold
        text-slate-400
      "
      >
        {label}
      </p>

      <p
        className="
        mt-2
        text-sm
        font-mono
        text-slate-800
        break-all
      "
      >
        {value}
      </p>
    </div>
  );
}
function RateLimit({ policy, onEdit }) {
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-slate-900">Rate Limit</h2>

          <p className="text-xs text-slate-500 mt-1">
            Token bucket protection for this route.
          </p>
        </div>

        <button
          onClick={onEdit}
          className="
            flex
            items-center
            gap-2
            px-3
            py-2
            rounded-lg
            bg-blue-600
            text-white
            text-xs
            font-medium
            hover:bg-blue-700
          "
        >
          <Edit className="w-3.5 h-3.5" />
          {policy ? "Edit Policy" : "Create Policy"}
        </button>
      </div>

      {!policy ? (
        <div
          className="
          py-12
          text-center
          border border-dashed
          border-slate-300
          rounded-lg
        "
        >
          <Gauge
            className="
            w-7 h-7
            mx-auto
            text-slate-300
          "
          />

          <p
            className="
            text-sm
            font-medium
            text-slate-600
            mt-3
          "
          >
            No rate limit configured
          </p>

          <p
            className="
            text-xs
            text-slate-400
            mt-1
          "
          >
            Create a policy to protect this route.
          </p>
        </div>
      ) : (
        <div
          className="
          grid
          grid-cols-1
          sm:grid-cols-2
          lg:grid-cols-4
          gap-3
        "
        >
          <Policy
            label="Replenish Rate"
            value={`${policy.replenishRate} req/s`}
          />

          <Policy
            label="Burst Capacity"
            value={`${policy.burstCapacity} tokens`}
          />

          <Policy label="Tokens / Request" value={policy.requestedTokens} />

          <Policy
            label="Temporary Block"
            value={
              policy.tempBlockEnabled
                ? `${policy.blockDurationSeconds}s`
                : "Disabled"
            }
          />
        </div>
      )}
    </div>
  );
}

function Policy({ label, value }) {
  return (
    <div
      className="
      border border-slate-200
      rounded-lg
      p-4
    "
    >
      <p
        className="
        text-[10px]
        uppercase
        font-semibold
        text-slate-400
      "
      >
        {label}
      </p>

      <p
        className="
        mt-2
        text-lg
        font-mono
        font-semibold
        text-slate-800
      "
      >
        {value}
      </p>
    </div>
  );
}
function HistoryList({ versions }) {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-sm font-semibold text-slate-900">Policy History</h2>

        <p className="text-xs text-slate-500 mt-1">
          Previous rate limit configurations.
        </p>
      </div>

      {versions.length === 0 ? (
        <div
          className="
          py-10
          text-center
          text-xs
          text-slate-400
          border border-dashed
          border-slate-300
          rounded-lg
        "
        >
          No history available.
        </div>
      ) : (
        <div
          className="
          border border-slate-200
          rounded-lg
          overflow-hidden
        "
        >
          {versions.map((version, index) => (
            <div
              key={`${version.version}-${index}`}
              className="
                px-4
                py-3
                flex
                items-center
                justify-between
                border-b
                last:border-b-0
                border-slate-100
                hover:bg-slate-50
              "
            >
              <div className="flex items-center gap-3">
                <div
                  className="
                  w-8 h-8
                  rounded-full
                  bg-slate-100
                  flex items-center justify-center
                  text-[10px]
                  font-mono
                  font-semibold
                  text-slate-600
                "
                >
                  {version.version}
                </div>

                <div>
                  <div
                    className="
                    flex
                    items-center
                    gap-2
                  "
                  >
                    <span
                      className="
                      text-xs
                      font-semibold
                      text-slate-800
                    "
                    >
                      Version {version.version}
                    </span>

                    {version.status === "ACTIVE" && (
                      <span
                        className="
                        px-1.5
                        py-0.5
                        rounded-full
                        bg-emerald-50
                        text-emerald-700
                        text-[9px]
                        font-semibold
                      "
                      >
                        ACTIVE
                      </span>
                    )}
                  </div>

                  <p
                    className="
                    text-[11px]
                    text-slate-400
                    mt-1
                    font-mono
                  "
                  >
                    {version.replenishRate}/s
                    {" · "}
                    Burst {version.burstCapacity}
                    {" · "}
                    {version.createdAt}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
