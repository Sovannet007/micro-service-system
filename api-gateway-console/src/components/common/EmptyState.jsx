import React from "react";
import { Inbox } from "lucide-react";

export const EmptyState = ({ title, description, action }) => {
  return (
    <div className="bg-white border border-slate-200 rounded-lg p-12 text-center flex flex-col items-center justify-center">
      <div className="p-3 rounded-full bg-slate-100 text-slate-400 mb-4">
        <Inbox size={32} />
      </div>
      <h3 className="text-base font-bold text-slate-800">{title}</h3>
      <p className="mt-1 text-xs text-slate-500 max-w-sm">{description}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
};
