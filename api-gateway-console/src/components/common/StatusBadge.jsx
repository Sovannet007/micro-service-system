import React from "react";

export const StatusBadge = ({ status, text }) => {
  const label = text || status;
  let colorClasses = "bg-slate-100 text-slate-700 border-slate-200";

  const lower = String(status).toLowerCase();
  if (
    lower === "enabled" ||
    lower === "healthy" ||
    lower === "active" ||
    lower === "up"
  ) {
    colorClasses = "bg-emerald-50 text-emerald-700 border-emerald-200";
  } else if (lower === "warning" || lower === "archived") {
    colorClasses = "bg-amber-50 text-amber-700 border-amber-200";
  } else if (
    lower === "disabled" ||
    lower === "down" ||
    lower === "blocked" ||
    lower === "error"
  ) {
    colorClasses = "bg-rose-50 text-rose-700 border-rose-200";
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${colorClasses}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
      {label}
    </span>
  );
};
