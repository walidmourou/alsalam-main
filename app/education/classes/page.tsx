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
type EnrolledStudent = {
  id: number;
  studentId: number;
  studentFirstName: string;
  studentLastName: string;
  statusId: number;
  statusLabel: string;
};
type ScheduleEntry = {
  id: number;
  courseId: number;
  courseLabel: string;
  roomId: number;
  roomLabel: string;
  teacherId: number;
  teacherFirstName: string;
  teacherLastName: string;
  weekDayId: number;
  weekDay: string;
  courseStart: string;
  courseEnd: string;
};

const classColumns: TableColumn[] = [
  {
    id: "id",
    label: "ID",
    type: ColumnType.integer,
    align: CellTextAlign.left,
    isKey: true,
    invisible: true,
  },
  {
    id: "educationYearId",
    label: "Year ID",
    type: ColumnType.integer,
    invisible: true,
  },
  {
    id: "educationYearLabel",
    label: "Year",
    type: ColumnType.string,
    canSearch: true,
    canFilter: true,
  },
  {
    id: "educationLevelId",
    label: "Level ID",
    type: ColumnType.integer,
    invisible: true,
  },
  {
    id: "educationLevelLabel",
    label: "Level",
    type: ColumnType.string,
    canSearch: true,
    canFilter: true,
  },
  {
    id: "label",
    label: "Label",
    type: ColumnType.string,
    canSearch: true,
  },
  {
    id: "maxStudents",
    label: "Max Students",
    type: ColumnType.integer,
  },
  {
    id: "studentCount",
    label: "Enrolled",
    type: ColumnType.integer,
  },
];

