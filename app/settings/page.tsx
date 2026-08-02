"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import DeepTable from "@/components/deepTable/DeepTable";
import TableSelector from "@/components/settings/TableSelector";
import CrudModal from "@/components/settings/CrudModal";
import UserPermissions from "@/components/settings/UserPermissions";
import { useSettingsCrud } from "@/components/settings/useSettingsCrud";

export default function SettingsPage() {
  const [tab, setTab] = useState<"tables" | "permissions">("tables");
  const { hasTopic, canAccess } = useAuth();

  const crud = useSettingsCrud();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 p-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-semibold mb-4">Settings</h1>

        <div className="mb-6 flex items-center gap-4 border-b border-slate-200">
          {hasTopic("settings") && (
            <button
              type="button"
              onClick={() => setTab("tables")}
              className={`px-4 py-3 text-sm font-medium transition ${
                tab === "tables"
                  ? "text-slate-900 border-b-2 border-slate-900"
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              Lookup Tables
            </button>
          )}
          {canAccess("settings", "create") && (
            <button
              type="button"
              onClick={() => setTab("permissions")}
              className={`px-4 py-3 text-sm font-medium transition ${
                tab === "permissions"
                  ? "text-slate-900 border-b-2 border-slate-900"
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              Permissions
            </button>
          )}
        </div>

        {tab === "tables" && (
          <>
            <p className="text-slate-600 mb-6">
              Manage the selected lookup table with add, edit and delete actions.
            </p>
            <TableSelector activeTable={crud.activeTable} onSelect={crud.handleTableChange} />
            <div className="mb-4 flex items-center justify-between gap-3">
              <h2 className="text-xl font-semibold">{crud.tableLabel}</h2>
            </div>
            <DeepTable
              columnNames={crud.columns}
              initialRowsValues={crud.rows}
              displayPagination={false}
              displayAddButton={true}
              displayEditAction={true}
              displayDeleteAction={true}
              displayViewAction={true}
              handleAddAction={crud.handleAdd}
              handleEditAction={crud.handleEdit}
              handleDeleteAction={crud.handleDelete}
              handleViewAction={crud.handleView}
              handleRefreshAction={crud.refresh}
              isLoading={crud.isLoading}
              fetchError={crud.fetchError}
            />
            <CrudModal
              isOpen={crud.isModalOpen}
              mode={crud.modalMode}
              columns={crud.columns}
              formValues={crud.formValues}
              formError={crud.formError}
              tableLabel={crud.tableLabel}
              onClose={crud.closeModal}
              onChange={crud.handleFormChange}
              onSubmit={crud.handleModalSubmit}
            />
          </>
        )}

        {tab === "permissions" && <UserPermissions />}
      </div>
    </div>
  );
}
