import React from "react";

export const StatCard = ({
  title,
  value,
  subtitle,
  icon: Icon,
  statusColor = "blue",
}) => {
  return (
    <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          {title}
        </span>
        {Icon && (
          <div className="p-2 rounded-md bg-slate-50 text-slate-600 border border-slate-100">
            <Icon size={18} />
          </div>
        )}
      </div>
      <div className="mt-3 flex items-baseline justify-between">
        <div className="text-2xl font-bold text-slate-900">{value}</div>
      </div>
      {subtitle && <p className="mt-1 text-xs text-slate-500">{subtitle}</p>}
    </div>
  );
};
