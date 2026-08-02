"use client";

import React, { useState, useCallback, useEffect } from "react";
import {
  Dictionary,
  TableColumn,
  TableDataType,
  DeepTableProps,
} from "./types";
import { TableHeader } from "./tableComponents/TableHeader";
import { CurrentPageIndexes, Pagination } from "./Pagination";
import { TableRow } from "./tableComponents/TableRow";
import { SearchFilterAddSection } from "./UpperMenu";
import { areRowsEqual } from "./utils";
import "./deep-table-theme.css";

export default function DeepTable({
  columnNames = [],
  initialRowsValues = [],
  defaultNbrRowsPerPage = 10,
  displayPagination = true,
  selectable = false,
  isDenseTable = true,
  displayEditAction = false,
  displayDeleteAction = false,
  displayAddButton = false,
  displayViewAction = false,
  handleAddAction = () => {},
  handleEditAction = () => {},
  handleDeleteAction = () => {},
  handleViewAction = () => {},
  handleRefreshAction,
  selectedRows = new Set<Dictionary<unknown>>(),
  setSelectedRows = () => {},
  isLoading: externalIsLoading = false,
  fetchError = null,
}: DeepTableProps) {
  // ============================================================================
  // STATE MANAGEMENT
  // ============================================================================

  // Table data state
  const [displayedRows, setDisplayedRows] =
    useState<TableDataType>(initialRowsValues);
  const [filteredAndSearchedRows, setFilteredAndSearchedRows] =
    useState<TableDataType>(initialRowsValues);

  // Pagination state
  const [currentPageIdxs, setCurrentPageIdxs] = useState<CurrentPageIndexes>({
    firstRowIdx: 0,
    lastRowIdx: defaultNbrRowsPerPage - 1,
  });

  // UI state
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Trigger for reapplying filters when data changes
  const [reapplyFiltersTrigger, setReapplyFiltersTrigger] = useState(0);

  // Combined loading state (external + internal)
  const isLoadingData = externalIsLoading || isLoading;

  // ============================================================================
  // EFFECTS
  // ============================================================================

  // Update filtered state when initial data changes
  useEffect(() => {
    // When initialRowsValues changes, trigger reapplication of filters/searches/sorts
    // by incrementing the trigger counter
    setReapplyFiltersTrigger((prev) => prev + 1);
  }, [initialRowsValues]);

  // ============================================================================
  // DATA HANDLERS
  // ============================================================================

  // Callback for when filtering/searching changes
  const handleFilterSearchChange = useCallback(
    (newRows: React.SetStateAction<TableDataType>) => {
      const resolvedRows =
        typeof newRows === "function"
          ? newRows(filteredAndSearchedRows)
          : newRows;
      setFilteredAndSearchedRows(resolvedRows);
      setDisplayedRows(resolvedRows);

      // Reset pagination to first page when filters/searches change
      setCurrentPageIdxs({
        firstRowIdx: 0,
        lastRowIdx: Math.min(
          defaultNbrRowsPerPage - 1,
          resolvedRows.length - 1
        ),
      });
    },
    [filteredAndSearchedRows, defaultNbrRowsPerPage]
  );

  // Callback for when sorting changes
  const handleSortChange = useCallback(
    (sortedRows: React.SetStateAction<TableDataType>) => {
      setDisplayedRows(sortedRows);
    },
    []
  );

  // Callback to handle pagination reset when filtered data changes
  const handlePostFilterCallback = useCallback(
    (filteredRows: TableDataType) => {
      // Reset pagination to first page
      setCurrentPageIdxs({
        firstRowIdx: 0,
        lastRowIdx: Math.min(
          defaultNbrRowsPerPage - 1,
          filteredRows.length - 1
        ),
      });
    },
    [defaultNbrRowsPerPage]
  );

  // ============================================================================
  // ROW SELECTION LOGIC
  // ============================================================================

  // Helper function to check if a row is selected
  const isRowSelected = useCallback(
    (row: Dictionary<unknown>): boolean => {
      for (const selectedRow of selectedRows) {
        if (areRowsEqual(selectedRow, row)) {
          return true;
        }
      }
      return false;
    },
    [selectedRows]
  );

  // Helper function to remove a row from selection
  const removeRowFromSelection = useCallback(
    (
      rowToRemove: Dictionary<unknown>,
      selectedSet: Set<Dictionary<unknown>>
    ): void => {
      for (const selectedRow of selectedSet) {
        if (areRowsEqual(selectedRow, rowToRemove)) {
          selectedSet.delete(selectedRow);
          break;
        }
      }
    },
    []
  );

  // Handle individual row selection
  const handleRowSelection = useCallback(
    (row: Dictionary<unknown>, selected: boolean) => {
      setSelectedRows((prev) => {
        const newSet = new Set(prev);
        if (selected) {
          newSet.add(row);
        } else {
          removeRowFromSelection(row, newSet);
        }
        return newSet;
      });
    },
    [setSelectedRows, removeRowFromSelection]
  );

  // Handle select all functionality
  const handleSelectAll = useCallback(
    (selected: boolean) => {
      // Safety check: ensure displayedRows is not null
      if (!displayedRows || !Array.isArray(displayedRows)) {
        return;
      }

      if (selected) {
        // Select rows visible on current page or all rows if pagination is disabled
        const rowsToSelect = displayPagination
          ? displayedRows.slice(
              currentPageIdxs.firstRowIdx,
              currentPageIdxs.lastRowIdx + 1
            )
          : displayedRows;

        setSelectedRows((prev) => {
          const newSet = new Set(prev);
          rowsToSelect.forEach((row) => newSet.add(row));
          return newSet;
        });
      } else {
        // Deselect rows visible on current page or all rows if pagination is disabled
        const rowsToDeselect = displayPagination
          ? displayedRows.slice(
              currentPageIdxs.firstRowIdx,
              currentPageIdxs.lastRowIdx + 1
            )
          : displayedRows;

        setSelectedRows((prev) => {
          const newSet = new Set(prev);
          rowsToDeselect.forEach((row) => {
            removeRowFromSelection(row, newSet);
          });
          return newSet;
        });
      }
    },
    [
      displayedRows,
      currentPageIdxs,
      setSelectedRows,
      removeRowFromSelection,
      displayPagination,
    ]
  );

  // Handle unselect all functionality
  const handleUnselectAll = useCallback(() => {
    setSelectedRows(new Set());
  }, [setSelectedRows]);

  // Computed value for whether all visible rows are selected
  const allSelected = (() => {
    // Safety check: ensure displayedRows is not null
    if (!displayedRows || !Array.isArray(displayedRows)) {
      return false;
    }

    const rowsToCheck = displayPagination
      ? displayedRows.slice(
          currentPageIdxs.firstRowIdx,
          currentPageIdxs.lastRowIdx + 1
        )
      : displayedRows;

    return (
      rowsToCheck.length > 0 && rowsToCheck.every((row) => isRowSelected(row))
    );
  })();
  // ============================================================================
  // TABLE ACTION HANDLERS
  // ============================================================================

  const tableAddAction = useCallback(
    async (cols: TableColumn[]) => {
      try {
        setIsLoading(true);
        if (handleAddAction) {
          await handleAddAction(cols);
        }
      } catch (err) {
        setError(err as Error);
      } finally {
        setIsLoading(false);
      }
    },
    [handleAddAction, setError, setIsLoading]
  );

  const tableEditAction = useCallback(
    async (row: Dictionary<unknown>) => {
      try {
        setIsLoading(true);
        if (handleEditAction) {
          await handleEditAction(row);
        }
      } catch (err) {
        setError(err as Error);
      } finally {
        setIsLoading(false);
      }
    },
    [handleEditAction, setError, setIsLoading]
  );

  const tableDeleteAction = useCallback(
    async (row: Dictionary<unknown>) => {
      try {
        setIsLoading(true);
        if (handleDeleteAction) {
          await handleDeleteAction(row);
        }
      } catch (err) {
        setError(err as Error);
      } finally {
        setIsLoading(false);
      }
    },
    [handleDeleteAction, setError, setIsLoading]
  );

  const tableViewAction = useCallback(
    async (row: Dictionary<unknown>) => {
      try {
        setIsLoading(true);
        if (handleViewAction) {
          await handleViewAction(row);
        }
      } catch (err) {
        setError(err as Error);
      } finally {
        setIsLoading(false);
      }
    },
    [handleViewAction, setError, setIsLoading]
  );
  // End of TABLE ACTION HANDLERS
  // ============================================================================

  // ============================================================================
  // ERROR HANDLING & RENDERING
  // ============================================================================

  // Display fetch error if data loading failed
  if (fetchError) {
    return (
      <div className="p-6 text-red-600 border border-red-300 rounded-lg bg-red-50">
        <h3 className="font-bold text-lg mb-2">Error Loading Data</h3>
        <p className="mb-4">{fetchError}</p>
        {handleRefreshAction && (
          <button
            onClick={() => handleRefreshAction()}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200"
          >
            Try Again
          </button>
        )}
      </div>
    );
  }

  // Error boundary render for internal errors
  if (error) {
    return (
      <div className="p-4 text-deep-table-content-red border border-deep-table-content-red rounded-lg bg-deep-table-bg-error">
        <h3 className="font-bold text-deep-table-content-red">
          Error in DeepTable:
        </h3>
        <p className="text-deep-table-content-red">{error.message}</p>
        <button
          onClick={() => setError(null)}
          className="mt-2 px-4 py-2 bg-deep-table-content-red text-white rounded-lg hover:bg-deep-table-accent-dark transition-colors duration-200"
        >
          Try Again
        </button>
      </div>
    );
  }

  // ============================================================================
  // COMPUTED VALUES FOR CURRENT PAGE
  // ============================================================================

  const currentPageRows =
    displayPagination && displayedRows
      ? displayedRows.slice(
          currentPageIdxs.firstRowIdx,
          currentPageIdxs.lastRowIdx + 1
        )
      : displayedRows || [];

  const isActionRequired =
    displayEditAction || displayDeleteAction || displayViewAction;

  // ============================================================================
  // MAIN RENDER
  // ============================================================================

  return (
    <div className="deep-table-container w-full bg-deep-table-bg-main p-4 rounded-lg shadow-sm relative">
      {/* Loading Overlay */}
      {isLoadingData && (
        <div className="absolute inset-0 bg-deep-table-secondary-100 opacity-75 flex items-center justify-center z-50">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-deep-table-primary"></div>
        </div>
      )}

      <div className={isLoadingData ? "opacity-50" : ""}>
        {/* Upper Menu Section */}
        <SearchFilterAddSection
          columnNames={columnNames}
          initialState={initialRowsValues}
          setDisplayedRows={handleFilterSearchChange}
          initialRowsValues={initialRowsValues}
          displayAddButton={displayAddButton}
          handleAddAction={tableAddAction}
          handleRefreshAction={handleRefreshAction}
          selectedRowsCount={selectedRows.size}
          onUnselectAll={handleUnselectAll}
          reapplyFiltersTrigger={reapplyFiltersTrigger}
          onPostFilter={handlePostFilterCallback}
        />

        {/* Table Section */}
        <div className="w-full overflow-x-auto border border-deep-table-secondary-200 rounded-lg shadow-sm">
          <table className="w-full border-collapse bg-deep-table-bg-white">
            <TableHeader
              columnNames={columnNames}
              selectable={selectable}
              isActionRequired={isActionRequired}
              initialState={filteredAndSearchedRows}
              setDisplayedRows={handleSortChange}
              allSelected={allSelected}
              onSelectAll={handleSelectAll}
            />
            <tbody>
              {currentPageRows.map((row, index) => (
                <TableRow
                  key={
                    displayPagination
                      ? currentPageIdxs.firstRowIdx + index
                      : index
                  }
                  row={row}
                  rid={
                    displayPagination
                      ? currentPageIdxs.firstRowIdx + index
                      : index
                  }
                  columnNames={columnNames}
                  isDenseTable={isDenseTable}
                  displayEditAction={displayEditAction}
                  displayDeleteAction={displayDeleteAction}
                  displayViewAction={displayViewAction}
                  selectable={selectable}
                  isSelected={isRowSelected(row)}
                  onSelectChange={handleRowSelection}
                  handleEditAction={tableEditAction}
                  handleDeleteAction={tableDeleteAction}
                  handleViewAction={tableViewAction}
                />
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination Section */}
        {displayPagination && (
          <Pagination
            displayedRowsCount={displayedRows?.length || 0}
            defaultNbrRowsPerPage={defaultNbrRowsPerPage}
            currentPageIdxs={currentPageIdxs}
            setCurrentPageIdxs={setCurrentPageIdxs}
          />
        )}
      </div>
    </div>
  );
}
