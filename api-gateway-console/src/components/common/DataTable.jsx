import React, { useState } from "react";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";

export const DataTable = ({
  columns,
  data,
  searchPlaceholder = "Search...",
  actions,
}) => {
  const [query, setQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  const filtered = data.filter((item) =>
    Object.values(item).some((val) =>
      String(val).toLowerCase().includes(query.toLowerCase()),
    ),
  );

  const totalPages = Math.ceil(filtered.length / pageSize) || 1;
  const paginated = filtered.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );

  return (
    <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
      <div className="p-4 border-b border-slate-100 flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setCurrentPage(1);
            }}
            placeholder={searchPlaceholder}
            className="w-full pl-9 pr-4 py-1.5 text-xs border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>
        {actions && <div>{actions}</div>}
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider">
            <tr>
              {columns.map((col, idx) => (
                <th key={idx} className="py-3 px-4">
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {paginated.length > 0 ? (
              paginated.map((row, rIdx) => (
                <tr
                  key={rIdx}
                  className="hover:bg-slate-50/80 transition-colors"
                >
                  {columns.map((col, cIdx) => (
                    <td
                      key={cIdx}
                      className="py-3 px-4 text-slate-700 whitespace-nowrap"
                    >
                      {col.cell ? col.cell(row) : row[col.accessor]}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={columns.length}
                  className="py-8 text-center text-slate-400"
                >
                  No records match your search.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <div className="p-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
        <div>
          Showing {filtered.length === 0 ? 0 : (currentPage - 1) * pageSize + 1}{" "}
          to {Math.min(currentPage * pageSize, filtered.length)} of{" "}
          {filtered.length} entries
        </div>
        <div className="flex items-center space-x-1">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => p - 1)}
            className="p-1 rounded border border-slate-200 disabled:opacity-40 hover:bg-slate-100"
          >
            <ChevronLeft size={14} />
          </button>
          <span className="px-2 font-medium text-slate-700">
            {currentPage} / {totalPages}
          </span>
          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((p) => p + 1)}
            className="p-1 rounded border border-slate-200 disabled:opacity-40 hover:bg-slate-100"
          >
            <ChevronRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};