function flattenClass(row: Dictionary<unknown>) {
  const students = (row.students as EnrolledStudent[]) ?? [];
  return {
    ...row,
    studentCount: students.length,
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

export default function ClassesPage() {
  const [rows, setRows] = useState<Dictionary<unknown>[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const [isClassModalOpen, setIsClassModalOpen] = useState(false);
  const [classModalMode, setClassModalMode] = useState<"add" | "edit" | "view">("add");
  const [editingClass, setEditingClass] = useState<Dictionary<unknown> | null>(null);
  const [classFormValues, setClassFormValues] = useState<Record<string, string>>({});
  const [classFormError, setClassFormError] = useState<string | null>(null);

  const [educationYears, setEducationYears] = useState<LookupOption[]>([]);
  const [educationLevels, setEducationLevels] = useState<LookupOption[]>([]);

  const [selectedClass, setSelectedClass] = useState<Dictionary<unknown> | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [detailTab, setDetailTab] = useState<"students" | "schedule">("students");

  const [enrolledStudents, setEnrolledStudents] = useState<EnrolledStudent[]>([]);
  const [schedules, setSchedules] = useState<ScheduleEntry[]>([]);

  const [allStudents, setAllStudents] = useState<LookupOption[]>([]);
  const [enrollmentStatuses, setEnrollmentStatuses] = useState<LookupOption[]>([]);

  const [newStudentId, setNewStudentId] = useState("");
  const [newStudentStatusId, setNewStudentStatusId] = useState("");

  const [studentError, setStudentError] = useState<string | null>(null);
  const [savingStudent, setSavingStudent] = useState(false);

  const [courses, setCourses] = useState<LookupOption[]>([]);
  const [rooms, setRooms] = useState<LookupOption[]>([]);
  const [teacherOptions, setTeacherOptions] = useState<LookupOption[]>([]);

  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [scheduleMode, setScheduleMode] = useState<"add" | "edit">("add");
  const [editingSchedule, setEditingSchedule] = useState<ScheduleEntry | null>(null);
  const [scheduleFormValues, setScheduleFormValues] = useState<Record<string, string>>({});
  const [scheduleFormError, setScheduleFormError] = useState<string | null>(null);

  const weekDays = [
    { id: 1, label: "Montag" },
    { id: 2, label: "Dienstag" },
    { id: 3, label: "Mittwoch" },
    { id: 4, label: "Donnerstag" },
    { id: 5, label: "Freitag" },
    { id: 6, label: "Samstag" },
    { id: 7, label: "Sonntag" },
  ];

  useEffect(() => {
    let cancelled = false;
    const fetchRows = async () => {
      setIsLoading(true);
      setFetchError(null);
      try {
        const response = await fetch("/api/classes", { cache: "no-store" });
        const result = await response.json();
        if (!response.ok) throw new Error(result?.error || "Unable to load classes.");
        if (!cancelled) {
          setRows((Array.isArray(result.rows) ? result.rows : []).map(flattenClass));
        }
      } catch (error) {
        if (!cancelled) {
          setFetchError(error instanceof Error ? error.message : "Unable to load classes.");
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
        const [yearRes, levelRes, studentRes, statusRes, courseRes, roomRes, teacherRes] =
          await Promise.all([
            fetch("/api/crud?table=educationYears", { cache: "no-store" }),
            fetch("/api/crud?table=educationLevels", { cache: "no-store" }),
            fetch("/api/crud?table=students", { cache: "no-store" }),
            fetch("/api/crud?table=enrollmentStatuses", { cache: "no-store" }),
            fetch("/api/crud?table=educationalCourses", { cache: "no-store" }),
            fetch("/api/crud?table=classRooms", { cache: "no-store" }),
            fetch("/api/teachers", { cache: "no-store" }),
          ]);
        const yearData = await yearRes.json();
        const levelData = await levelRes.json();
        const studentData = await studentRes.json();
        const statusData = await statusRes.json();
        const courseData = await courseRes.json();
        const roomData = await roomRes.json();
        const teacherData = await teacherRes.json();

        if (Array.isArray(yearData.rows)) setEducationYears(yearData.rows);
        if (Array.isArray(levelData.rows)) setEducationLevels(levelData.rows);
        if (Array.isArray(studentData.rows))
          setAllStudents(
            studentData.rows.map((s: Dictionary<unknown>) => ({
              id: s.id as number,
              label: `${s.firstName ?? ""} ${s.lastName ?? ""}`.trim() || `Student #${s.id}`,
            })),
          );
        if (Array.isArray(statusData.rows)) setEnrollmentStatuses(statusData.rows);
        if (Array.isArray(courseData.rows)) setCourses(courseData.rows);
        if (Array.isArray(roomData.rows)) setRooms(roomData.rows);
        if (Array.isArray(teacherData.rows))
          setTeacherOptions(
            teacherData.rows.map((t: Dictionary<unknown>) => ({
              id: t.id as number,
              label:
                `${t.userFirstName ?? ""} ${t.userLastName ?? ""}`.trim() ||
                `Teacher #${t.id}`,
            })),
          );
      } catch {
        // non-critical
      }
    }
    void fetchLookups();
  }, []);

  const refresh = useCallback(() => setRefreshKey((k) => k + 1), []);

  const handleAddClass = useCallback(async () => {
    setClassModalMode("add");
    setEditingClass(null);
    setClassFormValues({});
    setClassFormError(null);
    setIsClassModalOpen(true);
  }, []);

  const handleEditClass = useCallback(
    async (row: Dictionary<unknown>) => {
      setClassModalMode("edit");
      setEditingClass(row);
      setClassFormValues({
        educationYearId: String(row.educationYearId ?? ""),
        educationLevelId: String(row.educationLevelId ?? ""),
        label: String(row.label ?? ""),
        maxStudents: String(row.maxStudents ?? ""),
      });
      setClassFormError(null);
      setIsClassModalOpen(true);
    },
    [],
  );

  const handleViewClass = useCallback(
    async (row: Dictionary<unknown>) => {
      setClassModalMode("view");
      setEditingClass(row);
      setClassFormValues({
        educationYearId: String(row.educationYearId ?? ""),
        educationLevelId: String(row.educationLevelId ?? ""),
        label: String(row.label ?? ""),
        maxStudents: String(row.maxStudents ?? ""),
      });
      setClassFormError(null);
      setIsClassModalOpen(true);
    },
    [],
  );

  const handleDeleteClass = useCallback(
    async (row: Dictionary<unknown>) => {
      const id = row.id;
      if (!id) return;
      if (!window.confirm(`Delete class #${id}?`)) return;
      try {
        const res = await fetch("/api/crud", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "delete", table: "classes", where: { id } }),
        });
        const result = await res.json();
        if (!res.ok || !result.success) throw new Error(result?.error || "Delete failed.");
        refresh();
      } catch (error) {
        window.alert(error instanceof Error ? error.message : "Unable to delete.");
      }
    },
    [refresh],
  );

  const handleClassModalSubmit = useCallback(async () => {
    try {
      const payload: Record<string, unknown> = {};
      if (classFormValues.educationYearId) payload.educationYearId = Number(classFormValues.educationYearId);
      if (classFormValues.educationLevelId) payload.educationLevelId = Number(classFormValues.educationLevelId);
      if (classFormValues.maxStudents) payload.maxStudents = Number(classFormValues.maxStudents);
      if (classFormValues.label) payload.label = classFormValues.label;

      const action = classModalMode === "add" ? "create" : "update";
      const body: Record<string, unknown> = { action, data: payload };
      if (action === "update") {
        const id = editingClass?.id;
        if (!id) throw new Error("Missing class id.");
        body.where = { id };
      }

      const res = await fetch("/api/crud", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...body, table: "classes" }),
      });
      const result = await res.json();
      if (!res.ok || !result.success) throw new Error(result?.error || "Save failed.");

      setIsClassModalOpen(false);
      refresh();
    } catch (error) {
      setClassFormError(error instanceof Error ? error.message : "Unable to save.");
    }
  }, [classFormValues, classModalMode, editingClass, refresh]);

  const handleManage = useCallback(
    async (row: Dictionary<unknown>) => {
      setSelectedClass(row);
      setEnrolledStudents((row.students as EnrolledStudent[]) ?? []);
      setSchedules((row.schedules as ScheduleEntry[]) ?? []);
      setDetailTab("students");
      setStudentError(null);
      setNewStudentId("");
      setNewStudentStatusId("");
      setIsDetailOpen(true);
    },
    [],
  );

  const classFormFields = useMemo(
    () => [
      { id: "educationYearId", label: "Education Year", mandatory: true },
      { id: "educationLevelId", label: "Education Level", mandatory: true },
      { id: "label", label: "Label", mandatory: false },
      { id: "maxStudents", label: "Max Students", mandatory: false },
    ],
    [],
  );

  const downloading = useRef(false);
  const handleDownload = useCallback(async () => {
    if (downloading.current) return;
    downloading.current = true;
    try {
      const res = await fetch("/api/classes", { cache: "no-store" });
      const result = await res.json();
      if (!res.ok || !Array.isArray(result.rows)) return;
      const data = result.rows.map((r: Record<string, unknown>) => ({
        ID: r.id ?? "",
        Year: r.educationYearLabel ?? "",
        Level: r.educationLevelLabel ?? "",
        "Max Students": r.maxStudents ?? "",
        Enrolled: ((r.students as EnrolledStudent[]) ?? []).length,
      }));
      const ws = XLSX.utils.json_to_sheet(data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Classes");
      XLSX.writeFile(wb, "classes.xlsx");
    } finally {
      downloading.current = false;
    }
  }, []);

  const handleAddStudent = useCallback(async () => {
    const classId = selectedClass?.id;
    if (!classId) return;
    if (!newStudentId) { setStudentError("Select a student."); return; }
    if (!newStudentStatusId) { setStudentError("Select a status."); return; }

    setSavingStudent(true);
    setStudentError(null);
    try {
      const res = await fetch("/api/classes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "create",
          table: "classStudents",
          data: {
            studentId: Number(newStudentId),
            classId: Number(classId),
            statusId: Number(newStudentStatusId),
          },
        }),
      });
      const result = await res.json();
      if (!res.ok || !result.success) throw new Error(result?.error || "Failed to add student.");

      const selectedStudent = allStudents.find((s) => s.id === Number(newStudentId));
      const selectedStatus = enrollmentStatuses.find((s) => s.id === Number(newStudentStatusId));
      const newEntry: EnrolledStudent = {
        id: result.result.insertId,
        studentId: Number(newStudentId),
        studentFirstName: selectedStudent?.label.split(" ")[0] ?? "",
        studentLastName: selectedStudent?.label.split(" ").slice(1).join(" ") ?? "",
        statusId: Number(newStudentStatusId),
        statusLabel: selectedStatus?.label ?? "",
      };
      setEnrolledStudents((prev) => [...prev, newEntry]);
      setNewStudentId("");
      setNewStudentStatusId("");
    } catch (error) {
      setStudentError(error instanceof Error ? error.message : "Failed to add student.");
    } finally {
      setSavingStudent(false);
    }
  }, [selectedClass, newStudentId, newStudentStatusId, allStudents, enrollmentStatuses]);

  const handleRemoveStudent = useCallback(
    async (entryId: number) => {
      if (!window.confirm("Remove this student from the class?")) return;
      try {
        const res = await fetch("/api/classes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "delete", table: "classStudents", where: { id: entryId } }),
        });
        const result = await res.json();
        if (!res.ok || !result.success) throw new Error(result?.error || "Failed to remove.");
        setEnrolledStudents((prev) => prev.filter((s) => s.id !== entryId));
      } catch (error) {
        window.alert(error instanceof Error ? error.message : "Unable to remove.");
      }
    },
    [],
  );

  const openScheduleModal = useCallback(
    (mode: "add" | "edit", entry?: ScheduleEntry) => {
      setScheduleMode(mode);
      if (mode === "edit" && entry) {
        setEditingSchedule(entry);
        setScheduleFormValues({
          courseId: String(entry.courseId),
          roomId: String(entry.roomId),
          teacherId: String(entry.teacherId),
          weekDay: entry.weekDay,
          courseStart: entry.courseStart,
          courseEnd: entry.courseEnd,
        });
      } else {
        setEditingSchedule(null);
        setScheduleFormValues({});
      }
      setScheduleFormError(null);
      setIsScheduleModalOpen(true);
    },
    [],
  );

  const handleScheduleSubmit = useCallback(async () => {
    const classId = selectedClass?.id;
    if (!classId) return;

    const weekDayEntry = weekDays.find((d) => d.label === scheduleFormValues.weekDay);
    if (!scheduleFormValues.courseId || !scheduleFormValues.roomId || !scheduleFormValues.teacherId || !weekDayEntry || !scheduleFormValues.courseStart || !scheduleFormValues.courseEnd) {
      setScheduleFormError("All fields are required.");
      return;
    }

    try {
      const payload = {
        classId: Number(classId),
        courseId: Number(scheduleFormValues.courseId),
        roomId: Number(scheduleFormValues.roomId),
        teacherId: Number(scheduleFormValues.teacherId),
        weekDayId: weekDayEntry.id,
        weekDay: scheduleFormValues.weekDay,
        courseStart: scheduleFormValues.courseStart,
        courseEnd: scheduleFormValues.courseEnd,
      };

      if (scheduleMode === "add") {
        const res = await fetch("/api/classes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "create", table: "classCourseRooms", data: payload }),
        });
        const result = await res.json();
        if (!res.ok || !result.success) throw new Error(result?.error || "Failed to add.");
        const selectedCourse = courses.find((c) => c.id === Number(scheduleFormValues.courseId));
        const selectedRoom = rooms.find((r) => r.id === Number(scheduleFormValues.roomId));
        const selectedTeacher = teacherOptions.find((t) => t.id === Number(scheduleFormValues.teacherId));
        const newEntry: ScheduleEntry = {
          id: result.result.insertId,
          courseId: payload.courseId,
          courseLabel: selectedCourse?.label ?? "",
          roomId: payload.roomId,
          roomLabel: selectedRoom?.label ?? "",
          teacherId: payload.teacherId,
          teacherFirstName: selectedTeacher?.label.split(" ")[0] ?? "",
          teacherLastName: selectedTeacher?.label.split(" ").slice(1).join(" ") ?? "",
          weekDayId: payload.weekDayId,
          weekDay: payload.weekDay,
          courseStart: payload.courseStart,
          courseEnd: payload.courseEnd,
        };
        setSchedules((prev) => [...prev, newEntry]);
      } else {
        const entryId = editingSchedule?.id;
        if (!entryId) throw new Error("Missing schedule id.");
        await fetch("/api/classes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "update", table: "classCourseRooms", data: payload, where: { id: entryId } }),
        });
        setSchedules((prev) =>
          prev.map((s) =>
            s.id === entryId ? { ...s, courseId: payload.courseId, roomId: payload.roomId, teacherId: payload.teacherId, weekDayId: payload.weekDayId, weekDay: payload.weekDay, courseStart: payload.courseStart, courseEnd: payload.courseEnd } : s,
          ),
        );
      }

      setIsScheduleModalOpen(false);
    } catch (error) {
      setScheduleFormError(error instanceof Error ? error.message : "Failed to save.");
    }
  }, [selectedClass, scheduleFormValues, scheduleMode, editingSchedule, courses, rooms, teacherOptions, weekDays]);

  const handleRemoveSchedule = useCallback(
    async (entryId: number) => {
      if (!window.confirm("Remove this schedule entry?")) return;
      try {
        const res = await fetch("/api/classes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "delete", table: "classCourseRooms", where: { id: entryId } }),
        });
        const result = await res.json();
        if (!res.ok || !result.success) throw new Error(result?.error || "Failed to remove.");
        setSchedules((prev) => prev.filter((s) => s.id !== entryId));
      } catch (error) {
        window.alert(error instanceof Error ? error.message : "Unable to remove.");
      }
    },
    [],
  );

  return (
    <div className="min-h-screen p-6 bg-slate-50 text-slate-900">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <div className="flex items-center gap-4 border-b border-slate-200">
            <Link href="/education" className="px-4 py-3 text-sm font-medium text-slate-500 hover:text-slate-900 transition">Students</Link>
            <Link href="/education/teachers" className="px-4 py-3 text-sm font-medium text-slate-500 hover:text-slate-900 transition">Teachers</Link>
            <Link href="/education/classes" className="px-4 py-3 text-sm font-medium text-slate-900 border-b-2 border-slate-900">Classes</Link>
            <Link href="/education/enrollments" className="px-4 py-3 text-sm font-medium text-slate-500 hover:text-slate-900 transition">Enrollments</Link>
            <Link href="/education/schedules" className="px-4 py-3 text-sm font-medium text-slate-500 hover:text-slate-900 transition">Schedules</Link>
          </div>
        </div>

        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold">Classes</h2>
            <p className="text-sm text-slate-500">Manage classes, enroll students, and schedule courses.</p>
          </div>
          <div className="flex items-center gap-2">
            <button type="button" onClick={handleDownload} className="rounded-lg border border-slate-300 bg-white text-slate-700 px-4 py-2 transition hover:bg-slate-100">Download XLSX</button>
          </div>
        </div>

        <DeepTable
          columnNames={classColumns}
          initialRowsValues={rows}
          displayPagination={true}
          displayAddButton={true}
          displayEditAction={true}
          displayDeleteAction={false}
          displayViewAction={true}
          handleAddAction={handleAddClass}
          handleEditAction={handleEditClass}
          handleViewAction={handleViewClass}
          handleDeleteAction={handleDeleteClass}
          handleRefreshAction={refresh}
          isLoading={isLoading}
          fetchError={fetchError}
        />

        <div className="mt-4 flex justify-end">
          {rows.length > 0 && (
            <p className="text-xs text-slate-400">
              Click <strong>View</strong> on a class row to manage students and schedules.
            </p>
          )}
        </div>

        {isClassModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 px-4 py-8">
            <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl ring-1 ring-slate-200">
              <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
                <div>
                  <h3 className="text-xl font-semibold">{classModalMode === "add" ? "Add Class" : classModalMode === "edit" ? "Edit Class" : "View Class"}</h3>
                  <p className="text-sm text-slate-500">{classModalMode === "add" ? "Create a new class." : "Class details."}</p>
                </div>
                <button type="button" onClick={() => setIsClassModalOpen(false)} className="rounded-full border border-slate-200 px-3 py-2 text-slate-600 hover:bg-slate-50">Close</button>
              </div>
              <div className="px-6 py-5 space-y-4">
                {classFormError && (<div className="rounded-lg bg-red-50 p-3 text-sm text-red-700 ring-1 ring-red-200">{classFormError}</div>)}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-700">Education Year *</label>
                  <select value={classFormValues.educationYearId ?? ""} disabled={classModalMode === "view"} onChange={(e) => setClassFormValues((p) => ({ ...p, educationYearId: e.target.value }))} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-slate-900 outline-none transition focus:border-slate-600 focus:ring-2 focus:ring-slate-200">
                    <option value="">Select year</option>
                    {educationYears.map((y) => (<option key={y.id} value={y.id}>{y.label}</option>))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-700">Education Level *</label>
                  <select value={classFormValues.educationLevelId ?? ""} disabled={classModalMode === "view"} onChange={(e) => setClassFormValues((p) => ({ ...p, educationLevelId: e.target.value }))} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-slate-900 outline-none transition focus:border-slate-600 focus:ring-2 focus:ring-slate-200">
                    <option value="">Select level</option>
                    {educationLevels.map((l) => (<option key={l.id} value={l.id}>{l.label}</option>))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-700">Label</label>
                  <input type="text" value={classFormValues.label ?? ""} readOnly={classModalMode === "view"} disabled={classModalMode === "view"} onChange={(e) => setClassFormValues((p) => ({ ...p, label: e.target.value }))} placeholder="e.g. Group A" className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-slate-900 outline-none transition focus:border-slate-600 focus:ring-2 focus:ring-slate-200" />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-700">Max Students</label>
                  <input type="number" value={classFormValues.maxStudents ?? ""} readOnly={classModalMode === "view"} disabled={classModalMode === "view"} onChange={(e) => setClassFormValues((p) => ({ ...p, maxStudents: e.target.value }))} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-slate-900 outline-none transition focus:border-slate-600 focus:ring-2 focus:ring-slate-200" />
                </div>
              </div>
              <div className="flex items-center justify-end gap-3 border-t border-slate-200 bg-slate-50 px-6 py-4">
                <button type="button" onClick={() => setIsClassModalOpen(false)} className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-slate-700 transition hover:bg-slate-100">Close</button>
                {classModalMode !== "view" && (<button type="button" onClick={handleClassModalSubmit} className="rounded-lg bg-slate-900 px-4 py-2 text-white transition hover:bg-slate-700">Save</button>)}
              </div>
            </div>
          </div>
        )}

        {isDetailOpen && selectedClass && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 px-4 py-8">
            <div className="w-full max-w-4xl rounded-2xl bg-white shadow-2xl ring-1 ring-slate-200 max-h-[90vh] flex flex-col">
              <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 shrink-0">
                <div>
                  <h3 className="text-xl font-semibold">
                    {String(selectedClass.educationYearLabel ?? "")} &mdash; {String(selectedClass.educationLevelLabel ?? "")}
                  </h3>
                  <p className="text-sm text-slate-500">Manage students and schedule for this class.</p>
                </div>
                <button type="button" onClick={() => setIsDetailOpen(false)} className="rounded-full border border-slate-200 px-3 py-2 text-slate-600 hover:bg-slate-50">Close</button>
              </div>

              <div className="px-6 pt-4 shrink-0">
                <div className="flex items-center gap-4 border-b border-slate-200">
                  <button onClick={() => setDetailTab("students")} className={`px-4 py-2 text-sm font-medium transition ${detailTab === "students" ? "text-slate-900 border-b-2 border-slate-900" : "text-slate-500 hover:text-slate-900"}`}>Students ({enrolledStudents.length})</button>
                  <button onClick={() => setDetailTab("schedule")} className={`px-4 py-2 text-sm font-medium transition ${detailTab === "schedule" ? "text-slate-900 border-b-2 border-slate-900" : "text-slate-500 hover:text-slate-900"}`}>Schedule ({schedules.length})</button>
                </div>
              </div>

              <div className="px-6 py-5 overflow-y-auto flex-1">
                {detailTab === "students" && (
                  <div>
                    {studentError && (<div className="rounded-lg bg-red-50 p-3 text-sm text-red-700 ring-1 ring-red-200 mb-4">{studentError}</div>)}

                    {enrolledStudents.length === 0 ? (
                      <p className="text-sm text-slate-500 mb-4">No students enrolled.</p>
                    ) : (
                      <div className="space-y-2 mb-4">
                        {enrolledStudents.map((s) => (
                          <div key={s.id} className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-4 py-2">
                            <div className="text-sm">
                              <span className="font-medium">{s.studentFirstName} {s.studentLastName}</span>
                              <span className="text-slate-500 mx-2">&mdash; {s.statusLabel}</span>
                            </div>
                            <button type="button" onClick={() => handleRemoveStudent(s.id)} className="text-sm text-red-600 hover:text-red-800 transition">Remove</button>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                      <h5 className="text-sm font-semibold text-slate-700 mb-3">Enroll Student</h5>
                      <div className="grid grid-cols-4 gap-3">
                        <div className="space-y-1">
                          <label className="block text-xs font-medium text-slate-600">Student</label>
                          <select value={newStudentId} onChange={(e) => setNewStudentId(e.target.value)} className="w-full rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-sm text-slate-900">
                            <option value="">Select...</option>
                            {allStudents.filter((s) => !enrolledStudents.some((es) => es.studentId === s.id)).map((s) => (
                              <option key={s.id} value={s.id}>{s.label}</option>
                            ))}
                          </select>
                        </div>
                        <div className="space-y-1">
                          <label className="block text-xs font-medium text-slate-600">Status</label>
                          <select value={newStudentStatusId} onChange={(e) => setNewStudentStatusId(e.target.value)} className="w-full rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-sm text-slate-900">
                            <option value="">Select...</option>
                            {enrollmentStatuses.map((s) => (<option key={s.id} value={s.id}>{s.label}</option>))}
                          </select>
                        </div>
                        <div className="flex items-end">
                          <button type="button" onClick={handleAddStudent} disabled={savingStudent} className="rounded-lg bg-slate-800 px-4 py-1.5 text-sm text-white transition hover:bg-slate-700 disabled:opacity-50">{savingStudent ? "..." : "Add"}</button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {detailTab === "schedule" && (
                  <div>
                    {schedules.length === 0 ? (
                      <p className="text-sm text-slate-500 mb-4">No schedule entries.</p>
                    ) : (
                      <div className="space-y-2 mb-4">
                        {schedules.map((s) => (
                          <div key={s.id} className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-4 py-2">
                            <div className="text-sm">
                              <span className="font-medium">{s.courseLabel}</span>
                              <span className="text-slate-500 mx-2">&mdash;</span>
                              <span>{s.roomLabel}</span>
                              <span className="text-slate-500 mx-2">|</span>
                              <span>{s.teacherFirstName} {s.teacherLastName}</span>
                              <span className="text-slate-500 mx-2">|</span>
                              <span>{s.weekDay}</span>
                              <span className="text-slate-500 mx-2">{s.courseStart?.slice(0, 5)}-{s.courseEnd?.slice(0, 5)}</span>
                            </div>
                            <div className="flex gap-2">
                              <button type="button" onClick={() => openScheduleModal("edit", s)} className="text-sm text-blue-600 hover:text-blue-800 transition">Edit</button>
                              <button type="button" onClick={() => handleRemoveSchedule(s.id)} className="text-sm text-red-600 hover:text-red-800 transition">Remove</button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    <button type="button" onClick={() => openScheduleModal("add")} className="rounded-lg bg-slate-800 px-4 py-2 text-sm text-white transition hover:bg-slate-700">Add Schedule Entry</button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {isScheduleModalOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/50 px-4 py-8">
            <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl ring-1 ring-slate-200">
              <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
                <div>
                  <h3 className="text-xl font-semibold">{scheduleMode === "add" ? "Add Schedule Entry" : "Edit Schedule Entry"}</h3>
                </div>
                <button type="button" onClick={() => setIsScheduleModalOpen(false)} className="rounded-full border border-slate-200 px-3 py-2 text-slate-600 hover:bg-slate-50">Close</button>
              </div>
              <div className="px-6 py-5 space-y-4">
                {scheduleFormError && (<div className="rounded-lg bg-red-50 p-3 text-sm text-red-700 ring-1 ring-red-200">{scheduleFormError}</div>)}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-slate-700">Course *</label>
                    <select value={scheduleFormValues.courseId ?? ""} onChange={(e) => setScheduleFormValues((p) => ({ ...p, courseId: e.target.value }))} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-slate-900 outline-none">
                      <option value="">Select</option>
                      {courses.map((c) => (<option key={c.id} value={c.id}>{c.label}</option>))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-slate-700">Room *</label>
                    <select value={scheduleFormValues.roomId ?? ""} onChange={(e) => setScheduleFormValues((p) => ({ ...p, roomId: e.target.value }))} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-slate-900 outline-none">
                      <option value="">Select</option>
                      {rooms.map((r) => (<option key={r.id} value={r.id}>{r.label}</option>))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-slate-700">Teacher *</label>
                    <select value={scheduleFormValues.teacherId ?? ""} onChange={(e) => setScheduleFormValues((p) => ({ ...p, teacherId: e.target.value }))} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-slate-900 outline-none">
                      <option value="">Select</option>
                      {teacherOptions.map((t) => (<option key={t.id} value={t.id}>{t.label}</option>))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-slate-700">Week Day *</label>
                    <select value={scheduleFormValues.weekDay ?? ""} onChange={(e) => setScheduleFormValues((p) => ({ ...p, weekDay: e.target.value }))} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-slate-900 outline-none">
                      <option value="">Select</option>
                      {weekDays.map((d) => (<option key={d.id} value={d.label}>{d.label}</option>))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-slate-700">Start Time *</label>
                    <input type="time" value={scheduleFormValues.courseStart ?? ""} onChange={(e) => setScheduleFormValues((p) => ({ ...p, courseStart: e.target.value }))} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-slate-900 outline-none" />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-slate-700">End Time *</label>
                    <input type="time" value={scheduleFormValues.courseEnd ?? ""} onChange={(e) => setScheduleFormValues((p) => ({ ...p, courseEnd: e.target.value }))} className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-slate-900 outline-none" />
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-end gap-3 border-t border-slate-200 bg-slate-50 px-6 py-4">
                <button type="button" onClick={() => setIsScheduleModalOpen(false)} className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-slate-700 transition hover:bg-slate-100">Close</button>
                <button type="button" onClick={handleScheduleSubmit} className="rounded-lg bg-slate-900 px-4 py-2 text-white transition hover:bg-slate-700">Save</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
