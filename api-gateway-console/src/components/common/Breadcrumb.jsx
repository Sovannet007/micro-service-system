import React from "react";
import { Link, useLocation } from "react-router-dom";
import { ChevronRight, Home } from "lucide-react";

export const Breadcrumb = () => {
  const location = useLocation();
  const pathnames = location.pathname.split("/").filter((x) => x);

  return (
    <nav className="flex items-center text-xs text-slate-500 font-medium space-x-2">
      <Link
        to="/"
        className="hover:text-slate-900 transition-colors flex items-center gap-1"
      >
        <Home size={14} />
      </Link>
      {pathnames.map((name, index) => {
        const routeTo = `/${pathnames.slice(0, index + 1).join("/")}`;
        const isLast = index === pathnames.length - 1;
        const formatted = name.replace(/-/g, " ");

        return (
          <React.Fragment key={name}>
            <ChevronRight size={12} className="text-slate-400" />
            {isLast ? (
              <span className="capitalize text-slate-900 font-semibold">
                {formatted}
              </span>
            ) : (
              <Link
                to={routeTo}
                className="capitalize hover:text-slate-900 transition-colors"
              >
                {formatted}
              </Link>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
};
