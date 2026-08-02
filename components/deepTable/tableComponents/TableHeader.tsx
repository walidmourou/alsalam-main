import { Dictionary, TableColumn } from "../types";
import { sortFunction } from "../utils";
import { useCallback, useState, useMemo, useEffect } from "react";
import { ColumnOrderType } from "./types";

interface ColumnOrderSvgProps {
  colOrder: Dictionary<string>;
  colId: string;
}

export const ColumnOrderSvg = ({ colOrder, colId }: ColumnOrderSvgProps) => {
  // No order applied - show neutral sorting icon
  if (!(colId in colOrder)) {
    return (
      <svg
        className="w-4 h-4 text-white opacity-60 hover:opacity-100 ml-1 transition-opacity duration-200"
        stroke="currentColor"
        fill="currentColor"
        strokeWidth="0"
        viewBox="0 0 320 512"
        height="1em"
        width="1em"
        xmlns="http://www.w3.org/2000/svg"
        aria-label="Sort column"
      >
        <path d="M41 288h238c21.4 0 32.1 25.9 17 41L177 448c-9.4 9.4-24.6 9.4-33.9 0L24 329c-15.1-15.1-4.4-41 17-41zm255-105L177 64c-9.4-9.4-24.6-9.4-33.9 0L24 183c-15.1 15.1-4.4 41 17 41h238c21.4 0 32.1-25.9 17-41z"></path>
      </svg>
    );
  }

  // Ascending order
  if (colOrder[colId] === ColumnOrderType.asc) {
    return (
      <svg
        className="w-4 h-4 text-deep-table-content-yellow ml-1 transition-colors duration-200 sort-icon"
        stroke="currentColor"
        fill="currentColor"
        strokeWidth="0"
        viewBox="0 0 320 512"
        height="1em"
        width="1em"
        xmlns="http://www.w3.org/2000/svg"
        aria-label="Sorted ascending"
      >
        <path d="M279 224H41c-21.4 0-32.1-25.9-17-41L143 64c9.4-9.4 24.6-9.4 33.9 0l119 119c15.2 15.1 4.5 41-16.9 41z"></path>
      </svg>
    );
  }

  // Descending order
  return (
    <svg
      className="w-4 h-4 text-deep-table-content-yellow ml-1 transition-colors duration-200 sort-icon"
      stroke="currentColor"
      fill="currentColor"
      strokeWidth="0"
      viewBox="0 0 320 512"
      height="1em"
      width="1em"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Sorted descending"
    >
      <path d="M41 288h238c21.4 0 32.1 25.9 17 41L177 448c-9.4 9.4-24.6 9.4-33.9 0L24 329c-15.1-15.1-4.4-41 17-41z"></path>
    </svg>
  );
};

interface TableHeaderProps {
  columnNames: TableColumn[];
  selectable: boolean;
  isActionRequired: boolean;
  initialState: Dictionary<unknown>[];
  setDisplayedRows: React.Dispatch<React.SetStateAction<Dictionary<unknown>[]>>;
  allSelected?: boolean;
  onSelectAll?: (_selected: boolean) => void;
  onSortReset?: () => void; // Optional callback for when sorting is reset
  resetSort?: boolean; // Flag to trigger sort reset from parent
}

