"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import * as XLSX from "xlsx";
import DeepTable from "@/components/deepTable/DeepTable";
import {
  CellTextAlign,
  ColumnType,
  Dictionary,
  TableColumn,
} from "@/components/deepTable/types";

type LookupOption = { id: number; label: string };

const columns: TableColumn[] = [
  {
    id: "id",
    label: "ID",
    type: ColumnType.integer,
    align: CellTextAlign.left,
    isKey: true,
    invisible: true,
  },
  {
    id: "firstName",
    label: "First Name",
    type: ColumnType.string,
    align: CellTextAlign.left,
    canSearch: true,
    isMandatory: true,
  },
  {
    id: "lastName",
    label: "Last Name",
    type: ColumnType.string,
    align: CellTextAlign.left,
    canSearch: true,
    isMandatory: true,
  },
  {
    id: "email",
    label: "Email",
    type: ColumnType.string,
    align: CellTextAlign.left,
    isMandatory: true,
    invisible: true,
  },
  {
    id: "genderId",
    label: "Gender ID",
    type: ColumnType.integer,
    invisible: true,
    isMandatory: true,
  },
  {
    id: "genderLabel",
    label: "Gender",
    type: ColumnType.string,
    invisible: true,
  },
  {
    id: "birthDate",
    label: "Birth Date",
    type: ColumnType.date,
    invisible: true,
  },
  {
    id: "phone",
    label: "Phone",
    type: ColumnType.string,
  },
  {
    id: "phone2",
    label: "Phone 2",
    type: ColumnType.string,
  },
  {
    id: "address",
    label: "Address",
    type: ColumnType.string,
    invisible: true,
  },
  {
    id: "maritalStatusId",
    label: "Marital Status ID",
    type: ColumnType.integer,
    invisible: true,
    isMandatory: true,
  },
  {
    id: "maritalStatusLabel",
    label: "Marital Status",
    type: ColumnType.string,
    invisible: true,
  },
  {
    id: "bank",
    label: "Bank",
    type: ColumnType.string,
    invisible: true,
  },
  {
    id: "iban",
    label: "IBAN",
    type: ColumnType.string,
    invisible: true,
  },
  {
    id: "bic",
    label: "BIC",
    type: ColumnType.string,
    invisible: true,
  },
];

function flattenUser(row: Dictionary<unknown>) {
  return {
    ...row,
    genderLabel: (row.gender as LookupOption)?.label ?? "",
    maritalStatusLabel: (row.maritalStatus as LookupOption)?.label ?? "",
  };
}

function parseValue(input: string, type: ColumnType): unknown {
  const trimmed = input.trim();
  if (trimmed === "") return null;

  switch (type) {
    case ColumnType.integer: {
      const parsed = Number(trimmed);
      return Number.isInteger(parsed) ? parsed : trimmed;
    }
    case ColumnType.float: {
      const parsed = Number(trimmed);
      return Number.isFinite(parsed) ? parsed : trimmed;
    }
    case ColumnType.date:
      return trimmed;
    default:
      return trimmed;
  }
}

