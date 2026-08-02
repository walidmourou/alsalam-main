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

const weekDays = [
  { id: 1, label: "Montag" },
  { id: 2, label: "Dienstag" },
  { id: 3, label: "Mittwoch" },
  { id: 4, label: "Donnerstag" },
  { id: 5, label: "Freitag" },
  { id: 6, label: "Samstag" },
  { id: 7, label: "Sonntag" },
];

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
  },
  {
    id: "educationLevelLabel",
    label: "Level",
    type: ColumnType.string,
  },
  {
    id: "classLabel",
    label: "Class",
    type: ColumnType.string,
  },
  {
    id: "courseId",
    label: "Course ID",
    type: ColumnType.integer,
    invisible: true,
    isMandatory: true,
  },
  {
    id: "courseLabel",
    label: "Course",
    type: ColumnType.string,
    align: CellTextAlign.left,
    canSearch: true,
  },
  {
    id: "roomId",
    label: "Room ID",
    type: ColumnType.integer,
    invisible: true,
    isMandatory: true,
  },
  {
    id: "roomLabel",
    label: "Room",
    type: ColumnType.string,
    align: CellTextAlign.left,
  },
  {
    id: "teacherId",
    label: "Teacher ID",
    type: ColumnType.integer,
    invisible: true,
    isMandatory: true,
  },
  {
    id: "teacherFirstName",
    label: "Teacher",
    type: ColumnType.string,
    align: CellTextAlign.left,
    canSearch: true,
  },
  {
    id: "weekDayId",
    label: "Week Day ID",
    type: ColumnType.integer,
    invisible: true,
    isMandatory: true,
  },
  {
    id: "weekDay",
    label: "Week Day",
    type: ColumnType.string,
    align: CellTextAlign.left,
    canFilter: true,
  },
  {
    id: "courseStart",
    label: "Start",
    type: ColumnType.string,
    align: CellTextAlign.left,
  },
  {
    id: "courseEnd",
    label: "End",
    type: ColumnType.string,
    align: CellTextAlign.left,
  },
];

function flattenRow(row: Dictionary<unknown>) {
  return {
    ...row,
    teacherName: `${row.teacherFirstName ?? ""} ${row.teacherLastName ?? ""}`.trim(),
    className: [row.educationYearLabel, row.educationLevelLabel, row.classLabel].filter(Boolean).join(" - "),
  };
}

