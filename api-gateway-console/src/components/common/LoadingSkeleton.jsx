import React from "react";

export const LoadingSkeleton = ({ count = 3 }) => {
  return (
    <div className="space-y-4 animate-pulse">
      {Array.from({ length: count }).map((_, idx) => (
        <div key={idx} className="h-16 bg-slate-200 rounded-lg w-full"></div>
      ))}
    </div>
  );
};
