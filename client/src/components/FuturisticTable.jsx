import React, { useMemo, useState } from "react";
import "./FuturisticStyles.css";

const SORT_DIRECTIONS = {
  asc: "asc",
  desc: "desc",
};

export default function FuturisticTable({
  data = [],
  columns = [],
  isLoading = false,
}) {
  const [sortKey, setSortKey] = useState(columns[0]?.accessor || "");
  const [sortDirection, setSortDirection] = useState(SORT_DIRECTIONS.asc);
  const [page, setPage] = useState(1);
  const pageSize = 5;

  const sortedData = useMemo(() => {
    const cloned = [...data];
    if (!sortKey) return cloned;
    return cloned.sort((a, b) => {
      const aValue = a[sortKey] ?? "";
      const bValue = b[sortKey] ?? "";
      if (typeof aValue === "number" && typeof bValue === "number") {
        return sortDirection === SORT_DIRECTIONS.asc
          ? aValue - bValue
          : bValue - aValue;
      }
      return sortDirection === SORT_DIRECTIONS.asc
        ? String(aValue).localeCompare(String(bValue))
        : String(bValue).localeCompare(String(aValue));
    });
  }, [data, sortDirection, sortKey]);

  const pages = Math.max(1, Math.ceil(sortedData.length / pageSize));
  const pageData = sortedData.slice((page - 1) * pageSize, page * pageSize);

  const handleSort = (accessor) => {
    if (sortKey === accessor) {
      setSortDirection((prev) =>
        prev === SORT_DIRECTIONS.asc
          ? SORT_DIRECTIONS.desc
          : SORT_DIRECTIONS.asc,
      );
      return;
    }
    setSortKey(accessor);
    setSortDirection(SORT_DIRECTIONS.asc);
  };

  if (!isLoading && pageData.length === 0) {
    return (
      <div className="rounded-[2rem] border border-cyan-500/10 bg-slate-950/90 p-8 text-center text-slate-400 shadow-[0_30px_90px_rgba(0,212,255,0.08)] table-empty">
        <div className="relative z-10 py-16 text-xl font-semibold uppercase tracking-[0.4em] text-slate-500">
          NO DATA FOUND
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-[2rem] border border-cyan-500/10 bg-slate-950/90 p-4 shadow-[0_30px_90px_rgba(0,212,255,0.08)]">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <div className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-400">
            Activity table
          </div>
          <p className="text-xs text-slate-500">
            Sortable columns · page flip transitions
          </p>
        </div>
        <div className="text-xs text-slate-500">
          Page {page} / {pages}
        </div>
      </div>
      <div className="overflow-hidden rounded-[1.75rem] border border-slate-800 bg-slate-950/95">
        <table className="min-w-full border-separate border-spacing-0 text-left text-sm text-slate-300">
          <thead className="bg-slate-950/95">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.accessor}
                  onClick={() => handleSort(column.accessor)}
                  className="cursor-pointer border-b border-cyan-500/10 px-5 py-4 text-slate-400 transition-colors duration-200 hover:text-cyan-200"
                >
                  <span className="flex items-center gap-2">
                    {column.header}
                    <span
                      className={`inline-block transition-transform duration-300 ${sortKey === column.accessor ? (sortDirection === SORT_DIRECTIONS.asc ? "rotate-0" : "-rotate-180") : "rotate-90 text-slate-500"}`}
                    >
                      ▲
                    </span>
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading
              ? Array.from({ length: 5 }).map((_, idx) => (
                  <tr key={idx} className="opacity-60">
                    {columns.map((column) => (
                      <td
                        key={column.accessor}
                        className="border-b border-slate-800 px-5 py-5"
                      >
                        <div className="h-4 w-full rounded-full bg-slate-800" />
                      </td>
                    ))}
                  </tr>
                ))
              : pageData.map((row, idx) => (
                  <tr
                    key={idx}
                    className="table-row border-b border-slate-800 transition-all duration-300 hover:bg-slate-900/70"
                  >
                    {columns.map((column) => (
                      <td
                        key={column.accessor}
                        className="border-b border-slate-800 px-5 py-5 text-slate-200"
                      >
                        {row[column.accessor]}
                      </td>
                    ))}
                  </tr>
                ))}
          </tbody>
        </table>
      </div>
      <div className="mt-4 flex items-center justify-between gap-3 text-sm text-slate-400">
        <button
          type="button"
          disabled={page === 1}
          onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
          className="rounded-2xl border border-cyan-500/10 bg-slate-950/80 px-4 py-2 transition hover:border-cyan-300/40 hover:text-cyan-100 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Previous
        </button>
        <button
          type="button"
          disabled={page === pages}
          onClick={() => setPage((prev) => Math.min(prev + 1, pages))}
          className="rounded-2xl border border-cyan-500/10 bg-slate-950/80 px-4 py-2 transition hover:border-cyan-300/40 hover:text-cyan-100 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
}
