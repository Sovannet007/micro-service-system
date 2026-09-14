import React from "react";
import { BarChart3, ExternalLink } from "lucide-react";

export default function Grafana() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-lg font-bold text-slate-900">
          Grafana Operational Control Plane
        </h1>
        <p className="text-xs text-slate-500">
          Deep observability dashboards for Gateway infrastructure
        </p>
      </div>

      <div className="bg-white p-6 rounded border border-slate-200 shadow-sm max-w-xl text-center space-y-4">
        <div className="w-12 h-12 rounded-full bg-orange-50 text-orange-600 flex items-center justify-center mx-auto">
          <BarChart3 className="w-6 h-6" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-slate-800">
            External Observability Engine
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Detailed telemetry metrics (JVM garbage collection, netty event loop
            latency, HTTP connection pools) are managed via Grafana dashboard.
          </p>
        </div>
        <a
          href="http://localhost:3000/d/spring-cloud-gateway"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded font-medium text-xs shadow"
        >
          Open Grafana Dashboard <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>
    </div>
  );
}
