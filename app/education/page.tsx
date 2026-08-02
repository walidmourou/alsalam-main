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
type GuardianInfo = {
  id: number;
  userId: number;
  userFirstName: string;
  userLastName: string;
  relationshipTypeId: number;
  relationshipType: LookupOption | null;
  isPrimary: boolean;
};

const studentColumns: TableColumn[] = [
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
    id: "birthDate",
    label: "Birth Date",
    type: ColumnType.date,
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
    canFilter: true,
  },
  {
    id: "notes",
    label: "Notes",
    type: ColumnType.string,
    invisible: true,
  },
  {
    id: "guardiansDisplay",
    label: "Guardians",
    type: ColumnType.string,
    align: CellTextAlign.left,
  },
];

function formatGuardians(guardians: GuardianInfo[]): string {
  return guardians
    .map((g) => {
      const name = `${g.userFirstName ?? ""} ${g.userLastName ?? ""}`.trim();
      const rel = g.relationshipType?.label ?? "";
      const primary = g.isPrimary ? " (Primary)" : "";
      return `${name}${rel ? ` - ${rel}` : ""}${primary}`;
    })
    .join(", ");
}

function flattenStudent(row: Dictionary<unknown>) {
  const genderObj = row.gender as LookupOption | undefined;
  const guardians = (row.guardians as GuardianInfo[]) ?? [];
  return {
    ...row,
    genderLabel: genderObj?.label ?? "",
    guardiansDisplay: formatGuardians(guardians),
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

export default function EducationPage() {
  const [rows, setRows] = useState<Dictionary<unknown>[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"add" | "edit" | "view">("add");
  const [editingRow, setEditingRow] = useState<Dictionary<unknown> | null>(null);
  const [formValues, setFormValues] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [genders, setGenders] = useState<LookupOption[]>([]);
  const [users, setUsers] = useState<LookupOption[]>([]);
  const [relationshipTypes, setRelationshipTypes] = useState<LookupOption[]>([]);

  const [guardians, setGuardians] = useState<GuardianInfo[]>([]);
  const [newGuardianUserId, setNewGuardianUserId] = useState("");
  const [newGuardianRelTypeId, setNewGuardianRelTypeId] = useState("");
  const [newGuardianIsPrimary, setNewGuardianIsPrimary] = useState(false);
  const [guardianError, setGuardianError] = useState<string | null>(null);
  const [savingGuardian, setSavingGuardian] = useState(false);

  const studentIdRef = useRef<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    const fetchRows = async () => {
      setIsLoading(true);
      setFetchError(null);

      try {
        const response = await fetch("/api/students", { cache: "no-store" });
        const result = await response.json();

        if (!response.ok) {
          throw new Error(result?.error || "Unable to load students.");
        }
        if (!cancelled) {
          const flat = (Array.isArray(result.rows) ? result.rows : []).map(
            flattenStudent,
          );
          setRows(flat);
        }
      } catch (error) {
        if (!cancelled) {
          setFetchError(
            error instanceof Error ? error.message : "Unable to load students.",
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
        const [genderRes, userRes, relRes] = await Promise.all([
          fetch("/api/crud?table=genders", { cache: "no-store" }),
          fetch("/api/crud?table=users", { cache: "no-store" }),
          fetch("/api/crud?table=relationshipTypes", { cache: "no-store" }),
        ]);
        const genderData = await genderRes.json();
        const userData = await userRes.json();
        const relData = await relRes.json();
        if (Array.isArray(genderData.rows)) setGenders(genderData.rows);
        if (Array.isArray(userData.rows))
          setUsers(
            userData.rows.map((u: Dictionary<unknown>) => ({
              id: u.id as number,
              label: `${u.firstName ?? ""} ${u.lastName ?? ""}`.trim() || `User #${u.id}`,
            })),
          );
        if (Array.isArray(relData.rows)) setRelationshipTypes(relData.rows);
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
      const res = await fetch("/api/students", { cache: "no-store" });
      const result = await res.json();
      if (!res.ok || !Array.isArray(result.rows)) return;

      const data = result.rows.map((row: Record<string, unknown>) => {
        const g = row.gender as LookupOption | undefined;
        const guards = (row.guardians as GuardianInfo[]) ?? [];
        return {
          ID: row.id ?? "",
          "First Name": row.firstName ?? "",
          "Last Name": row.lastName ?? "",
          "Birth Date": row.birthDate ?? "",
          Gender: g?.label ?? "",
          Notes: row.notes ?? "",
          Guardians: formatGuardians(guards),
        };
      });

      const ws = XLSX.utils.json_to_sheet(data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Students");
      XLSX.writeFile(wb, "students.xlsx");
    } finally {
      downloading.current = false;
    }
  }, []);

  const refresh = useCallback(
    () => setRefreshKey((current) => current + 1),
    [],
  );

  const formFields = useMemo(
    () => studentColumns.filter((c) => !c.isKey && c.id !== "guardiansDisplay" && c.id !== "genderLabel"),
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

  const resetGuardianForm = useCallback(() => {
    setNewGuardianUserId("");
    setNewGuardianRelTypeId("");
    setNewGuardianIsPrimary(false);
    setGuardianError(null);
  }, []);

  const handleAdd = useCallback(async () => {
    setModalMode("add");
    setEditingRow(null);
    setFormValues(getInitialFormValues());
    setFormError(null);
    setGuardians([]);
    studentIdRef.current = null;
    resetGuardianForm();
    setIsModalOpen(true);
  }, [getInitialFormValues, resetGuardianForm]);

  const handleEdit = useCallback(
    async (row: Dictionary<unknown>) => {
      setModalMode("edit");
      setEditingRow(row);
      setFormValues(getInitialFormValues(row));
      setFormError(null);
      const rawGuardians = (row.guardians as GuardianInfo[]) ?? [];
      setGuardians(rawGuardians);
      studentIdRef.current = (row.id as number) ?? null;
      resetGuardianForm();
      setIsModalOpen(true);
    },
    [getInitialFormValues, resetGuardianForm],
  );

  const handleView = useCallback(
    async (row: Dictionary<unknown>) => {
      setModalMode("view");
      setEditingRow(row);
      setFormValues(getInitialFormValues(row));
      setFormError(null);
      const rawGuardians = (row.guardians as GuardianInfo[]) ?? [];
      setGuardians(rawGuardians);
      studentIdRef.current = (row.id as number) ?? null;
      resetGuardianForm();
      setIsModalOpen(true);
    },
    [getInitialFormValues, resetGuardianForm],
  );

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    setFormError(null);
    setGuardianError(null);
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
          `Delete student #${id} (${row.firstName} ${row.lastName})?`,
        )
      ) {
        return;
      }

      try {
        const response = await fetch("/api/students", {
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
          error instanceof Error ? error.message : "Unable to delete student.",
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
          throw new Error("Missing student id for update.");
        }
        body.where = { id };
      }

      const response = await fetch("/api/students", {
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
        error instanceof Error ? error.message : "Unable to save student.",
      );
    }
  }, [buildPayload, modalMode, editingRow, closeModal, refresh]);

  const handleRemoveGuardian = useCallback(
    async (guardianId: number) => {
      try {
        const response = await fetch("/api/crud", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "delete",
            table: "studentGuardians",
            where: { id: guardianId },
          }),
        });
        const result = await response.json();
        if (!response.ok || !result.success) {
          throw new Error(result?.error || "Failed to remove guardian.");
        }
        setGuardians((prev) => prev.filter((g) => g.id !== guardianId));
      } catch (error) {
        window.alert(
          error instanceof Error ? error.message : "Unable to remove guardian.",
        );
      }
    },
    [],
  );

  const handleAddGuardian = useCallback(async () => {
    const studentId = studentIdRef.current;
    if (!studentId) {
      setGuardianError("Save the student first, then add guardians.");
      return;
    }
    if (!newGuardianUserId) {
      setGuardianError("Select a user.");
      return;
    }
    if (!newGuardianRelTypeId) {
      setGuardianError("Select a relationship type.");
      return;
    }

    setSavingGuardian(true);
    setGuardianError(null);

    try {
      const response = await fetch("/api/crud", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "create",
          table: "studentGuardians",
          data: {
            userId: Number(newGuardianUserId),
            studentId,
            relationshipTypeId: Number(newGuardianRelTypeId),
            isPrimary: newGuardianIsPrimary,
          },
        }),
      });
      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result?.error || "Failed to add guardian.");
      }

      const selectedUser = users.find(
        (u) => u.id === Number(newGuardianUserId),
      );
      const selectedRel = relationshipTypes.find(
        (r) => r.id === Number(newGuardianRelTypeId),
      );

      const newGuardian: GuardianInfo = {
        id: result.result.insertId,
        userId: Number(newGuardianUserId),
        userFirstName: selectedUser?.label.split(" ")[0] ?? "",
        userLastName: selectedUser?.label.split(" ").slice(1).join(" ") ?? "",
        relationshipTypeId: Number(newGuardianRelTypeId),
        relationshipType: selectedRel ?? null,
        isPrimary: newGuardianIsPrimary,
      };

      setGuardians((prev) => [...prev, newGuardian]);
      resetGuardianForm();
    } catch (error) {
      setGuardianError(
        error instanceof Error ? error.message : "Unable to add guardian.",
      );
    } finally {
      setSavingGuardian(false);
    }
  }, [
    studentIdRef,
    newGuardianUserId,
    newGuardianRelTypeId,
    newGuardianIsPrimary,
    users,
    relationshipTypes,
    resetGuardianForm,
  ]);

  return (
    <div className="min-h-screen p-6 bg-slate-50 text-slate-900">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-semibold mb-4">Education</h1>
        <p className="text-slate-600 mb-6">
          Manage students and their guardians.
        </p>

        <div className="mb-6">
          <div className="flex items-center gap-4 border-b border-slate-200">
            <Link
              href="/education"
              className="px-4 py-3 text-sm font-medium text-slate-900 border-b-2 border-slate-900"
            >
              Students
            </Link>
            <Link
              href="/education/teachers"
              className="px-4 py-3 text-sm font-medium text-slate-500 hover:text-slate-900 transition"
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
            <h2 className="text-xl font-semibold">All Students</h2>
            <p className="text-sm text-slate-500">
              Use the table below to add, update, or delete students and manage their guardians.
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
          columnNames={studentColumns}
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
                      ? "Add Student"
                      : modalMode === "edit"
                        ? "Edit Student"
                        : "View Student"}
                  </h3>
                  <p className="text-sm text-slate-500">
                    {modalMode === "add"
                      ? "Enter details for the new student."
                      : modalMode === "edit"
                        ? "Update the student details and manage guardians."
                        : "Student details and guardians."}
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
                    <label className="block text-sm font-medium text-slate-700" htmlFor="field-firstName">
                      First Name *
                    </label>
                    <input
                      id="field-firstName"
                      type="text"
                      value={formValues.firstName ?? ""}
                      readOnly={modalMode === "view"}
                      disabled={modalMode === "view"}
                      onChange={(event) =>
                        handleFormChange("firstName", event.target.value)
                      }
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-slate-900 outline-none transition focus:border-slate-600 focus:ring-2 focus:ring-slate-200"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-slate-700" htmlFor="field-lastName">
                      Last Name *
                    </label>
                    <input
                      id="field-lastName"
                      type="text"
                      value={formValues.lastName ?? ""}
                      readOnly={modalMode === "view"}
                      disabled={modalMode === "view"}
                      onChange={(event) =>
                        handleFormChange("lastName", event.target.value)
                      }
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-slate-900 outline-none transition focus:border-slate-600 focus:ring-2 focus:ring-slate-200"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-slate-700" htmlFor="field-birthDate">
                      Birth Date
                    </label>
                    <input
                      id="field-birthDate"
                      type="date"
                      value={formValues.birthDate ?? ""}
                      readOnly={modalMode === "view"}
                      disabled={modalMode === "view"}
                      onChange={(event) =>
                        handleFormChange("birthDate", event.target.value)
                      }
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-slate-900 outline-none transition focus:border-slate-600 focus:ring-2 focus:ring-slate-200"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-slate-700" htmlFor="field-genderSelect">
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

                  <div className="col-span-2 space-y-2">
                    <label className="block text-sm font-medium text-slate-700" htmlFor="field-notes">
                      Notes
                    </label>
                    <textarea
                      id="field-notes"
                      value={formValues.notes ?? ""}
                      readOnly={modalMode === "view"}
                      disabled={modalMode === "view"}
                      onChange={(event) =>
                        handleFormChange("notes", event.target.value)
                      }
                      rows={2}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-slate-900 outline-none transition focus:border-slate-600 focus:ring-2 focus:ring-slate-200"
                    />
                  </div>
                </div>

                {modalMode !== "add" && (
                  <div className="border-t border-slate-200 pt-4 mt-4">
                    <h4 className="text-lg font-semibold mb-3">Guardians</h4>

                    {guardianError && (
                      <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700 ring-1 ring-red-200 mb-3">
                        {guardianError}
                      </div>
                    )}

                    {guardians.length === 0 && (
                      <p className="text-sm text-slate-500 mb-3">
                        No guardians assigned.
                      </p>
                    )}

                    <div className="space-y-2 mb-4">
                      {guardians.map((g) => (
                        <div
                          key={g.id}
                          className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-4 py-2"
                        >
                          <div className="text-sm">
                            <span className="font-medium">
                              {g.userFirstName} {g.userLastName}
                            </span>
                            <span className="text-slate-500 mx-2">
                              &mdash; {g.relationshipType?.label ?? "Unknown"}
                            </span>
                            {g.isPrimary && (
                              <span className="inline-block rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">
                                Primary
                              </span>
                            )}
                          </div>
                          {modalMode !== "view" && (
                            <button
                              type="button"
                              onClick={() => handleRemoveGuardian(g.id)}
                              className="text-sm text-red-600 hover:text-red-800 transition"
                            >
                              Remove
                            </button>
                          )}
                        </div>
                      ))}
                    </div>

                    {modalMode !== "view" && (
                      <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                        <h5 className="text-sm font-semibold text-slate-700 mb-3">
                          Add Guardian
                        </h5>
                        <div className="grid grid-cols-3 gap-3">
                          <div className="space-y-1">
                            <label className="block text-xs font-medium text-slate-600">
                              User
                            </label>
                            <select
                              value={newGuardianUserId}
                              onChange={(e) => setNewGuardianUserId(e.target.value)}
                              className="w-full rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-sm text-slate-900 outline-none transition focus:border-slate-600"
                            >
                              <option value="">Select...</option>
                              {users.map((u) => (
                                <option key={u.id} value={u.id}>
                                  {u.label}
                                </option>
                              ))}
                            </select>
                          </div>
                          <div className="space-y-1">
                            <label className="block text-xs font-medium text-slate-600">
                              Relationship
                            </label>
                            <select
                              value={newGuardianRelTypeId}
                              onChange={(e) => setNewGuardianRelTypeId(e.target.value)}
                              className="w-full rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-sm text-slate-900 outline-none transition focus:border-slate-600"
                            >
                              <option value="">Select...</option>
                              {relationshipTypes.map((r) => (
                                <option key={r.id} value={r.id}>
                                  {r.label}
                                </option>
                              ))}
                            </select>
                          </div>
                          <div className="flex items-end gap-2">
                            <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={newGuardianIsPrimary}
                                onChange={(e) =>
                                  setNewGuardianIsPrimary(e.target.checked)
                                }
                                className="rounded border-slate-300"
                              />
                              Primary
                            </label>
                            <button
                              type="button"
                              onClick={handleAddGuardian}
                              disabled={savingGuardian}
                              className="rounded-lg bg-slate-800 px-3 py-1.5 text-sm text-white transition hover:bg-slate-700 disabled:opacity-50"
                            >
                              {savingGuardian ? "..." : "Add"}
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
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