export const TableHeader: React.FC<TableHeaderProps> = ({
  columnNames,
  selectable,
  isActionRequired,
  initialState,
  setDisplayedRows,
  allSelected = false,
  onSelectAll,
  onSortReset,
  resetSort = false,
}) => {
  const [columnOrder, setColumnOrder] = useState<Dictionary<string>>({});

  // Memoize the sort function for better performance
  const sortRows = useMemo(() => sortFunction(columnNames), [columnNames]);

  // Reset sorting when resetSort flag changes
  useEffect(() => {
    if (resetSort) {
      setColumnOrder({});
    }
  }, [resetSort]);

  // Effect to handle sorting when columnOrder or initialState changes
  // This ensures that when the refresh button is clicked, the current sort order
  // is automatically reapplied to the new data
  useEffect(() => {
    // Start with the current initialState (which could be filtered/searched data)
    const newDisplayedRows = [...initialState];

    // Find the active sort column
    const activeSortColumn = Object.keys(columnOrder)[0];

    if (activeSortColumn && columnOrder[activeSortColumn]) {
      newDisplayedRows.sort((a, b) => {
        const sortResult = sortRows(
          activeSortColumn,
          a[activeSortColumn],
          b[activeSortColumn]
        );
        return columnOrder[activeSortColumn] === ColumnOrderType.desc
          ? -sortResult
          : sortResult;
      });
    }

    setDisplayedRows(newDisplayedRows);
  }, [columnOrder, initialState, sortRows]); // eslint-disable-line react-hooks/exhaustive-deps

  // Function to reset all sorting
  const resetAllSorting = useCallback(() => {
    setColumnOrder({});
    onSortReset?.();
  }, [onSortReset]);

  const handleColumnOrderClick = useCallback(
    (id: string, isDoubleClick: boolean = false) => {
      if (!id) return;

      // Double-click resets all sorting
      if (isDoubleClick) {
        resetAllSorting();
        return;
      }

      // Update column order state - the useEffect will handle the sorting
      setColumnOrder((prevOrder) => {
        if (!(id in prevOrder)) {
          return { [id]: ColumnOrderType.asc };
        } else if (prevOrder[id] === ColumnOrderType.asc) {
          return { [id]: ColumnOrderType.desc };
        } else {
          // Reset to neutral state by removing the column from order
          const restOrder = { ...prevOrder };
          delete restOrder[id];
          return restOrder;
        }
      });
    },
    [resetAllSorting]
  );

  // Handle keyboard navigation for accessibility
  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent, columnId: string) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        handleColumnOrderClick(columnId);
      } else if (event.key === "Escape") {
        event.preventDefault();
        resetAllSorting();
      }
    },
    [handleColumnOrderClick, resetAllSorting]
  );

  return (
    <thead className="text-sm font-semibold text-white uppercase bg-deep-table-primary table-header">
      <tr className="items-center w-full">
        {selectable && (
          <th scope="col" className="p-3">
            <div className="flex items-center">
              <input
                id="checkbox-all-search"
                type="checkbox"
                checked={allSelected}
                onChange={(e) => onSelectAll?.(e.target.checked)}
                className="w-4 h-4 text-deep-table-primary bg-deep-table-bg-white border-deep-table-primary-light rounded focus:ring-deep-table-primary focus:ring-2"
              />
              <label htmlFor="checkbox-all-search" className="sr-only">
                checkbox
              </label>
            </div>
          </th>
        )}
        {columnNames.map(
          (column, idx) =>
            !column.invisible && (
              <th
                key={`col-${idx}`}
                scope="col"
                id={column.id}
                onClick={() => handleColumnOrderClick(column.id)}
                onDoubleClick={() => handleColumnOrderClick(column.id, true)}
                onKeyDown={(e) => handleKeyDown(e, column.id)}
                tabIndex={!column.notOrder ? 0 : -1}
                role={!column.notOrder ? "button" : undefined}
                className={`px-3 py-3 ${
                  !column.notOrder
                    ? "hover:bg-deep-table-primary-medium cursor-pointer transition-colors duration-200 select-none focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50"
                    : ""
                } ${
                  columnOrder[column.id] ? "bg-deep-table-primary-medium" : ""
                }`}
                title={
                  !column.notOrder
                    ? "Click to sort, double-click to reset all sorting, press Escape to reset all"
                    : undefined
                }
                aria-sort={
                  !column.notOrder && columnOrder[column.id]
                    ? columnOrder[column.id] === ColumnOrderType.asc
                      ? "ascending"
                      : "descending"
                    : "none"
                }
              >
                <div className="flex items-center justify-center">
                  <span className="uppercase text-sm font-semibold tracking-wider text-white">
                    {column.label}
                  </span>
                  {!column.notOrder && (
                    <ColumnOrderSvg colOrder={columnOrder} colId={column.id} />
                  )}
                </div>
              </th>
            )
        )}
        {isActionRequired && (
          <th
            scope="col"
            className="flex justify-center items-center mt-3 text-white font-semibold"
          >
            Action
          </th>
        )}
      </tr>
    </thead>
  );
};
