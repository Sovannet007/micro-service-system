import { useEffect, useState } from "react";
import { Activity, CheckCircle, XCircle, RefreshCw } from "lucide-react";

import { getTargets } from "../api/prometheusApi";

export default function Prometheus() {
  const [targets, setTargets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadTargets = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getTargets();
      setTargets(data);
    } catch (err) {
      console.error(err);
      setError("Unable to connect to Prometheus.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTargets();

    // Refresh every 15 seconds
    const interval = setInterval(loadTargets, 15000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-slate-900">
            Prometheus Target Status
          </h1>

          <p className="text-xs text-slate-500">
            Gateway actuator metrics scraping target health
          </p>
        </div>

        <button
          onClick={loadTargets}
          disabled={loading}
          className="flex items-center gap-2 px-3 py-2 text-xs
                     border border-slate-200 rounded bg-white
                     hover:bg-slate-50"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {/* Error */}
      {error && (
        <div
          className="bg-red-50 border border-red-200
                        text-red-700 rounded p-3 text-xs"
        >
          {error}
        </div>
      )}

      {/* Loading */}
      {loading && targets.length === 0 && (
        <div
          className="bg-white border border-slate-200
                        rounded p-6 text-center text-xs
                        text-slate-500"
        >
          Loading Prometheus targets...
        </div>
      )}

      {/* Targets */}
      {!loading && targets.length === 0 && !error && (
        <div
          className="bg-white border border-slate-200
                        rounded p-6 text-center text-xs
                        text-slate-500"
        >
          No active Prometheus targets found.
        </div>
      )}

      <div className="space-y-4">
        {targets.map((target) => {
          const isUp = target.health === "up";

          return (
            <div
              key={`${target.labels.job}-${target.labels.instance}`}
              className="bg-white p-5 rounded border
                         border-slate-200 shadow-sm"
            >
              {/* Target Header */}
              <div
                className="flex items-center justify-between
                              border-b border-slate-100 pb-3"
              >
                <div className="flex items-center gap-2">
                  <Activity className="w-5 h-5 text-orange-600" />

                  <div>
                    <div className="font-bold text-sm text-slate-800">
                      Job: {target.labels.job}
                    </div>

                    <div className="text-[11px] text-slate-400">
                      {target.labels.instance}
                    </div>
                  </div>
                </div>

                {isUp ? (
                  <span
                    className="px-2 py-1 rounded text-xs font-bold
                               bg-emerald-100 text-emerald-800
                               flex items-center gap-1"
                  >
                    <CheckCircle className="w-3.5 h-3.5" />
                    UP
                  </span>
                ) : (
                  <span
                    className="px-2 py-1 rounded text-xs font-bold
                               bg-red-100 text-red-800
                               flex items-center gap-1"
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    DOWN
                  </span>
                )}
              </div>

              {/* Target Information */}
              <div
                className="grid grid-cols-1 md:grid-cols-2
                              gap-4 mt-4 text-xs"
              >
                {/* Target */}
                <div>
                  <span className="text-slate-400 block mb-1">
                    Scrape Target
                  </span>

                  <span className="font-mono text-slate-800 font-semibold">
                    {target.labels.instance}
                  </span>
                </div>

                {/* Metrics */}
                <div>
                  <span className="text-slate-400 block mb-1">
                    Metrics Endpoint
                  </span>

                  <span className="font-mono text-slate-800 font-semibold">
                    {target.scrapeUrl}
                  </span>
                </div>

                {/* Last Scrape */}
                <div>
                  <span className="text-slate-400 block mb-1">Last Scrape</span>

                  <span className="font-mono text-slate-800 font-semibold">
                    {target.lastScrape
                      ? new Date(target.lastScrape).toLocaleString()
                      : "-"}
                  </span>
                </div>

                {/* Duration */}
                <div>
                  <span className="text-slate-400 block mb-1">
                    Last Scrape Duration
                  </span>

                  <span className="font-mono text-slate-800 font-semibold">
                    {target.lastScrapeDuration != null
                      ? `${(target.lastScrapeDuration * 1000).toFixed(2)} ms`
                      : "-"}
                  </span>
                </div>

                {/* Interval */}
                <div>
                  <span className="text-slate-400 block mb-1">
                    Scrape Interval
                  </span>

                  <span className="font-mono text-slate-800 font-semibold">
                    {target.scrapeInterval}
                  </span>
                </div>

                {/* Timeout */}
                <div>
                  <span className="text-slate-400 block mb-1">
                    Scrape Timeout
                  </span>

                  <span className="font-mono text-slate-800 font-semibold">
                    {target.scrapeTimeout}
                  </span>
                </div>
              </div>

              {/* Error */}
              <div className="mt-4 pt-3 border-t border-slate-100">
                <span className="text-slate-400 text-xs">Last Error</span>

                <div
                  className={`mt-1 text-xs font-mono ${
                    target.lastError ? "text-red-600" : "text-emerald-600"
                  }`}
                >
                  {target.lastError || "None"}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
