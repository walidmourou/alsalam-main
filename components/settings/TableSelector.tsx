"use client";

import { TableKey, tableOptions } from "@/lib/settings/table-definitions";

type TableSelectorProps = {
  activeTable: TableKey;
  onSelect: (key: TableKey) => void;
};

export default function TableSelector({
  activeTable,
  onSelect,
}: TableSelectorProps) {
  return (
    <div className="flex flex-wrap gap-2 mb-6">
      {tableOptions.map((option) => (
        <button
          key={option.key}
          type="button"
          onClick={() => onSelect(option.key)}
          className={`rounded-full px-4 py-2 border transition-colors duration-150 ${
            activeTable === option.key
              ? "bg-slate-900 text-white border-slate-900"
              : "bg-white text-slate-700 border-slate-200 hover:bg-slate-100"
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
