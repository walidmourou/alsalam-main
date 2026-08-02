"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ColumnType,
  Dictionary,
  TableColumn,
} from "@/components/deepTable/types";
import {
  TableKey,
  tableDefinitions,
} from "@/lib/settings/table-definitions";

export function useSettingsCrud() {
  const [activeTable, setActiveTable] = useState<TableKey>("classRooms");
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

  const columns = useMemo(
    () => tableDefinitions[activeTable].columns,
    [activeTable],
  );

  const tableLabel = useMemo(
    () => tableDefinitions[activeTable].label,
    [activeTable],
  );

  useEffect(() => {
    let cancelled = false;
    const fetchRows = async () => {
      setIsLoading(true);
      setFetchError(null);

      try {
        const response = await fetch(`/api/crud?table=${activeTable}`, {
          cache: "no-store",
        });
        const result = await response.json();

        if (!response.ok) {
          throw new Error(result?.error || "Unable to load table data.");
        }
        if (!cancelled) {
          setRows(Array.isArray(result.rows) ? result.rows : []);
        }
      } catch (error) {
        if (!cancelled) {
          setFetchError(
            error instanceof Error
              ? error.message
              : "Unable to load table data.",
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
  }, [activeTable, refreshKey]);

  const refresh = useCallback(
    () => setRefreshKey((current) => current + 1),
    [],
  );

  const getInitialFormValues = useCallback(
    (row?: Dictionary<unknown>) => {
      const values: Record<string, string> = {};
      columns.forEach((column) => {
        if (column.isKey) return;
        const existingValue = row?.[column.id];
        values[column.id] =
          existingValue === undefined || existingValue === null
            ? ""
            : String(existingValue);
      });
      return values;
    },
    [columns],
  );

  const openAddModal = useCallback(() => {
    setModalMode("add");
    setEditingRow(null);
    setFormValues(getInitialFormValues());
    setFormError(null);
    setIsModalOpen(true);
  }, [getInitialFormValues]);

  const openEditModal = useCallback(
    (row: Dictionary<unknown>) => {
      setModalMode("edit");
      setEditingRow(row);
      setFormValues(getInitialFormValues(row));
      setFormError(null);
      setIsModalOpen(true);
    },
    [getInitialFormValues],
  );

  const openViewModal = useCallback(
    (row: Dictionary<unknown>) => {
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

  const handleFormChange = useCallback(
    (field: string, value: string) => {
      setFormValues((current) => ({ ...current, [field]: value }));
    },
    [],
  );

  const buildPayload = useCallback(() => {
    const payload: Record<string, unknown> = {};

    for (const column of columns) {
      if (column.isKey) continue;
      const rawValue = (formValues[column.id] ?? "").trim();
      if (rawValue === "") {
        if (column.isMandatory) {
          throw new Error(`${column.label} is required.`);
        }
        continue;
      }

      switch (column.type) {
        case ColumnType.integer: {
          const parsed = Number(rawValue);
          if (!Number.isInteger(parsed)) {
            throw new Error(`${column.label} must be an integer.`);
          }
          payload[column.id] = parsed;
          break;
        }
        case ColumnType.float: {
          const parsed = Number(rawValue);
          if (!Number.isFinite(parsed)) {
            throw new Error(`${column.label} must be a number.`);
          }
          payload[column.id] = parsed;
          break;
        }
        case ColumnType.date: {
          const date = new Date(rawValue);
          if (Number.isNaN(date.getTime())) {
            throw new Error(`${column.label} must be a valid date.`);
          }
          payload[column.id] = rawValue;
          break;
        }
        default:
          payload[column.id] = rawValue;
      }
    }

    return payload;
  }, [columns, formValues]);

  const callCrudApi = useCallback(
    async (
      action: "create" | "update" | "delete",
      data: Record<string, unknown> | undefined,
      where?: Record<string, unknown>,
    ) => {
      const body = { action, table: activeTable, data, where };
      const response = await fetch("/api/crud", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result?.error || "CRUD request failed.");
      }
      return result;
    },
    [activeTable],
  );

  const handleAdd = useCallback(async () => {
    openAddModal();
  }, [openAddModal]);

  const handleEdit = useCallback(
    async (row: Dictionary<unknown>) => {
      openEditModal(row);
    },
    [openEditModal],
  );

  const handleView = useCallback(
    async (row: Dictionary<unknown>) => {
      openViewModal(row);
    },
    [openViewModal],
  );

  const handleDelete = useCallback(
    async (row: Dictionary<unknown>) => {
      const id = row.id;
      if (id === undefined || id === null) {
        window.alert("Row id is required to delete.");
        return;
      }

      if (!window.confirm(`Delete ${tableLabel} row #${id}?`)) {
        return;
      }

      try {
        await callCrudApi("delete", undefined, { id });
        refresh();
      } catch (error) {
        window.alert(
          error instanceof Error ? error.message : "Unable to delete the row.",
        );
      }
    },
    [callCrudApi, refresh, tableLabel],
  );

  const handleModalSubmit = useCallback(async () => {
    try {
      const payload = buildPayload();
      if (modalMode === "add") {
        await callCrudApi("create", payload);
      } else {
        const id = editingRow?.id;
        if (id === undefined || id === null) {
          throw new Error("Missing row id for update.");
        }
        await callCrudApi("update", payload, { id });
      }
      closeModal();
      refresh();
    } catch (error) {
      setFormError(
        error instanceof Error ? error.message : "Unable to save row.",
      );
    }
  }, [buildPayload, modalMode, callCrudApi, editingRow, closeModal, refresh]);

  const handleTableChange = useCallback((key: TableKey) => {
    setActiveTable(key);
  }, []);

  return {
    activeTable,
    columns,
    tableLabel,
    rows,
    isLoading,
    fetchError,
    isModalOpen,
    modalMode,
    formValues,
    formError,
    handleTableChange,
    handleAdd,
    handleEdit,
    handleView,
    handleDelete,
    handleModalSubmit,
    handleFormChange,
    closeModal,
    refresh,
  };
}
