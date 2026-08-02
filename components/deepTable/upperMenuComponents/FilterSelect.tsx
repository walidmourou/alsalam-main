import React from "react";
import { ColumnType, TableColumn } from "../types";

interface FilterSelectProps {
  colId: string;
  column: TableColumn;
  value: string | number | boolean | null;
  options: unknown[];
  onChange: (_value: string | number | boolean | null) => void;
}

// Special sentinel value to indicate "no filter" (disable filtering)
const NO_FILTER_VALUE = "__NO_FILTER__";

export const FilterSelect: React.FC<FilterSelectProps> = ({
  colId,
  column,
  value,
  options,
  onChange,
}) => {
  // Check if a filter is active (not the default "no filter" state)
  const isFilterActive =
    value !== NO_FILTER_VALUE &&
    value !== null &&
    value !== undefined &&
    value !== "";

  const getDisplayValue = (optionValue: unknown): string => {
    if (column.type === ColumnType.boolean) {
      if (optionValue === true) return "Yes";
      if (optionValue === false) return "No";
      // Handle null, undefined, or other non-boolean values
      return "Unknown";
    }
    if (column.type === ColumnType.integer) {
      if (optionValue === null || optionValue === undefined) return "Unknown";
      // For valid integers, just display the number
      return String(optionValue);
    }
    return String(optionValue);
  };

  const parseValue = (
    selectedValue: string
  ): string | number | boolean | null => {
    if (selectedValue === NO_FILTER_VALUE) {
      return NO_FILTER_VALUE;
    }

    switch (column.type) {
      case ColumnType.integer:
        if (selectedValue === "null") return null;
        return Number(selectedValue);
      case ColumnType.boolean:
        if (selectedValue === "true") return true;
        if (selectedValue === "false") return false;
        if (selectedValue === "null") return null;
        // Handle the third option (null/undefined/other)
        return null;
      case ColumnType.string:
      default:
        return selectedValue;
    }
  };

  return (
    <div className="relative mx-1">
      {/* Floating label when filter is active */}
      {isFilterActive && (
        <label
          htmlFor={`filter-${colId}`}
          className="absolute -top-2 left-3 text-xs text-deep-table-primary bg-deep-table-bg-white px-1 z-10 font-medium"
        >
          {column.label}
        </label>
      )}

      <select
        key={`filter-${colId}`}
        id={`filter-${colId}`}
        aria-label={column.label}
        className={`filterType${
          column.type
        } bg-deep-table-bg-white border border-deep-table-secondary-300 text-deep-table-secondary-400 text-sm rounded-lg focus:ring-deep-table-primary focus:border-deep-table-primary block w-full p-2 transition-colors duration-200 ${
          isFilterActive ? "border-deep-table-primary" : ""
        }`}
        onChange={(e) => {
          const selectedValue = e.target.value;
          onChange(parseValue(selectedValue));
        }}
        value={value?.toString() ?? ""}
      >
        <option
          value={NO_FILTER_VALUE}
          className="font-semibold text-deep-table-secondary-400"
        >
          {column.label}
        </option>
        {options.map((v) => (
          <option
            key={v === null ? "null" : String(v)}
            value={v === null ? "null" : String(v)}
            className="text-deep-table-secondary-400"
          >
            {getDisplayValue(v)}
          </option>
        ))}
      </select>
    </div>
  );
};

export { NO_FILTER_VALUE };
