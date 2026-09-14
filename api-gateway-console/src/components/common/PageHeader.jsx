import React from "react";

export const PageHeader = ({ title, description, actions }) => {
  return (
    <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-5 border-b border-slate-200">
      <div>
        <h1 className="text-xl font-bold text-slate-900 tracking-tight">
          {title}
        </h1>
        {description && (
          <p className="mt-1 text-xs text-slate-500">{description}</p>
        )}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
};
