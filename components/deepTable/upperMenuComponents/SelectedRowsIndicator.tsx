import React from "react";

interface SelectedRowsIndicatorProps {
  selectedCount: number;
  onUnselectAll: () => void;
}

export const SelectedRowsIndicator: React.FC<SelectedRowsIndicatorProps> = ({
  selectedCount,
  onUnselectAll,
}) => {
  if (selectedCount === 0) return null;

  return (
    <div className="flex items-center space-x-2">
      <span className="text-sm font-medium text-deep-table-primary-dark">
        {selectedCount} row{selectedCount !== 1 ? "s" : ""} selected
      </span>
      <button
        type="button"
        onClick={onUnselectAll}
        className="flex items-center justify-center text-deep-table-semantic-pink-text hover:text-deep-table-content-red hover:bg-deep-table-bg-error rounded px-2 py-1 text-xs font-medium transition-colors duration-200"
        title="Unselect all rows"
      >
        <svg
          className="w-3 h-3 mr-1"
          fill="currentColor"
          viewBox="0 0 20 20"
          xmlns="http://www.w3.org/2000/svg"
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
  );
};