export default function UsersPage() {
  const [rows, setRows] = useState<Dictionary<unknown>[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"add" | "edit" | "view">("add");
  const [editingRow, setEditingRow] = useState<Dictionary<unknown> | null>(
    null,
  );
  const [formValues, setFormValues] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [genders, setGenders] = useState<LookupOption[]>([]);
  const [maritalStatuses, setMaritalStatuses] = useState<LookupOption[]>([]);

  useEffect(() => {
    let cancelled = false;
    const fetchRows = async () => {
      setIsLoading(true);
      setFetchError(null);

      try {
        const response = await fetch("/api/users", { cache: "no-store" });
        const result = await response.json();

        if (!response.ok) {
          throw new Error(result?.error || "Unable to load users.");
        }
        if (!cancelled) {
          const flat = (Array.isArray(result.rows) ? result.rows : []).map(
            flattenUser,
          );
          setRows(flat);
        }
      } catch (error) {
        if (!cancelled) {
          setFetchError(
            error instanceof Error ? error.message : "Unable to load users.",
          );
          setRows([]);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    void fetchRows();
    return () => {
      cancelled = true;
    };
  }, [refreshKey]);

  useEffect(() => {
    async function fetchLookups() {
      try {
        const [genderRes, maritalRes] = await Promise.all([
          fetch("/api/crud?table=genders", { cache: "no-store" }),
          fetch("/api/crud?table=maritalStatuses", { cache: "no-store" }),
        ]);
        const genderData = await genderRes.json();
        const maritalData = await maritalRes.json();
        if (Array.isArray(genderData.rows)) setGenders(genderData.rows);
        if (Array.isArray(maritalData.rows))
          setMaritalStatuses(maritalData.rows);
      } catch {
        // lookup data is non-critical
      }
    }
    void fetchLookups();
  }, []);

  const downloading = useRef(false);

  const handleDownload = useCallback(async () => {
    if (downloading.current) return;
    downloading.current = true;

    try {
      const res = await fetch("/api/users", { cache: "no-store" });
      const result = await res.json();
      if (!res.ok || !Array.isArray(result.rows)) return;

      const data = result.rows.map((row: Record<string, unknown>) => {
        const g = row.gender as LookupOption | undefined;
        const m = row.maritalStatus as LookupOption | undefined;
        return {
          ID: row.id ?? "",
          "First Name": row.firstName ?? "",
          "Last Name": row.lastName ?? "",
          Email: row.email ?? "",
          "Gender ID": row.genderId ?? "",
          Gender: g?.label ?? "",
          "Marital Status ID": row.maritalStatusId ?? "",
          "Birth Date": row.birthDate ?? "",
          Phone: row.phone ?? "",
          "Phone 2": row.phone2 ?? "",
          Address: row.address ?? "",
          "Marital Status": m?.label ?? "",
          Bank: row.bank ?? "",
          IBAN: row.iban ?? "",
          BIC: row.bic ?? "",
        };
      });

      const ws = XLSX.utils.json_to_sheet(data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Users");
      XLSX.writeFile(wb, "users.xlsx");
    } finally {
      downloading.current = false;
    }
  }, []);

  const refresh = useCallback(
    () => setRefreshKey((current) => current + 1),
    [],
  );

  const formFields = useMemo(() => columns.filter((c) => !c.isKey), []);

  const getInitialFormValues = useCallback(
    (row?: Dictionary<unknown>) => {
      const values: Record<string, string> = {};
      formFields.forEach((column) => {
        const existingValue = row?.[column.id];
        values[column.id] =
          existingValue === undefined || existingValue === null
            ? ""
            : String(existingValue);
      });
      return values;
    },
    [formFields],
  );

  const handleAdd = useCallback(async () => {
    setModalMode("add");
    setEditingRow(null);
    setFormValues(getInitialFormValues());
    setFormError(null);
    setIsModalOpen(true);
  }, [getInitialFormValues]);

  const handleEdit = useCallback(
    async (row: Dictionary<unknown>) => {
      setModalMode("edit");
      setEditingRow(row);
      setFormValues(getInitialFormValues(row));
      setFormError(null);
      setIsModalOpen(true);
    },
    [getInitialFormValues],
  );

  const handleView = useCallback(
    async (row: Dictionary<unknown>) => {
      setModalMode("view");
      setEditingRow(row);
      setFormValues(getInitialFormValues(row));
      setFormError(null);
      setIsModalOpen(true);
    },
    [getInitialFormValues],
  );

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    setFormError(null);
  }, []);

  const handleFormChange = useCallback((field: string, value: string) => {
    setFormValues((current) => ({ ...current, [field]: value }));
  }, []);

  const buildPayload = useCallback(() => {
    const payload: Record<string, unknown> = {};

    for (const column of formFields) {
      const rawValue = (formValues[column.id] ?? "").trim();
      if (rawValue === "") {
        if (column.isMandatory) {
          throw new Error(`${column.label} is required.`);
        }
        continue;
      }
      payload[column.id] = parseValue(rawValue, column.type);
    }

    return payload;
  }, [formFields, formValues]);

  const handleDelete = useCallback(
    async (row: Dictionary<unknown>) => {
      const id = row.id;
      if (id === undefined || id === null) {
        window.alert("Row id is required to delete.");
        return;
      }

      if (
        !window.confirm(
          `Delete user #${id} (${row.firstName} ${row.lastName})?`,
        )
      ) {
        return;
      }

      try {
        const response = await fetch("/api/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "delete", where: { id } }),
        });
        const result = await response.json();
        if (!response.ok || !result.success) {
          throw new Error(result?.error || "Delete failed.");
        }
        refresh();
      } catch (error) {
        window.alert(
          error instanceof Error ? error.message : "Unable to delete user.",
        );
      }
    },
    [refresh],
  );

  const handleModalSubmit = useCallback(async () => {
    try {
      const payload = buildPayload();

      const action = modalMode === "add" ? "create" : "update";

      const body: Record<string, unknown> = {
        action,
        data: payload,
      };

      if (action === "update") {
        const id = editingRow?.id;
        if (id === undefined || id === null) {
          throw new Error("Missing user id for update.");
        }
        body.where = { id };
      }

      const response = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result?.error || "Save failed.");
      }

      closeModal();
      refresh();
    } catch (error) {
      setFormError(
        error instanceof Error ? error.message : "Unable to save user.",
      );
    }
  }, [buildPayload, modalMode, editingRow, closeModal, refresh]);

  return (
    <div className="min-h-screen p-6 bg-slate-50 text-slate-900">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-semibold mb-4">Users</h1>
        <p className="text-slate-600 mb-6">
          Manage users with add, edit, view and delete actions.
        </p>

        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold">All Users</h2>
            <p className="text-sm text-slate-500">
              Use the table below to add, update, or delete users.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleDownload}
              className="rounded-lg border border-slate-300 bg-white text-slate-700 px-4 py-2 transition hover:bg-slate-100"
            >
              Download XLSX
            </button>
          </div>
        </div>

        <DeepTable
          columnNames={columns}
          initialRowsValues={rows}
          displayPagination={true}
          displayAddButton={true}
          displayEditAction={true}
          displayDeleteAction={true}
          displayViewAction={true}
          handleAddAction={handleAdd}
          handleEditAction={handleEdit}
          handleDeleteAction={handleDelete}
          handleViewAction={handleView}
          handleRefreshAction={refresh}
          isLoading={isLoading}
          fetchError={fetchError}
        />

        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 px-4 py-8">
            <div className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl ring-1 ring-slate-200 max-h-[90vh] flex flex-col">
              <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 shrink-0">
                <div>
                  <h3 className="text-xl font-semibold">
                    {modalMode === "add"
                      ? "Add User"
                      : modalMode === "edit"
                        ? "Edit User"
                        : "View User"}
                  </h3>
                  <p className="text-sm text-slate-500">
                    {modalMode === "add"
                      ? "Enter details for the new user."
                      : modalMode === "edit"
                        ? "Update the user details."
                        : "User details."}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={closeModal}
                  className="rounded-full border border-slate-200 px-3 py-2 text-slate-600 hover:bg-slate-50"
                >
                  Close
                </button>
              </div>

              <div className="px-6 py-5 space-y-4 overflow-y-auto">
                {formError && (
                  <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700 ring-1 ring-red-200">
                    {formError}
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  {formFields
                    .filter(
                      (col) =>
                        col.id !== "genderId" &&
                        col.id !== "maritalStatusId" &&
                        col.id !== "genderLabel" &&
                        col.id !== "maritalStatusLabel",
                    )
                    .map((column) => {
                      const value = formValues[column.id] ?? "";
                      const isSelect =
                        column.id === "genderLabel" ||
                        column.id === "maritalStatusLabel";
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
                            readOnly={modalMode === "view"}
                            disabled={modalMode === "view"}
                            onChange={(event) =>
                              handleFormChange(column.id, event.target.value)
                            }
                            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-slate-900 outline-none transition focus:border-slate-600 focus:ring-2 focus:ring-slate-200"
                          />
                        </div>
                      );
                    })}

                  <div className="space-y-2">
                    <label
                      className="block text-sm font-medium text-slate-700"
                      htmlFor="field-genderSelect"
                    >
                      Gender *
                    </label>
                    <select
                      id="field-genderSelect"
                      value={formValues.genderId ?? ""}
                      disabled={modalMode === "view"}
                      onChange={(event) =>
                        handleFormChange("genderId", event.target.value)
                      }
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-slate-900 outline-none transition focus:border-slate-600 focus:ring-2 focus:ring-slate-200"
                    >
                      <option value="">Select gender</option>
                      {genders.map((g) => (
                        <option key={g.id} value={g.id}>
                          {g.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label
                      className="block text-sm font-medium text-slate-700"
                      htmlFor="field-maritalStatusSelect"
                    >
                      Marital Status *
                    </label>
                    <select
                      id="field-maritalStatusSelect"
                      value={formValues.maritalStatusId ?? ""}
                      disabled={modalMode === "view"}
                      onChange={(event) =>
                        handleFormChange("maritalStatusId", event.target.value)
                      }
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-slate-900 outline-none transition focus:border-slate-600 focus:ring-2 focus:ring-slate-200"
                    >
                      <option value="">Select marital status</option>
                      {maritalStatuses.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 border-t border-slate-200 bg-slate-50 px-6 py-4 shrink-0">
                <button
                  type="button"
                  onClick={closeModal}
                  className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-slate-700 transition hover:bg-slate-100"
                >
                  Close
                </button>
                {modalMode !== "view" && (
                  <button
                    type="button"
                    onClick={handleModalSubmit}
                    className="rounded-lg bg-slate-900 px-4 py-2 text-white transition hover:bg-slate-700"
                  >
                    Save
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
