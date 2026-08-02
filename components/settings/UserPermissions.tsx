"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

type Topic = { id: number; name: string; label: string };
type User = { id: number; email: string; firstName: string; lastName: string; hasPassword: string | null };
type UserPerm = { canCreate: boolean; canRead: boolean; canUpdate: boolean; canDelete: boolean };
type PermsMap = Record<number, Record<number, UserPerm>>;

export default function UserPermissions() {
  const [users, setUsers] = useState<User[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [permsMap, setPermsMap] = useState<PermsMap>({});
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [userSearch, setUserSearch] = useState("");

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/permissions", { cache: "no-store" });
      const data = await res.json();
      if (data.success) {
        setUsers(data.users);
        setTopics(data.topics);
        setPermsMap(data.permsMap);
      }
    } catch {
      setMessage("Failed to load permissions data.");
    }
  }, []);

  useEffect(() => { void fetchData(); }, [fetchData]);

  const hasAnyPerm = useCallback(
    (userId: number) => {
      const userPerms = permsMap[userId];
      if (!userPerms) return false;
      return Object.values(userPerms).some((p) => p.canRead || p.canCreate || p.canUpdate || p.canDelete);
    },
    [permsMap],
  );

  const sortedUsers = useMemo(
    () => [...users].sort((a, b) => a.firstName.localeCompare(b.firstName) || a.lastName.localeCompare(b.lastName)),
    [users],
  );

  const usersWithAccess = useMemo(
    () => sortedUsers.filter((u) => hasAnyPerm(u.id)),
    [sortedUsers, hasAnyPerm],
  );

  const usersWithoutAccess = useMemo(
    () => sortedUsers.filter((u) => !hasAnyPerm(u.id)),
    [sortedUsers, hasAnyPerm],
  );

  const filteredUsersWithoutAccess = useMemo(
    () => {
      if (!userSearch) return usersWithoutAccess;
      const q = userSearch.toLowerCase();
      return usersWithoutAccess.filter(
        (u) =>
          u.firstName.toLowerCase().includes(q) ||
          u.lastName.toLowerCase().includes(q) ||
          u.email.toLowerCase().includes(q),
      );
    },
    [usersWithoutAccess, userSearch],
  );

  const selectedUserPerms = selectedUserId ? permsMap[selectedUserId] ?? {} : {};
  const selectedUser = users.find((u) => u.id === selectedUserId);

  const handleToggle = (topicId: number, field: "canCreate" | "canRead" | "canUpdate" | "canDelete") => {
    if (!selectedUserId) return;
    setPermsMap((prev) => {
      const updated = { ...prev };
      if (!updated[selectedUserId]) updated[selectedUserId] = {};
      const current = updated[selectedUserId][topicId] ?? { canCreate: false, canRead: false, canUpdate: false, canDelete: false };
      updated[selectedUserId] = {
        ...updated[selectedUserId],
        [topicId]: { ...current, [field]: !current[field] },
      };
      return updated;
    });
  };

  const handleSetPassword = async () => {
    if (!selectedUserId || !newPassword) return;
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch("/api/auth/set-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: selectedUserId, password: newPassword }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || "Failed.");
      setMessage("Password updated.");
      setNewPassword("");
      setUsers((prev) =>
        prev.map((u) => (u.id === selectedUserId ? { ...u, hasPassword: "1" } : u)),
      );
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Failed to set password.");
    } finally {
      setSaving(false);
    }
  };

  const handleSavePermissions = async () => {
    if (!selectedUserId) return;
    setSaving(true);
    setMessage(null);
    try {
      const userPerms = permsMap[selectedUserId] ?? {};
      for (const topic of topics) {
        const p = userPerms[topic.id];
        if (!p) continue;
        const res = await fetch("/api/auth/permissions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: selectedUserId,
            topicId: topic.id,
            canCreate: p.canCreate,
            canRead: p.canRead,
            canUpdate: p.canUpdate,
            canDelete: p.canDelete,
          }),
        });
        const data = await res.json();
        if (!data.success) throw new Error(data.error || "Save failed.");
      }
      setMessage("Permissions saved.");
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Failed to save.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <p className="text-sm text-slate-600 mb-4">
        Grant users access to topics and set their rights. Users without a password cannot log in.
      </p>

      {message && (
        <div className={`rounded-lg p-3 text-sm mb-4 ring-1 ${
          message === "Permissions saved." || message === "Password updated."
            ? "bg-green-50 text-green-700 ring-green-200"
            : "bg-red-50 text-red-700 ring-red-200"
        }`}>
          {message}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-4">
          <div>
            <h3 className="text-sm font-semibold text-slate-700 mb-2">Users with Access</h3>
            {usersWithAccess.length === 0 ? (
              <p className="text-sm text-slate-400">No users have permissions yet.</p>
            ) : (
              <div className="space-y-1 max-h-80 overflow-y-auto">
                {usersWithAccess.map((u) => (
                  <button
                    key={u.id}
                    type="button"
                    onClick={() => { setSelectedUserId(u.id); setNewPassword(""); }}
                    className={`w-full text-left rounded-lg px-3 py-2 text-sm transition ${
                      selectedUserId === u.id
                        ? "bg-slate-900 text-white"
                        : "bg-slate-50 text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    <div className="font-medium truncate">{u.firstName} {u.lastName}</div>
                    <div className={`text-xs truncate ${selectedUserId === u.id ? "text-slate-300" : "text-slate-400"}`}>
                      {u.email}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div>
            <h3 className="text-sm font-semibold text-slate-700 mb-2">Add User</h3>
            <input
              type="text"
              value={userSearch}
              onChange={(e) => setUserSearch(e.target.value)}
              placeholder="Search by name or email..."
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none mb-2"
            />
            <div className="max-h-40 overflow-y-auto space-y-1">
              {filteredUsersWithoutAccess.length === 0 ? (
                <p className="text-xs text-slate-400 px-1">
                  {userSearch ? "No matching users." : "All users already have access."}
                </p>
              ) : (
                filteredUsersWithoutAccess.map((u) => (
                  <button
                    key={u.id}
                    type="button"
                    onClick={() => { setSelectedUserId(u.id); setUserSearch(""); }}
                    className={`w-full text-left rounded-lg px-3 py-2 text-sm transition ${
                      selectedUserId === u.id
                        ? "bg-slate-900 text-white"
                        : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
                    }`}
                  >
                    <span className="truncate">{u.firstName} {u.lastName}</span>
                    <span className="text-xs text-slate-400 ml-1">({u.email})</span>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="lg:col-span-2">
          {!selectedUser ? (
            <div className="flex items-center justify-center h-64 rounded-xl border-2 border-dashed border-slate-200">
              <p className="text-sm text-slate-400">Select a user from the left to manage their permissions.</p>
            </div>
          ) : (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-slate-900">
                  {selectedUser.firstName} {selectedUser.lastName}
                </h3>
                <span className="text-sm text-slate-400">{selectedUser.email}</span>
              </div>

              <div className="rounded-xl border border-slate-200 p-4 mb-4">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  {selectedUser.hasPassword ? "Reset Password" : "Set Password"}
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="New password"
                    className="flex-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleSetPassword}
                    disabled={saving || !newPassword}
                    className="rounded-lg bg-slate-800 px-4 py-2 text-sm text-white transition hover:bg-slate-700 disabled:opacity-50"
                  >
                    Set
                  </button>
                </div>
              </div>

              <div className="overflow-hidden rounded-xl border border-slate-200">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-slate-100 text-left text-xs font-semibold text-slate-600 uppercase">
                      <th className="px-4 py-3">Topic</th>
                      <th className="px-4 py-3 text-center">Create</th>
                      <th className="px-4 py-3 text-center">Read</th>
                      <th className="px-4 py-3 text-center">Update</th>
                      <th className="px-4 py-3 text-center">Delete</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {topics.map((topic) => {
                      const p = selectedUserPerms[topic.id] ?? { canCreate: false, canRead: false, canUpdate: false, canDelete: false };
                      return (
                        <tr key={topic.id} className="hover:bg-slate-50">
                          <td className="px-4 py-3 font-medium text-slate-900">{topic.label}</td>
                          {(["canCreate", "canRead", "canUpdate", "canDelete"] as const).map((field) => (
                            <td key={field} className="px-4 py-3 text-center">
                              <input
                                type="checkbox"
                                checked={p[field]}
                                onChange={() => handleToggle(topic.id, field)}
                                className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-500"
                              />
                            </td>
                          ))}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <div className="mt-4 flex justify-end">
                <button
                  type="button"
                  onClick={handleSavePermissions}
                  disabled={saving}
                  className="rounded-lg bg-slate-900 px-5 py-2 text-sm font-medium text-white transition hover:bg-slate-700 disabled:opacity-50"
                >
                  {saving ? "Saving..." : "Save Permissions"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
