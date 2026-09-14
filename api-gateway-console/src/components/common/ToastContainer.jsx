import React from "react";
import { AlertCircle, CheckCircle, Info, XCircle, X } from "lucide-react";

export const ToastContainer = ({ toasts, onClose }) => {
  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col space-y-2 max-w-sm w-full">
      {toasts.map((toast) => {
        let icon = <Info size={16} className="text-blue-500" />;
        let border = "border-blue-200 bg-blue-50 text-blue-900";

        if (toast.type === "success") {
          icon = <CheckCircle size={16} className="text-emerald-500" />;
          border = "border-emerald-200 bg-emerald-50 text-emerald-900";
        } else if (toast.type === "error") {
          icon = <XCircle size={16} className="text-rose-500" />;
          border = "border-rose-200 bg-rose-50 text-rose-900";
        }

        return (
          <div
            key={toast.id}
            className={`flex items-start justify-between p-3 rounded-md border shadow-md text-xs font-medium animate-in slide-in-from-right duration-200 ${border}`}
          >
            <div className="flex items-center space-x-2">
              {icon}
              <span>{toast.message}</span>
            </div>
            <button
              onClick={() => onClose(toast.id)}
              className="text-slate-400 hover:text-slate-600"
            >
              <X size={14} />
            </button>
          </div>
        );
      })}
    </div>
  );
};
