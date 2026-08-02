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
    id: "userId",
    label: "User ID",
    type: ColumnType.integer,
    invisible: true,
    isMandatory: true,
  },
  {
    id: "userFullName",
    label: "User",
    type: ColumnType.string,
    align: CellTextAlign.left,
    canSearch: true,
    canFilter: true,
  },
  {
    id: "membershipTypeId",
    label: "Membership Type ID",
    type: ColumnType.integer,
    invisible: true,
    isMandatory: true,
  },
  {
    id: "membershipTypeLabel",
    label: "Membership Type",
    type: ColumnType.string,
    align: CellTextAlign.left,
    canFilter: true,
  },
  {
    id: "membershipStatusId",
    label: "Membership Status ID",
    type: ColumnType.integer,
    invisible: true,
    isMandatory: true,
  },
  {
    id: "membershipStatusLabel",
    label: "Status",
    type: ColumnType.string,
    align: CellTextAlign.left,
    canFilter: true,
  },
  {
    id: "startDate",
    label: "Start Date",
    type: ColumnType.date,
  },
  {
    id: "endDate",
    label: "End Date",
    type: ColumnType.date,
  },
];

function flattenRow(row: Dictionary<unknown>) {
  const typeObj = row.membershipType as LookupOption | undefined;
  const statusObj = row.membershipStatus as LookupOption | undefined;
  return {
    ...row,
    userFullName: `${row.userFirstName ?? ""} ${row.userLastName ?? ""}`.trim(),
    membershipTypeLabel: typeObj?.label ?? "",
    membershipStatusLabel: statusObj?.label ?? "",
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

export default function MembershipsPage() {
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
  const [membershipTypes, setMembershipTypes] = useState<LookupOption[]>([]);
  const [membershipStatuses, setMembershipStatuses] = useState<LookupOption[]>([]);

  useEffect(() => {
    let cancelled = false;
    const fetchRows = async () => {
      setIsLoading(true);
      setFetchError(null);

      try {
        const response = await fetch("/api/memberships", { cache: "no-store" });
        const result = await response.json();

        if (!response.ok) {
          throw new Error(result?.error || "Unable to load memberships.");
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
            error instanceof Error ? error.message : "Unable to load memberships.",
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
        const [userRes, typeRes, statusRes] = await Promise.all([
          fetch("/api/crud?table=users", { cache: "no-store" }),
          fetch("/api/crud?table=membershipTypes", { cache: "no-store" }),
          fetch("/api/crud?table=membershipStatuses", { cache: "no-store" }),
        ]);
        const userData = await userRes.json();
        const typeData = await typeRes.json();
        const statusData = await statusRes.json();
        if (Array.isArray(userData.rows))
          setUsers(
            userData.rows.map((u: Dictionary<unknown>) => ({
              id: u.id as number,
              label: `${u.firstName ?? ""} ${u.lastName ?? ""}`.trim() || `User #${u.id}`,
            })),
          );
        if (Array.isArray(typeData.rows)) setMembershipTypes(typeData.rows);
        if (Array.isArray(statusData.rows)) setMembershipStatuses(statusData.rows);
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
      const res = await fetch("/api/memberships", { cache: "no-store" });
      const result = await res.json();
      if (!res.ok || !Array.isArray(result.rows)) return;

      const data = result.rows.map((row: Record<string, unknown>) => {
        const t = row.membershipType as LookupOption | undefined;
        const s = row.membershipStatus as LookupOption | undefined;
        return {
          ID: row.id ?? "",
          User: `${row.userFirstName ?? ""} ${row.userLastName ?? ""}`.trim(),
          "Membership Type": t?.label ?? "",
          Status: s?.label ?? "",
          "Start Date": row.startDate ?? "",
          "End Date": row.endDate ?? "",
        };
      });

      const ws = XLSX.utils.json_to_sheet(data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Memberships");
      XLSX.writeFile(wb, "memberships.xlsx");
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
      if (column.id === "userFullName" || column.id === "membershipTypeLabel" || column.id === "membershipStatusLabel") {
        continue;
      }
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
        !window.confirm(`Delete membership #${id}?`)
      ) {
        return;
      }

      try {
        const response = await fetch("/api/memberships", {
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
          error instanceof Error ? error.message : "Unable to delete membership.",
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
          throw new Error("Missing membership id for update.");
        }
        body.where = { id };
      }

      const response = await fetch("/api/memberships", {
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
        error instanceof Error ? error.message : "Unable to save membership.",
      );
    }
  }, [buildPayload, modalMode, editingRow, closeModal, refresh]);

  return (
    <div className="min-h-screen p-6 bg-slate-50 text-slate-900">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-semibold mb-4">Memberships</h1>
        <p className="text-slate-600 mb-6">
          Manage memberships with add, edit, view and delete actions.
        </p>

        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold">All Memberships</h2>
            <p className="text-sm text-slate-500">
              Use the table below to add, update, or delete memberships.
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
                      ? "Add Membership"
                      : modalMode === "edit"
                        ? "Edit Membership"
                        : "View Membership"}
                  </h3>
                  <p className="text-sm text-slate-500">
                    {modalMode === "add"
                      ? "Enter details for the new membership."
                      : modalMode === "edit"
                        ? "Update the membership details."
                        : "Membership details."}
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
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-slate-700" htmlFor="field-userSelect">
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
                    <label className="block text-sm font-medium text-slate-700" htmlFor="field-typeSelect">
                      Membership Type *
                    </label>
                    <select
                      id="field-typeSelect"
                      value={formValues.membershipTypeId ?? ""}
                      disabled={modalMode === "view"}
                      onChange={(event) =>
                        handleFormChange("membershipTypeId", event.target.value)
                      }
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-slate-900 outline-none transition focus:border-slate-600 focus:ring-2 focus:ring-slate-200"
                    >
                      <option value="">Select type</option>
                      {membershipTypes.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-slate-700" htmlFor="field-statusSelect">
                      Status *
                    </label>
                    <select
                      id="field-statusSelect"
                      value={formValues.membershipStatusId ?? ""}
                      disabled={modalMode === "view"}
                      onChange={(event) =>
                        handleFormChange("membershipStatusId", event.target.value)
                      }
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-slate-900 outline-none transition focus:border-slate-600 focus:ring-2 focus:ring-slate-200"
                    >
                      <option value="">Select status</option>
                      {membershipStatuses.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-slate-700" htmlFor="field-startDate">
                      Start Date
                    </label>
                    <input
                      id="field-startDate"
                      type="date"
                      value={formValues.startDate ?? ""}
                      readOnly={modalMode === "view"}
                      disabled={modalMode === "view"}
                      onChange={(event) =>
                        handleFormChange("startDate", event.target.value)
                      }
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-slate-900 outline-none transition focus:border-slate-600 focus:ring-2 focus:ring-slate-200"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-slate-700" htmlFor="field-endDate">
                      End Date
                    </label>
                    <input
                      id="field-endDate"
                      type="date"
                      value={formValues.endDate ?? ""}
                      readOnly={modalMode === "view"}
                      disabled={modalMode === "view"}
                      onChange={(event) =>
                        handleFormChange("endDate", event.target.value)
                      }
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
