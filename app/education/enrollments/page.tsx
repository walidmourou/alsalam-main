"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
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
    id: "studentId",
    label: "Student ID",
    type: ColumnType.integer,
    invisible: true,
    isMandatory: true,
  },
  {
    id: "studentFirstName",
    label: "Student",
    type: ColumnType.string,
    align: CellTextAlign.left,
    canSearch: true,
  },
  {
    id: "classId",
    label: "Class ID",
    type: ColumnType.integer,
    invisible: true,
    isMandatory: true,
  },
  {
    id: "educationYearLabel",
    label: "Year",
    type: ColumnType.string,
    align: CellTextAlign.left,
  },
  {
    id: "educationLevelLabel",
    label: "Level",
    type: ColumnType.string,
    align: CellTextAlign.left,
  },
  {
    id: "classLabel",
    label: "Class",
    type: ColumnType.string,
    align: CellTextAlign.left,
  },
  {
    id: "statusId",
    label: "Status ID",
    type: ColumnType.integer,
    invisible: true,
    isMandatory: true,
  },
  {
    id: "statusLabel",
    label: "Status",
    type: ColumnType.string,
    align: CellTextAlign.left,
  },
];

function flattenRow(row: Dictionary<unknown>) {
  return {
    ...row,
    studentName: `${row.studentFirstName ?? ""} ${row.studentLastName ?? ""}`.trim(),
    className: [row.educationYearLabel, row.educationLevelLabel, row.classLabel].filter(Boolean).join(" - "),
  };
}

