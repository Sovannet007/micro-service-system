import React from "react";
import { Link } from "react-router-dom";

export default function Unauthorized() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white text-center p-4">
      <div className="space-y-3 max-w-sm">
        <h1 className="text-4xl font-extrabold text-red-500">403</h1>
        <h2 className="text-base font-bold">Access Forbidden</h2>
        <p className="text-xs text-slate-400">
          You do not have the required GATEWAY_ADMIN permissions to access this
          control plane.
        </p>
        <Link
          to="/login"
          className="inline-block mt-4 px-4 py-2 bg-blue-600 rounded text-xs font-semibold"
        >
          Back to Login
        </Link>
      </div>
    </div>
  );
}
