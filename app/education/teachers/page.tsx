"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import * as XLSX from "xlsx";
import Link from "next/link";
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
    id: "userId",
    label: "User ID",
    type: ColumnType.integer,
    invisible: true,
    isMandatory: true,
  },
  {
    id: "teacherName",
    label: "Name",
    type: ColumnType.string,
    align: CellTextAlign.left,
    canSearch: true,
  },
  {
    id: "userEmail",
    label: "Email",
    type: ColumnType.string,
  },
  {
    id: "userPhone",
    label: "Phone",
    type: ColumnType.string,
  },
  {
    id: "userBirthDate",
    label: "Birth Date",
    type: ColumnType.date,
    invisible: true,
  },
  {
    id: "userAddress",
    label: "Address",
    type: ColumnType.string,
    invisible: true,
  },
  {
    id: "specialization",
    label: "Specialization",
    type: ColumnType.string,
  },
  {
    id: "qualifications",
    label: "Qualifications",
    type: ColumnType.string,
    invisible: true,
  },
];

function flattenRow(row: Dictionary<unknown>) {
  return {
    ...row,
    teacherName:
      `${row.userFirstName ?? ""} ${row.userLastName ?? ""}`.trim() ||
      `User #${row.userId}`,
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
    case ColumnType.date:
      return trimmed;
    default:
      return trimmed;
  }
}

