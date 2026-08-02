//Types, interfaces and Enums

import { ColumnType, TableColumn } from "./types";

export const columnTypeToJsType = (typ: ColumnType) => {
  switch (typ) {
    case ColumnType.boolean:
      return "boolean";
    case ColumnType.integer:
    case ColumnType.timestamp_s:
    case ColumnType.timestamp_ms:
    case ColumnType.float:
      return "number";
    case ColumnType.string:
    case ColumnType.date:
    case ColumnType.variant:
      return "string";
    default:
      return null;
  }
};

// Enhanced sort function with comprehensive data type support
export const sortFunction = (columnNames: TableColumn[]) => {
  return (colId: string, a: unknown, b: unknown): number => {
    try {
      const column = columnNames.find((col) => col.id === colId);
      if (!column) return 0;

      // Handle null/undefined values - always sort them to the bottom
      if (a == null && b == null) return 0;
      if (a == null) return 1;
      if (b == null) return -1;

      // Helper to stringify/normalize values for string comparisons
      const normalizeStringValue = (val: unknown) => {
        if (val == null) return "";
        if (Array.isArray(val))
          return val.map((v) => JSON.stringify(v)).join(", ");
        if (typeof val === "object") return JSON.stringify(val);
        return String(val).trim();
      };

      switch (column.type) {
        // Numeric types: compare as numbers
        case ColumnType.integer:
        case ColumnType.float:
          return Number(a) - Number(b);

        // Strings and variants: compare using localeCompare for correct alphabetical ordering
        case ColumnType.string: {
          const sa = normalizeStringValue(a).toString();
          const sb = normalizeStringValue(b).toString();
          return sa.localeCompare(sb, undefined, {
            sensitivity: "base",
          });
        }

        case ColumnType.variant: {
          // Variant can be array/object - stringify for comparison
          const va = normalizeStringValue(a).toString();
          const vb = normalizeStringValue(b).toString();
          return va.localeCompare(vb, undefined, {
            sensitivity: "base",
          });
        }

        case ColumnType.timestamp_s:
          // Convert seconds to milliseconds for comparison
          return Number(a) * 1000 - Number(b) * 1000;

        case ColumnType.timestamp_ms:
          return Number(a) - Number(b);

        case ColumnType.date:
          const dateA = new Date(String(a));
          const dateB = new Date(String(b));
          return dateA.getTime() - dateB.getTime();

        case ColumnType.boolean:
          // Sort false before true
          return Number(a) - Number(b);

        default:
          // Fallback to string comparison
          return String(a).localeCompare(String(b), undefined, {
            numeric: true,
            sensitivity: "base",
          });
      }
    } catch {
      // Debug statement removed
      return 0;
    }
  };
};

// Utility function to compare two row objects for equality
export const areRowsEqual = (
  row1: Record<string, unknown>,
  row2: Record<string, unknown>
): boolean => {
  const keys1 = Object.keys(row1);
  const keys2 = Object.keys(row2);

  if (keys1.length !== keys2.length) {
    return false;
  }

  return keys1.every((key) => {
    const val1 = row1[key];
    const val2 = row2[key];

    // Handle null/undefined
    if (val1 === val2) return true;
    if (val1 == null || val2 == null) return false;

    // Handle arrays
    if (Array.isArray(val1) && Array.isArray(val2)) {
      return (
        val1.length === val2.length &&
        val1.every((item, index) => item === val2[index])
      );
    }

    // Handle objects
    if (typeof val1 === "object" && typeof val2 === "object") {
      return areRowsEqual(
        val1 as Record<string, unknown>,
        val2 as Record<string, unknown>
      );
    }

    return val1 === val2;
  });
};
