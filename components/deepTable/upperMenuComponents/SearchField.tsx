import React from "react";

interface SearchFieldProps {
  colId: string;
  value: string;
  label: string;
  onChange: (_value: string) => void;
}

export const SearchField: React.FC<SearchFieldProps> = ({
  colId,
  value,
  label,
  onChange,
}) => {
  const hasValue = value.length > 0; // Float label if any content (including spaces)

  return (
    <div className="mx-1">
      <div className="relative">
        {/* Floating label */}
        <label
          htmlFor={`search-${colId}`}
          className={`absolute left-3 transition-all duration-200 pointer-events-none ${
            hasValue
              ? "-top-2 text-xs text-deep-table-primary bg-deep-table-bg-white px-1 z-10"
              : "top-2 text-sm text-deep-table-secondary-400"
          }`}
        >
          {label}
        </label>

        {/* Search icon */}
        <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none">
          <svg
            className="w-4 h-4 text-deep-table-secondary-400"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 20 20"
          >
            <path
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"
            />
          </svg>
        </div>

        {/* Input field */}
        <input
          type="text"
          id={`search-${colId}`}
          className="block w-full p-2 pl-3 pr-10 text-sm text-deep-table-secondary-400 border border-deep-table-secondary-300 rounded-lg bg-deep-table-bg-white focus:ring-deep-table-primary focus:border-deep-table-primary transition-colors duration-200"
          placeholder={hasValue ? "" : ""}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      </div>
    </div>
  );
};