export default function EnrollmentsPage() {
  const [rows, setRows] = useState<Dictionary<unknown>[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"add" | "edit" | "view">("add");
  const [editingRow, setEditingRow] = useState<Dictionary<unknown> | null>(null);
  const [formValues, setFormValues] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);

  const [students, setStudents] = useState<LookupOption[]>([]);
  const [classOpts, setClassOpts] = useState<LookupOption[]>([]);
  const [statuses, setStatuses] = useState<LookupOption[]>([]);

  useEffect(() => {
    let cancelled = false;
    const fetchRows = async () => {
      setIsLoading(true);
      setFetchError(null);
      try {
        const response = await fetch("/api/education/enrollments", { cache: "no-store" });
        const result = await response.json();
        if (!response.ok) throw new Error(result?.error || "Unable to load enrollments.");
        if (!cancelled) {
          setRows((Array.isArray(result.rows) ? result.rows : []).map(flattenRow));
        }
      } catch (error) {
        if (!cancelled) {
          setFetchError(error instanceof Error ? error.message : "Unable to load enrollments.");
          setRows([]);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };
    void fetchRows();
    return () => { cancelled = true; };
  }, [refreshKey]);

  useEffect(() => {
    async function fetchLookups() {
      try {
        const [stuRes, clsRes, statRes] = await Promise.all([
          fetch("/api/crud?table=students", { cache: "no-store" }),
          fetch("/api/crud?table=classes", { cache: "no-store" }),
          fetch("/api/crud?table=enrollmentStatuses", { cache: "no-store" }),
        ]);
        const stuData = await stuRes.json();
        const clsData = await clsRes.json();
        const statData = await statRes.json();
        if (Array.isArray(stuData.rows))
          setStudents(
            stuData.rows.map((u: Dictionary<unknown>) => ({
              id: u.id as number,
              label: `${u.firstName ?? ""} ${u.lastName ?? ""}`.trim() || `Student #${u.id}`,
            })),
          );
        if (Array.isArray(clsData.rows))
          setClassOpts(
            clsData.rows.map((c: Dictionary<unknown>) => ({
              id: c.id as number,
              label: [c.educationYearLabel, c.educationLevelLabel, c.label].filter(Boolean).join(" - ") || `Class #${c.id}`,
            })),
          );
        if (Array.isArray(statData.rows))
          setStatuses(
            statData.rows.map((s: Dictionary<unknown>) => ({
              id: s.id as number,
              label: s.label as string,
            })),
          );
      } catch {
        // silently fail
      }
    }
    void fetchLookups();
  }, []);

  const handleAdd = useCallback(async () => {
    setModalMode("add");
    setEditingRow(null);
    setFormValues({});
    setFormError(null);
    setIsModalOpen(true);
  }, []);

  const handleEdit = useCallback(async (row: Dictionary<unknown>) => {
    setModalMode("edit");
    setEditingRow(row);
    setFormValues({
      studentId: String(row.studentId ?? ""),
      classId: String(row.classId ?? ""),
      statusId: String(row.statusId ?? ""),
    });
    setFormError(null);
    setIsModalOpen(true);
  }, []);

  const handleView = useCallback(async (row: Dictionary<unknown>) => {
    setModalMode("view");
    setEditingRow(row);
    setFormValues({
      studentId: String(row.studentId ?? ""),
      classId: String(row.classId ?? ""),
      statusId: String(row.statusId ?? ""),
    });
    setFormError(null);
    setIsModalOpen(true);
  }, []);

  const handleDelete = useCallback(async (row: Dictionary<unknown>) => {
    if (!window.confirm("Delete this enrollment?")) return;
    try {
      const res = await fetch("/api/crud", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "delete", table: "classStudents", where: { id: row.id } }),
      });
      const result = await res.json();
      if (!res.ok || !result.success) throw new Error(result?.error || "Delete failed.");
      setRows((prev) => prev.filter((r) => r.id !== row.id));
    } catch (error) {
      window.alert(error instanceof Error ? error.message : "Unable to delete.");
    }
  }, []);

  const handleSubmit = useCallback(async () => {
    try {
      const payload: Record<string, unknown> = {};
      if (formValues.studentId) payload.studentId = Number(formValues.studentId);
      if (formValues.classId) payload.classId = Number(formValues.classId);
      if (formValues.statusId) payload.statusId = Number(formValues.statusId);

      const action = modalMode === "add" ? "create" : "update";
      const body: Record<string, unknown> = { action, table: "classStudents", data: payload };
      if (action === "update") {
        const id = editingRow?.id;
        if (!id) throw new Error("Missing enrollment id.");
        body.where = { id };
      }

      const res = await fetch("/api/crud", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const result = await res.json();
      if (!res.ok || !result.success) throw new Error(result?.error || "Save failed.");

      setIsModalOpen(false);
      setRefreshKey((k) => k + 1);
    } catch (error) {
      setFormError(error instanceof Error ? error.message : "Failed to save.");
    }
  }, [formValues, modalMode, editingRow]);

  const enrolledStudentIds = useMemo(
    () => new Set(rows.map((r) => Number(r.studentId))),
    [rows],
  );

  return (
    <div className="min-h-screen p-6 bg-slate-50 text-slate-900">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <div className="flex items-center gap-4 border-b border-slate-200">
            <Link href="/education" className="px-4 py-3 text-sm font-medium text-slate-500 hover:text-slate-900 transition">Students</Link>
            <Link href="/education/teachers" className="px-4 py-3 text-sm font-medium text-slate-500 hover:text-slate-900 transition">Teachers</Link>
            <Link href="/education/classes" className="px-4 py-3 text-sm font-medium text-slate-500 hover:text-slate-900 transition">Classes</Link>
            <Link href="/education/enrollments" className="px-4 py-3 text-sm font-medium text-slate-900 border-b-2 border-slate-900">Enrollments</Link>
            <Link href="/education/schedules" className="px-4 py-3 text-sm font-medium text-slate-500 hover:text-slate-900 transition">Schedules</Link>
          </div>
        </div>

        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold">Enrollments</h2>
            <p className="text-sm text-slate-500">Manage student enrollments in classes.</p>
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
          handleRefreshAction={() => setRefreshKey((k) => k + 1)}
          isLoading={isLoading}
          fetchError={fetchError}
        />
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 px-4 py-8">
          <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl ring-1 ring-slate-200">
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
              <h3 className="text-xl font-semibold">
                {modalMode === "add" ? "Add Enrollment" : modalMode === "edit" ? "Edit Enrollment" : "Enrollment Details"}
              </h3>
              <button type="button" onClick={() => setIsModalOpen(false)} className="rounded-full border border-slate-200 px-3 py-2 text-slate-600 hover:bg-slate-50">Close</button>
            </div>
            <div className="px-6 py-5 space-y-4">
              {formError && (
                <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700 ring-1 ring-red-200">{formError}</div>
              )}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700">Student *</label>
                <select value={formValues.studentId ?? ""} disabled={modalMode === "view"} onChange={(e) => setFormValues((p) => ({ ...p, studentId: e.target.value }))} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-slate-900 outline-none transition focus:border-slate-600 focus:ring-2 focus:ring-slate-200">
                  <option value="">Select student</option>
                  {students
                    .filter((s) => modalMode === "edit" || !enrolledStudentIds.has(s.id))
                    .map((s) => (
                      <option key={s.id} value={s.id}>{s.label}</option>
                    ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700">Class *</label>
                <select value={formValues.classId ?? ""} disabled={modalMode === "view"} onChange={(e) => setFormValues((p) => ({ ...p, classId: e.target.value }))} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-slate-900 outline-none transition focus:border-slate-600 focus:ring-2 focus:ring-slate-200">
                  <option value="">Select class</option>
                  {classOpts.map((c) => (
                    <option key={c.id} value={c.id}>{c.label}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700">Status *</label>
                <select value={formValues.statusId ?? ""} disabled={modalMode === "view"} onChange={(e) => setFormValues((p) => ({ ...p, statusId: e.target.value }))} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-slate-900 outline-none transition focus:border-slate-600 focus:ring-2 focus:ring-slate-200">
                  <option value="">Select status</option>
                  {statuses.map((s) => (
                    <option key={s.id} value={s.id}>{s.label}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 border-t border-slate-200 bg-slate-50 px-6 py-4">
              <button type="button" onClick={() => setIsModalOpen(false)} className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-slate-700 transition hover:bg-slate-100">Close</button>
              {modalMode !== "view" && (
                <button type="button" onClick={handleSubmit} className="rounded-lg bg-slate-900 px-4 py-2 text-white transition hover:bg-slate-700">Save</button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
