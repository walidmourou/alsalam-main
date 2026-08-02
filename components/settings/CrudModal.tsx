"use client";

import {
  ColumnType,
  Dictionary,
  TableColumn,
} from "@/components/deepTable/types";

type CrudModalProps = {
  isOpen: boolean;
  mode: "add" | "edit" | "view";
  columns: TableColumn[];
  formValues: Record<string, string>;
  formError: string | null;
  tableLabel: string;
  onClose: () => void;
  onChange: (field: string, value: string) => void;
  onSubmit: () => void;
};

export default function CrudModal({
  isOpen,
  mode,
  columns,
  formValues,
  formError,
  tableLabel,
  onClose,
  onChange,
  onSubmit,
}: CrudModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 px-4 py-8">
      <div className="w-full max-w-xl rounded-2xl bg-white shadow-2xl ring-1 ring-slate-200">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <div>
            <h3 className="text-xl font-semibold">
              {mode === "add"
                ? "Add row"
                : mode === "edit"
                  ? "Edit row"
                  : "View row"}
            </h3>
            <p className="text-sm text-slate-500">
              {tableLabel} settings form.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-slate-200 px-3 py-2 text-slate-600 hover:bg-slate-50"
          >
            Close
          </button>
        </div>

        <div className="px-6 py-5 space-y-4">
          {formError && (
            <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700 ring-1 ring-red-200">
              {formError}
            </div>
          )}

          {columns
            .filter((column) => !column.isKey)
            .map((column) => {
              const value = formValues[column.id] ?? "";
              const inputType =
                column.type === ColumnType.integer ||
                column.type === ColumnType.float
                  ? "number"
                  : column.type === ColumnType.date
                    ? "date"
                    : "text";

              return (
                <div key={column.id} className="space-y-2">
                  <label
                    className="block text-sm font-medium text-slate-700"
                    htmlFor={`field-${column.id}`}
                  >
                    {column.label}
                    {column.isMandatory ? " *" : ""}
                  </label>
                  <input
                    id={`field-${column.id}`}
                    type={inputType}
                    value={value}
                    readOnly={mode === "view"}
                    disabled={mode === "view"}
                    onChange={(event) =>
                      onChange(column.id, event.target.value)
                    }
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-slate-900 outline-none transition focus:border-slate-600 focus:ring-2 focus:ring-slate-200"
                  />
                </div>
              );
            })}
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-slate-200 bg-slate-50 px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-slate-700 transition hover:bg-slate-100"
          >
            Close
          </button>
          {mode !== "view" && (
            <button
              type="button"
              onClick={onSubmit}
              className="rounded-lg bg-slate-900 px-4 py-2 text-white transition hover:bg-slate-700"
            >
              Save
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
