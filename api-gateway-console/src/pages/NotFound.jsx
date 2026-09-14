import React from "react";
import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 text-center p-4">
      <div className="space-y-3 max-w-sm">
        <h1 className="text-4xl font-bold text-slate-400">404</h1>
        <h2 className="text-sm font-bold text-slate-700">Page Not Found</h2>
        <Link
          to="/"
          className="inline-block mt-4 px-4 py-2 bg-blue-600 text-white rounded text-xs"
        >
          Return to Safety
        </Link>
      </div>
    </div>
  );
}