export default function SchedulesPage() {
  const [rows, setRows] = useState<Dictionary<unknown>[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"add" | "edit" | "view">("add");
  const [editingRow, setEditingRow] = useState<Dictionary<unknown> | null>(null);
  const [formValues, setFormValues] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);

  const [classOpts, setClassOpts] = useState<LookupOption[]>([]);
  const [courses, setCourses] = useState<LookupOption[]>([]);
  const [rooms, setRooms] = useState<LookupOption[]>([]);
  const [teacherOpts, setTeacherOpts] = useState<LookupOption[]>([]);

  useEffect(() => {
    let cancelled = false;
    const fetchRows = async () => {
      setIsLoading(true);
      setFetchError(null);
      try {
        const response = await fetch("/api/education/schedules", { cache: "no-store" });
        const result = await response.json();
        if (!response.ok) throw new Error(result?.error || "Unable to load schedules.");
        if (!cancelled) {
          setRows((Array.isArray(result.rows) ? result.rows : []).map(flattenRow));
        }
      } catch (error) {
        if (!cancelled) {
          setFetchError(error instanceof Error ? error.message : "Unable to load schedules.");
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
        const [clsRes, courseRes, roomRes, teacherRes] = await Promise.all([
          fetch("/api/crud?table=classes", { cache: "no-store" }),
          fetch("/api/crud?table=educationalCourses", { cache: "no-store" }),
          fetch("/api/crud?table=classRooms", { cache: "no-store" }),
          fetch("/api/crud?table=teachers", { cache: "no-store" }),
        ]);
        const clsData = await clsRes.json();
        const courseData = await courseRes.json();
        const roomData = await roomRes.json();
        const teacherData = await teacherRes.json();
        if (Array.isArray(clsData.rows))
          setClassOpts(
            clsData.rows.map((c: Dictionary<unknown>) => ({
              id: c.id as number,
              label: [c.educationYearLabel, c.educationLevelLabel, c.label].filter(Boolean).join(" - ") || `Class #${c.id}`,
            })),
          );
        if (Array.isArray(courseData.rows))
          setCourses(
            courseData.rows.map((c: Dictionary<unknown>) => ({
              id: c.id as number,
              label: c.label as string,
            })),
          );
        if (Array.isArray(roomData.rows))
          setRooms(
            roomData.rows.map((r: Dictionary<unknown>) => ({
              id: r.id as number,
              label: r.label as string,
            })),
          );
        if (Array.isArray(teacherData.rows))
          setTeacherOpts(
            teacherData.rows.map((t: Dictionary<unknown>) => ({
              id: t.id as number,
              label: `${t.firstName ?? ""} ${t.lastName ?? ""}`.trim() || `Teacher #${t.id}`,
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
      classId: String(row.classId ?? ""),
      courseId: String(row.courseId ?? ""),
      roomId: String(row.roomId ?? ""),
      teacherId: String(row.teacherId ?? ""),
      weekDay: row.weekDay as string,
      courseStart: row.courseStart as string,
      courseEnd: row.courseEnd as string,
    });
    setFormError(null);
    setIsModalOpen(true);
  }, []);

  const handleView = useCallback(async (row: Dictionary<unknown>) => {
    setModalMode("view");
    setEditingRow(row);
    setFormValues({
      classId: String(row.classId ?? ""),
      courseId: String(row.courseId ?? ""),
      roomId: String(row.roomId ?? ""),
      teacherId: String(row.teacherId ?? ""),
      weekDay: row.weekDay as string,
      courseStart: row.courseStart as string,
      courseEnd: row.courseEnd as string,
    });
    setFormError(null);
    setIsModalOpen(true);
  }, []);

  const handleDelete = useCallback(async (row: Dictionary<unknown>) => {
    if (!window.confirm("Delete this schedule entry?")) return;
    try {
      const res = await fetch("/api/crud", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "delete", table: "classCourseRooms", where: { id: row.id } }),
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
      const weekDayEntry = weekDays.find((d) => d.label === formValues.weekDay);
      if (!weekDayEntry) throw new Error("Invalid week day.");

      const payload: Record<string, unknown> = {
        classId: Number(formValues.classId),
        courseId: Number(formValues.courseId),
        roomId: Number(formValues.roomId),
        teacherId: Number(formValues.teacherId),
        weekDayId: weekDayEntry.id,
        weekDay: formValues.weekDay,
        courseStart: formValues.courseStart,
        courseEnd: formValues.courseEnd,
      };

      const action = modalMode === "add" ? "create" : "update";
      const body: Record<string, unknown> = { action, table: "classCourseRooms", data: payload };
      if (action === "update") {
        const id = editingRow?.id;
        if (!id) throw new Error("Missing schedule id.");
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

  const scheduleClassIds = useMemo(
    () => new Set(rows.map((r) => Number(r.classId))),
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
            <Link href="/education/enrollments" className="px-4 py-3 text-sm font-medium text-slate-500 hover:text-slate-900 transition">Enrollments</Link>
            <Link href="/education/schedules" className="px-4 py-3 text-sm font-medium text-slate-900 border-b-2 border-slate-900">Schedules</Link>
          </div>
        </div>

        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold">Schedules</h2>
            <p className="text-sm text-slate-500">Manage course schedules for classes.</p>
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
          <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl ring-1 ring-slate-200">
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
              <h3 className="text-xl font-semibold">
                {modalMode === "add" ? "Add Schedule Entry" : modalMode === "edit" ? "Edit Schedule Entry" : "Schedule Details"}
              </h3>
              <button type="button" onClick={() => setIsModalOpen(false)} className="rounded-full border border-slate-200 px-3 py-2 text-slate-600 hover:bg-slate-50">Close</button>
            </div>
            <div className="px-6 py-5 space-y-4">
              {formError && (
                <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700 ring-1 ring-red-200">{formError}</div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-700">Class *</label>
                  <select value={formValues.classId ?? ""} disabled={modalMode === "view"} onChange={(e) => setFormValues((p) => ({ ...p, classId: e.target.value }))} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-slate-900 outline-none transition focus:border-slate-600 focus:ring-2 focus:ring-slate-200">
                    <option value="">Select</option>
                    {classOpts.map((c) => (<option key={c.id} value={c.id}>{c.label}</option>))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-700">Course *</label>
                  <select value={formValues.courseId ?? ""} disabled={modalMode === "view"} onChange={(e) => setFormValues((p) => ({ ...p, courseId: e.target.value }))} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-slate-900 outline-none transition focus:border-slate-600 focus:ring-2 focus:ring-slate-200">
                    <option value="">Select</option>
                    {courses.map((c) => (<option key={c.id} value={c.id}>{c.label}</option>))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-700">Room *</label>
                  <select value={formValues.roomId ?? ""} disabled={modalMode === "view"} onChange={(e) => setFormValues((p) => ({ ...p, roomId: e.target.value }))} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-slate-900 outline-none transition focus:border-slate-600 focus:ring-2 focus:ring-slate-200">
                    <option value="">Select</option>
                    {rooms.map((r) => (<option key={r.id} value={r.id}>{r.label}</option>))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-700">Teacher *</label>
                  <select value={formValues.teacherId ?? ""} disabled={modalMode === "view"} onChange={(e) => setFormValues((p) => ({ ...p, teacherId: e.target.value }))} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-slate-900 outline-none transition focus:border-slate-600 focus:ring-2 focus:ring-slate-200">
                    <option value="">Select</option>
                    {teacherOpts.map((t) => (<option key={t.id} value={t.id}>{t.label}</option>))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-700">Week Day *</label>
                  <select value={formValues.weekDay ?? ""} disabled={modalMode === "view"} onChange={(e) => setFormValues((p) => ({ ...p, weekDay: e.target.value }))} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-slate-900 outline-none transition focus:border-slate-600 focus:ring-2 focus:ring-slate-200">
                    <option value="">Select</option>
                    {weekDays.map((d) => (<option key={d.id} value={d.label}>{d.label}</option>))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-700">Start Time *</label>
                  <input type="time" value={formValues.courseStart ?? ""} disabled={modalMode === "view"} onChange={(e) => setFormValues((p) => ({ ...p, courseStart: e.target.value }))} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-slate-900 outline-none" />
                </div>
                <div className="col-span-2 space-y-2">
                  <label className="block text-sm font-medium text-slate-700">End Time *</label>
                  <input type="time" value={formValues.courseEnd ?? ""} disabled={modalMode === "view"} onChange={(e) => setFormValues((p) => ({ ...p, courseEnd: e.target.value }))} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-slate-900 outline-none" />
                </div>
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
