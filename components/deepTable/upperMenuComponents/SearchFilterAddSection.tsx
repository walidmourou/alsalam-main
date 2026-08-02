import React, { useEffect, useState } from "react";
import { ColumnType, Dictionary, TableColumn } from "../types";
import { SearchField } from "./SearchField";
import { FilterSelect, NO_FILTER_VALUE } from "./FilterSelect";
import { SelectedRowsIndicator } from "./SelectedRowsIndicator";
import { onlyUnique } from "./utils";
import { Filter, isFilterableColumnType } from "./types";

interface SearchFilterAddSectionProps {
  columnNames: TableColumn[];
  initialState: Dictionary<unknown>[];
  initialRowsValues: Dictionary<unknown>[];
  setDisplayedRows: React.Dispatch<React.SetStateAction<Dictionary<unknown>[]>>;
  displayAddButton?: boolean;
  handleAddAction?:
    | null
    | ((_columnNames: TableColumn[]) => void | Promise<void>);
  handleRefreshAction?: () => void | Promise<void>;
  selectedRowsCount?: number;
  onUnselectAll?: () => void;
  reapplyFiltersTrigger?: number;
  onPostFilter?: (_filteredRows: Dictionary<unknown>[]) => void;
}

export const SearchFilterAddSection: React.FC<SearchFilterAddSectionProps> = ({
  columnNames,
  initialState,
  initialRowsValues,
  setDisplayedRows,
  displayAddButton,
  handleAddAction,
  handleRefreshAction,
  selectedRowsCount = 0,
  onUnselectAll = () => {},
  reapplyFiltersTrigger = 0,
  onPostFilter,
}) => {
  const [filters, setFilters] = useState<string[]>([]);
  const [filterValues, setFilterValues] = useState<Filter>({});
  const [searchFields, setSearchFields] = useState<string[]>([]);
  const [searchFieldValues, setSearchFieldValues] = useState<
    Record<string, string>
  >({});

  useEffect(() => {
    const newFilters: string[] = [];
    const newSearchFields: string[] = [];
    const newSearchFieldValues: Record<string, string> = {};
    const newFilterValues: Filter = {};

    columnNames.forEach((col) => {
      // Only create filters for string, integer, or boolean column types
      if (
        col.canFilter &&
        !col.canSearch &&
        !col.invisible &&
        isFilterableColumnType(col.type)
      ) {
        newFilters.push(col.id);
        newFilterValues[col.id] = NO_FILTER_VALUE;
      } else if (col.canSearch && !col.canFilter && !col.invisible) {
        newSearchFields.push(col.id);
        newSearchFieldValues[col.id] = "";
      }
    });

    setFilters(newFilters);
    setSearchFields(newSearchFields);
    setSearchFieldValues(newSearchFieldValues);
    setFilterValues(newFilterValues);
  }, [columnNames]);

  // Reapply filters and searches when initial data changes (e.g., after refresh)
  // This ensures that when the refresh button is clicked, all previously defined
  // filters and searches are automatically reapplied to the new data
  useEffect(() => {
    // Only reapply if there are active filters or searches
    const hasActiveFilters = Object.values(filterValues).some(
      (v) => v !== NO_FILTER_VALUE
    );
    const hasActiveSearches = Object.values(searchFieldValues).some(
      (v) => v && v.trim() !== ""
    );

    if (hasActiveFilters || hasActiveSearches) {
      applyAllFilters();
    } else {
      // If no filters/searches are active, just show all rows
      setDisplayedRows(initialState);
    }
  }, [initialState]); // eslint-disable-line react-hooks/exhaustive-deps

  // Reapply filters when the trigger changes (when initialRowsValues updates)
  useEffect(() => {
    if (reapplyFiltersTrigger > 0) {
      // Only reapply if there are active filters or searches
      const hasActiveFilters = Object.values(filterValues).some(
        (v) => v !== NO_FILTER_VALUE
      );
      const hasActiveSearches = Object.values(searchFieldValues).some(
        (v) => v && v.trim() !== ""
      );

      if (hasActiveFilters || hasActiveSearches) {
        applyAllFilters();
      } else {
        // If no filters/searches are active, just show all rows
        setDisplayedRows(initialState);
        if (onPostFilter) {
          onPostFilter(initialState);
        }
      }
    }
  }, [reapplyFiltersTrigger]); // eslint-disable-line react-hooks/exhaustive-deps

  const applyAllFilters = (
    updatedFilterValues?: Filter,
    updatedSearchValues?: Record<string, string>
  ) => {
    let newDisplayedRows = [...initialState];

    const currentFilterValues = updatedFilterValues || filterValues;
    const currentSearchValues = updatedSearchValues || searchFieldValues;

    // Apply all filters except for columns with NO_FILTER_VALUE (disabled filtering)
    Object.entries(currentFilterValues).forEach(([key, value]) => {
      // Skip filtering if value is the special NO_FILTER_VALUE sentinel
      if (value !== NO_FILTER_VALUE) {
        const column = columnNames.find((col) => col.id === key);
        if (column && isFilterableColumnType(column.type)) {
          newDisplayedRows = newDisplayedRows.filter((row) => {
            const rowValue = row[key];

            // Handle different column types for comparison
            switch (column.type) {
              case ColumnType.boolean:
                // Handle null value (third option for boolean)
                if (value === null) {
                  return rowValue !== true && rowValue !== false;
                }
                // Use strict equality to avoid converting null/undefined to false
                return rowValue === value;
              case ColumnType.integer:
                // Handle null value (for non-integer values)
                if (value === null) {
                  return (
                    !Number.isInteger(Number(rowValue)) ||
                    rowValue === null ||
                    rowValue === undefined
                  );
                }
                // For valid integer comparisons, use strict number comparison
                return (
                  Number(rowValue) === Number(value) &&
                  Number.isInteger(Number(rowValue))
                );
              case ColumnType.string:
              default:
                return String(rowValue) === String(value);
            }
          });
        }
      }
    });

    // Apply search filtering for all search fields
    Object.entries(currentSearchValues).forEach(([key, value]) => {
      if (value && value.trim() !== "") {
        newDisplayedRows = newDisplayedRows.filter((row) =>
          String(row[key]).toLowerCase().includes(value.toLowerCase())
        );
      }
    });

    setDisplayedRows(newDisplayedRows);

    // Notify parent component about the filtered results for pagination reset
    if (onPostFilter) {
      onPostFilter(newDisplayedRows);
    }
  };

  const handleFilterChange = (
    colId: string,
    newValue: string | number | boolean | null
  ) => {
    // Update the filter value first
    const updatedFilterValues = { ...filterValues, [colId]: newValue };
    setFilterValues(updatedFilterValues);

    // Apply all filters and searches together
    applyAllFilters(updatedFilterValues, searchFieldValues);
  };

  const handleSearchChange = (colId: string, newValue: string) => {
    // Update the search field value first
    const updatedSearchValues = { ...searchFieldValues, [colId]: newValue };
    setSearchFieldValues(updatedSearchValues);

    // Apply all filters and searches together
    applyAllFilters(filterValues, updatedSearchValues);
  };

  const handleClearAll = () => {
    // Reset all filter values to NO_FILTER_VALUE
    const clearedFilterValues: Filter = {};
    filters.forEach((colId) => {
      clearedFilterValues[colId] = NO_FILTER_VALUE;
    });
    setFilterValues(clearedFilterValues);

    // Reset all search field values to empty string
    const clearedSearchValues: Record<string, string> = {};
    searchFields.forEach((colId) => {
      clearedSearchValues[colId] = "";
    });
    setSearchFieldValues(clearedSearchValues);

    // Apply the cleared filters and searches
    applyAllFilters(clearedFilterValues, clearedSearchValues);
  };

  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleAdd = async (cols: TableColumn[]) => {
    if (!handleAddAction) return;
    try {
      setIsLoading(true);
      await handleAddAction(cols);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    if (!handleRefreshAction) return;
    try {
      setIsRefreshing(true);
      await handleRefreshAction();
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <div className="flex items-center justify-between py-2 bg-deep-table-bg-white rounded-lg mb-1 shadow-sm relative">
      {/* Clear Button */}
      <div className="flex items-center justify-start bg-deep-table-bg-white ml-2">
        <button
          type="button"
          className="flex items-center justify-center text-gray-400 hover:text-gray-600 bg-transparent hover:bg-gray-50 transition-colors duration-200 font-normal rounded-lg text-xs px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-gray-200"
          onClick={handleClearAll}
          title="Clear all filters and searches"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-3.5 w-3.5 mr-1"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
          Clear
        </button>
      </div>

      {/* Search Fields */}
      <div className="flex items-center justify-start bg-deep-table-bg-white">
        {searchFields.map((colId) => (
          <SearchField
            key={colId}
            colId={colId}
            label={columnNames.find((v) => v.id === colId)?.label || ""}
            value={searchFieldValues[colId] || ""}
            onChange={(newValue) => handleSearchChange(colId, newValue)}
          />
        ))}
      </div>

      {/* Middle section with filters and selected rows indicator */}
      <div className="flex items-center justify-center space-x-4 bg-deep-table-bg-white">
        {/* Selected Rows Indicator */}
        <SelectedRowsIndicator
          selectedCount={selectedRowsCount}
          onUnselectAll={onUnselectAll}
        />
        {/* Filters */}
        <div className="flex items-center">
          {Object.keys(filters).length > 0 && (
            <div className="mr-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-deep-table-primary"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V3z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
          )}
          {filters.map((colId) => {
            const column = columnNames.find((v) => v.id === colId);
            if (!column) return null;

            let options: unknown[];

            if (column.type === ColumnType.boolean) {
              // For boolean columns, extract actual values from data to see if there are non-boolean values
              const actualValues = initialRowsValues
                .map((v) => v[colId])
                .filter(onlyUnique);

              // Always include true and false
              options = [true, false];

              // Check if there are values that are not strictly true or false
              const hasNonBooleanValues = actualValues.some(
                (val) => val !== true && val !== false
              );

              if (hasNonBooleanValues) {
                // Add a representative null value for the "Unknown" option
                options.push(null);
              }
            } else if (column.type === ColumnType.integer) {
              // For integer columns, extract actual values and handle non-integer values
              const actualValues = initialRowsValues
                .map((v) => v[colId])
                .filter(onlyUnique);

              // Get valid integer values
              const integerValues = actualValues.filter(
                (val) =>
                  Number.isInteger(Number(val)) &&
                  val !== null &&
                  val !== undefined
              );

              // Check if there are non-integer values
              const hasNonIntegerValues = actualValues.some(
                (val) =>
                  !Number.isInteger(Number(val)) ||
                  val === null ||
                  val === undefined
              );

              // Use integer values, sorted
              options = integerValues.sort((a, b) => Number(a) - Number(b));

              if (hasNonIntegerValues) {
                // Add a representative null value for the "Unknown" option
                options.push(null);
              }
            } else {
              // For other types, extract unique values from data
              options = initialRowsValues
                .map((v) => v[colId])
                .filter(onlyUnique)
                .sort();
            }

            return (
              <FilterSelect
                key={colId}
                colId={colId}
                column={column}
                value={filterValues[colId]}
                options={options}
                onChange={(newValue) => handleFilterChange(colId, newValue)}
              />
            );
          })}
        </div>
      </div>

      {/* Add Button */}
      {displayAddButton && (
        <div>
          <button
            type="button"
            className="flex items-center justify-center text-white bg-deep-table-primary hover:bg-deep-table-primary-medium focus:ring-4 focus:ring-deep-table-primary/30 font-medium rounded-lg text-sm px-5 py-2.5 mr-2 mb-1 focus:outline-none transition-colors duration-200"
            onClick={() => handleAdd(columnNames)}
            disabled={isLoading}
          >
            <svg
              className="h-3.5 w-3.5 mr-2"
              fill="currentColor"
              viewBox="0 0 20 20"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                clipRule="evenodd"
                fillRule="evenodd"
                d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
              />
            </svg>
            Add
          </button>
        </div>
      )}

      {/* Refresh Button */}
      {handleRefreshAction && (
        <div className="mr-2">
          <button
            type="button"
            className="flex items-center justify-center text-deep-table-primary hover:text-deep-table-primary-medium bg-transparent hover:bg-gray-50 transition-colors duration-200 font-normal rounded-lg text-sm p-2.5 focus:outline-none focus:ring-2 focus:ring-deep-table-primary/30"
            onClick={handleRefresh}
            disabled={isRefreshing}
            title="Refresh data"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className={`h-5 w-5 ${isRefreshing ? "animate-spin" : ""}`}
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
};
