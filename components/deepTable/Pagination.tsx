import { useState, useEffect } from "react";

export interface CurrentPageIndexes {
  firstRowIdx: number;
  lastRowIdx: number;
}

interface PaginationProps {
  displayedRowsCount: number;
  defaultNbrRowsPerPage: number;
  currentPageIdxs: CurrentPageIndexes;
  setCurrentPageIdxs: React.Dispatch<React.SetStateAction<CurrentPageIndexes>>;
}

const getPaginationRange = (
  nbrTotalRows: number,
  NbrRowsPerPage: number,
  currentPage: number
) => {
  const totalPages = Math.ceil(nbrTotalRows / NbrRowsPerPage);
  const maxVisiblePages = 5;

  if (totalPages <= maxVisiblePages) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  // Calculate the start and end of the visible range
  let start = currentPage - 2;
  let end = currentPage + 2;

  // Adjust for left boundary
  if (start < 1) {
    start = 1;
    end = Math.min(maxVisiblePages, totalPages);
  }

  // Adjust for right boundary
  if (end > totalPages) {
    end = totalPages;
    start = Math.max(1, totalPages - maxVisiblePages + 1);
  }

  return Array.from({ length: end - start + 1 }, (_, i) => start + i);
};

export const Pagination: React.FC<PaginationProps> = ({
  displayedRowsCount,
  defaultNbrRowsPerPage,
  currentPageIdxs,
  setCurrentPageIdxs,
}) => {
  const [pageId, setPageId] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(defaultNbrRowsPerPage);
  const [paginationRange, setPaginationRange] = useState<number[]>(
    getPaginationRange(displayedRowsCount, rowsPerPage, 1)
  );

  // Reset pagination when displayedRowsCount changes (due to filtering/searching)
  useEffect(() => {
    const totalPages = Math.ceil(displayedRowsCount / rowsPerPage);

    // If current page is beyond available pages, reset to page 1
    if (pageId > totalPages && totalPages > 0) {
      setPageId(1);
      setCurrentPageIdxs({
        firstRowIdx: 0,
        lastRowIdx: Math.min(rowsPerPage - 1, displayedRowsCount - 1),
      });
      setPaginationRange(
        getPaginationRange(displayedRowsCount, rowsPerPage, 1)
      );
    } else {
      // Update pagination range for current page
      setPaginationRange(
        getPaginationRange(displayedRowsCount, rowsPerPage, pageId)
      );
      // Update current page indexes to reflect the new row count
      setCurrentPageIdxs({
        firstRowIdx: (pageId - 1) * rowsPerPage,
        lastRowIdx: Math.min(pageId * rowsPerPage - 1, displayedRowsCount - 1),
      });
    }
  }, [displayedRowsCount, rowsPerPage, pageId, setCurrentPageIdxs]);

  const handlePageChange = (newPage: number) => {
    setPageId(newPage);
    setCurrentPageIdxs({
      firstRowIdx: (newPage - 1) * rowsPerPage,
      lastRowIdx: Math.min(newPage * rowsPerPage - 1, displayedRowsCount - 1),
    });
    setPaginationRange(
      getPaginationRange(displayedRowsCount, rowsPerPage, newPage)
    );
  };
  const handleRowsPerPageChange = (newRowsPerPage: string) => {
    setRowsPerPage(parseInt(newRowsPerPage));
    setPageId(1);
    setCurrentPageIdxs({
      firstRowIdx: 0,
      lastRowIdx: Math.min(
        parseInt(newRowsPerPage) - 1,
        displayedRowsCount - 1
      ),
    });
    setPaginationRange(
      getPaginationRange(displayedRowsCount, parseInt(newRowsPerPage), 1)
    );
  };
  return (
    <nav
      className="flex items-center justify-between pt-4 mx-2"
      aria-label="Table navigation"
    >
      <div className="flex items-center space-x-4">
        <select
          aria-label="Rows per page"
          className="p-2 text-sm text-deep-table-secondary-400 border border-deep-table-secondary-300 rounded-lg bg-deep-table-bg-white focus:ring-deep-table-primary focus:border-deep-table-primary transition-colors duration-200"
          onChange={(e) => handleRowsPerPageChange(e.target.value)}
          value={rowsPerPage}
        >
          <option value="5">5</option>
          <option value="10">10</option>
          <option value="25">25</option>
        </select>
        <span className="text-sm font-normal text-deep-table-secondary-400">
          Showing{" "}
          <span className="font-semibold text-deep-table-primary-dark">
            {currentPageIdxs.firstRowIdx + 1}-{currentPageIdxs.lastRowIdx + 1}
          </span>{" "}
          of{" "}
          <span className="font-semibold text-deep-table-primary-dark">
            {displayedRowsCount}
          </span>
        </span>
      </div>
      <ul className="inline-flex -space-x-px text-sm h-8">
        {/* First page */}
        <li>
          <button
            type="button"
            className={`flex items-center justify-center px-3 h-8 ml-0 leading-tight border border-deep-table-secondary-300 rounded-l-lg transition-colors duration-200 ${
              pageId === 1
                ? "text-deep-table-secondary-300 bg-deep-table-secondary-100 cursor-not-allowed"
                : "text-deep-table-secondary-400 bg-deep-table-bg-white hover:bg-deep-table-secondary-100 hover:text-deep-table-primary"
            }`}
            onClick={() => handlePageChange(1)}
            disabled={pageId === 1}
          >
            {"<<"}
          </button>
        </li>
        {/* Previous page */}
        <li>
          <button
            type="button"
            className={`flex items-center justify-center px-3 h-8 leading-tight border border-deep-table-secondary-300 transition-colors duration-200 ${
              pageId === 1
                ? "text-deep-table-secondary-300 bg-deep-table-secondary-100 cursor-not-allowed"
                : "text-deep-table-secondary-400 bg-deep-table-bg-white hover:bg-deep-table-secondary-100 hover:text-deep-table-primary"
            }`}
            onClick={() => handlePageChange(pageId - 1)}
            disabled={pageId === 1}
          >
            {"<"}
          </button>
        </li>
        {/* Page numbers */}
        {paginationRange.map((pageNum: number) => (
          <li key={`page-${pageNum}`}>
            <button
              type="button"
              className={`flex items-center justify-center px-3 h-8 border-deep-table-secondary-300 transition-colors duration-200 ${
                pageNum === pageId
                  ? "text-white border bg-deep-table-primary hover:bg-deep-table-primary-medium"
                  : "text-deep-table-secondary-400 border bg-deep-table-bg-white hover:bg-deep-table-secondary-100 hover:text-deep-table-primary"
              }`}
              onClick={() => handlePageChange(pageNum)}
            >
              {pageNum}
            </button>
          </li>
        ))}
        {/* Next page */}
        <li>
          <button
            type="button"
            className={`flex items-center justify-center px-3 h-8 leading-tight border border-deep-table-secondary-300 transition-colors duration-200 ${
              pageId === paginationRange[paginationRange.length - 1]
                ? "text-deep-table-secondary-300 bg-deep-table-secondary-100 cursor-not-allowed"
                : "text-deep-table-secondary-400 bg-deep-table-bg-white hover:bg-deep-table-secondary-100 hover:text-deep-table-primary"
            }`}
            onClick={() => handlePageChange(pageId + 1)}
            disabled={pageId === paginationRange[paginationRange.length - 1]}
          >
            {">"}
          </button>
        </li>
        {/* Last page */}
        <li>
          <button
            type="button"
            className={`flex items-center justify-center px-3 h-8 leading-tight border border-deep-table-secondary-300 rounded-r-lg transition-colors duration-200 ${
              pageId === Math.ceil(displayedRowsCount / rowsPerPage)
                ? "text-deep-table-secondary-300 bg-deep-table-secondary-100 cursor-not-allowed"
                : "text-deep-table-secondary-400 bg-deep-table-bg-white hover:bg-deep-table-secondary-100 hover:text-deep-table-primary"
            }`}
            onClick={() =>
              handlePageChange(Math.ceil(displayedRowsCount / rowsPerPage))
            }
            disabled={pageId === Math.ceil(displayedRowsCount / rowsPerPage)}
          >
            {">>"}
          </button>
        </li>
      </ul>
    </nav>
  );
};
