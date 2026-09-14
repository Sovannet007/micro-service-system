import React from "react";
import { Activity, ExternalLink, CheckCircle } from "lucide-react";

export default function Prometheus() {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-lg font-bold text-slate-900">
          Prometheus Target Status
        </h1>
        <p className="text-xs text-slate-500">
          Gateway actuator metrics scraping target health
        </p>
      </div>

      <div className="bg-white p-5 rounded border border-slate-200 shadow-sm max-w-2xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-orange-600" />
            <span className="font-bold text-sm text-slate-800">
              Job: api-gateway
            </span>
          </div>
          <span className="px-2 py-0.5 rounded text-xs font-bold bg-emerald-100 text-emerald-800 flex items-center gap-1">
            <CheckCircle className="w-3.5 h-3.5" /> UP
          </span>
        </div>

        <div className="grid grid-cols-2 gap-4 text-xs">
          <div>
            <span className="text-slate-400 block mb-0.5">
              Scrape Target Host
            </span>
            <span className="font-mono text-slate-800 font-semibold">
              host.docker.internal:8080
            </span>
          </div>
          <div>
            <span className="text-slate-400 block mb-0.5">
              Metrics Endpoint
            </span>
            <span className="font-mono text-slate-800 font-semibold">
              /actuator/prometheus
            </span>
          </div>
          <div>
            <span className="text-slate-400 block mb-0.5">
              Last Scrape Duration
            </span>
            <span className="font-mono text-slate-800 font-semibold">
              12.4 ms
            </span>
          </div>
          <div>
            <span className="text-slate-400 block mb-0.5">Scrape Interval</span>
            <span className="font-mono text-slate-800 font-semibold">15s</span>
          </div>
        </div>
      </div>
    </div>
  );
}