export default function TeachersPage() {
  const [rows, setRows] = useState<Dictionary<unknown>[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"add" | "edit" | "view">("add");
  const [editingRow, setEditingRow] = useState<Dictionary<unknown> | null>(null);
  const [formValues, setFormValues] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [users, setUsers] = useState<LookupOption[]>([]);

  useEffect(() => {
    let cancelled = false;
    const fetchRows = async () => {
      setIsLoading(true);
      setFetchError(null);

      try {
        const response = await fetch("/api/teachers", { cache: "no-store" });
        const result = await response.json();

        if (!response.ok) {
          throw new Error(result?.error || "Unable to load teachers.");
        }
        if (!cancelled) {
          const flat = (Array.isArray(result.rows) ? result.rows : []).map(
            flattenRow,
          );
          setRows(flat);
        }
      } catch (error) {
        if (!cancelled) {
          setFetchError(
            error instanceof Error ? error.message : "Unable to load teachers.",
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
        const userRes = await fetch("/api/crud?table=users", {
          cache: "no-store",
        });
        const userData = await userRes.json();
        if (Array.isArray(userData.rows))
          setUsers(
            userData.rows.map((u: Dictionary<unknown>) => ({
              id: u.id as number,
              label:
                `${u.firstName ?? ""} ${u.lastName ?? ""}`.trim() ||
                `User #${u.id}`,
            })),
          );
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
      const res = await fetch("/api/teachers", { cache: "no-store" });
      const result = await res.json();
      if (!res.ok || !Array.isArray(result.rows)) return;

      const data = result.rows.map((row: Record<string, unknown>) => ({
        ID: row.id ?? "",
        Name: `${row.userFirstName ?? ""} ${row.userLastName ?? ""}`.trim(),
        Email: row.userEmail ?? "",
        Phone: row.userPhone ?? "",
        "Birth Date": row.userBirthDate ?? "",
        Address: row.userAddress ?? "",
        Specialization: row.specialization ?? "",
        Qualifications: row.qualifications ?? "",
      }));

      const ws = XLSX.utils.json_to_sheet(data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Teachers");
      XLSX.writeFile(wb, "teachers.xlsx");
    } finally {
      downloading.current = false;
    }
  }, []);

  const refresh = useCallback(
    () => setRefreshKey((current) => current + 1),
    [],
  );

  const formFields = useMemo(
    () =>
      columns.filter(
        (c) =>
          !c.isKey &&
          c.id !== "teacherName" &&
          c.id !== "userEmail" &&
          c.id !== "userPhone" &&
          c.id !== "userBirthDate" &&
          c.id !== "userAddress",
      ),
    [],
  );

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

      const name = (row as Dictionary<unknown>).teacherName ?? `#${id}`;
      if (!window.confirm(`Delete teacher ${name}?`)) {
        return;
      }

      try {
        const response = await fetch("/api/teachers", {
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
          error instanceof Error
            ? error.message
            : "Unable to delete teacher.",
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
          throw new Error("Missing teacher id for update.");
        }
        body.where = { id };
      }

      const response = await fetch("/api/teachers", {
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
        error instanceof Error ? error.message : "Unable to save teacher.",
      );
    }
  }, [buildPayload, modalMode, editingRow, closeModal, refresh]);

  return (
    <div className="min-h-screen p-6 bg-slate-50 text-slate-900">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <div className="flex items-center gap-4 border-b border-slate-200">
            <Link
              href="/education"
              className="px-4 py-3 text-sm font-medium text-slate-500 hover:text-slate-900 transition"
            >
              Students
            </Link>
            <Link
              href="/education/teachers"
              className="px-4 py-3 text-sm font-medium text-slate-900 border-b-2 border-slate-900"
            >
              Teachers
            </Link>
            <Link
              href="/education/classes"
              className="px-4 py-3 text-sm font-medium text-slate-500 hover:text-slate-900 transition"
            >
              Classes
            </Link>
            <Link
              href="/education/enrollments"
              className="px-4 py-3 text-sm font-medium text-slate-500 hover:text-slate-900 transition"
            >
              Enrollments
            </Link>
            <Link
              href="/education/schedules"
              className="px-4 py-3 text-sm font-medium text-slate-500 hover:text-slate-900 transition"
            >
              Schedules
            </Link>
          </div>
        </div>

        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold">All Teachers</h2>
            <p className="text-sm text-slate-500">
              Manage teacher profiles linked to user accounts.
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
            <div className="w-full max-w-xl rounded-2xl bg-white shadow-2xl ring-1 ring-slate-200 max-h-[90vh] flex flex-col">
              <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 shrink-0">
                <div>
                  <h3 className="text-xl font-semibold">
                    {modalMode === "add"
                      ? "Add Teacher"
                      : modalMode === "edit"
                        ? "Edit Teacher"
                        : "View Teacher"}
                  </h3>
                  <p className="text-sm text-slate-500">
                    {modalMode === "add"
                      ? "Link a user as a teacher."
                      : modalMode === "edit"
                        ? "Update teacher details."
                        : "Teacher details."}
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

                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-2">
                    <label
                      className="block text-sm font-medium text-slate-700"
                      htmlFor="field-userSelect"
                    >
                      User *
                    </label>
                    <select
                      id="field-userSelect"
                      value={formValues.userId ?? ""}
                      disabled={modalMode === "view"}
                      onChange={(event) =>
                        handleFormChange("userId", event.target.value)
                      }
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-slate-900 outline-none transition focus:border-slate-600 focus:ring-2 focus:ring-slate-200"
                    >
                      <option value="">Select user</option>
                      {users.map((u) => (
                        <option key={u.id} value={u.id}>
                          {u.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label
                      className="block text-sm font-medium text-slate-700"
                      htmlFor="field-specialization"
                    >
                      Specialization
                    </label>
                    <input
                      id="field-specialization"
                      type="text"
                      value={formValues.specialization ?? ""}
                      readOnly={modalMode === "view"}
                      disabled={modalMode === "view"}
                      onChange={(event) =>
                        handleFormChange("specialization", event.target.value)
                      }
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-slate-900 outline-none transition focus:border-slate-600 focus:ring-2 focus:ring-slate-200"
                    />
                  </div>

                  <div className="space-y-2">
                    <label
                      className="block text-sm font-medium text-slate-700"
                      htmlFor="field-qualifications"
                    >
                      Qualifications
                    </label>
                    <textarea
                      id="field-qualifications"
                      value={formValues.qualifications ?? ""}
                      readOnly={modalMode === "view"}
                      disabled={modalMode === "view"}
                      onChange={(event) =>
                        handleFormChange("qualifications", event.target.value)
                      }
                      rows={3}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-slate-900 outline-none transition focus:border-slate-600 focus:ring-2 focus:ring-slate-200"
                    />
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
