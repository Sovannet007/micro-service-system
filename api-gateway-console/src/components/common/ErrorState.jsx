import React from "react";
import { AlertOctagon } from "lucide-react";

export const ErrorState = ({ message, onRetry }) => {
  return (
    <div className="bg-rose-50 border border-rose-200 rounded-lg p-6 text-center flex flex-col items-center">
      <AlertOctagon size={32} className="text-rose-600 mb-2" />
      <h3 className="text-sm font-bold text-rose-900">Failed to load data</h3>
      <p className="text-xs text-rose-700 mt-1">
        {message || "An unexpected error occurred."}
      </p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-4 px-3 py-1.5 text-xs font-semibold bg-rose-600 text-white rounded hover:bg-rose-700"
        >
          Retry
        </button>
      )}
    </div>
  );
};
