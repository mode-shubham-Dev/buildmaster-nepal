"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { PermissionGuard } from "@/components/permission-guard";
import { useAuth } from "@/lib/auth-context";
import {
  fetchUsers,
  fetchRoles,
  createUser,
  updateUserRole,
  deleteUser,
  type ManagedUser,
} from "@/lib/users-api";
import {
  Users,
  Plus,
  Trash2,
  Mail,
  Shield,
  X,
  ArrowLeft,
} from "lucide-react";
import Link from "next/link";

function UsersContent() {
  const queryClient = useQueryClient();
  const { user: currentUser, can } = useAuth();
  const [showCreate, setShowCreate] = useState(false);

  const { data: users, isLoading } = useQuery({
    queryKey: ["users"],
    queryFn: fetchUsers,
  });

  const { data: roles } = useQuery({
    queryKey: ["roles"],
    queryFn: fetchRoles,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteUser,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["users"] }),
  });

  const roleMutation = useMutation({
    mutationFn: ({ userId, role }: { userId: number; role: string }) =>
      updateUserRole(userId, role),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["users"] }),
  });

  return (
    <div className="min-h-screen bg-[#fafafa]">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="flex h-9 w-9 items-center justify-center rounded-md border border-slate-200 text-slate-500 transition hover:bg-slate-50"
            >
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-500 text-[#1a1d23]">
                <Users className="h-5 w-5" strokeWidth={2.2} />
              </div>
              <div>
                <h1 className="text-base font-semibold tracking-tight text-[#1a1d23]">
                  User Management
                </h1>
                <p className="text-xs text-slate-500">
                  Manage users and their roles
                </p>
              </div>
            </div>
          </div>

          {can("users.create") && (
            <button
              onClick={() => setShowCreate(true)}
              className="flex items-center gap-2 rounded-md bg-amber-500 px-3.5 py-2 text-sm font-semibold text-[#1a1d23] shadow-sm transition hover:bg-amber-400"
            >
              <Plus className="h-4 w-4" />
              Add User
            </button>
          )}
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-8">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="h-7 w-7 animate-spin rounded-full border-2 border-slate-300 border-t-amber-500" />
          </div>
        ) : (
          <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-left text-xs font-medium uppercase tracking-wide text-slate-500">
                  <th className="px-5 py-3">Name</th>
                  <th className="px-5 py-3">Email</th>
                  <th className="px-5 py-3">Role</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users?.map((u) => (
                  <UserRow
                    key={u.id}
                    user={u}
                    roles={roles ?? []}
                    isCurrentUser={u.id === currentUser?.id}
                    canAssign={can("roles.assign")}
                    canDelete={can("users.delete")}
                    onRoleChange={(role) =>
                      roleMutation.mutate({ userId: u.id, role })
                    }
                    onDelete={() => {
                      if (confirm(`Delete ${u.name}? This cannot be undone.`)) {
                        deleteMutation.mutate(u.id);
                      }
                    }}
                  />
                ))}
              </tbody>
            </table>

            {users?.length === 0 && (
              <div className="py-16 text-center text-sm text-slate-500">
                No users found.
              </div>
            )}
          </div>
        )}
      </main>

      {showCreate && (
        <CreateUserModal
          roles={roles ?? []}
          onClose={() => setShowCreate(false)}
          onCreated={() => {
            queryClient.invalidateQueries({ queryKey: ["users"] });
            setShowCreate(false);
          }}
        />
      )}
    </div>
  );
}

function UserRow({
  user,
  roles,
  isCurrentUser,
  canAssign,
  canDelete,
  onRoleChange,
  onDelete,
}: {
  user: ManagedUser;
  roles: string[];
  isCurrentUser: boolean;
  canAssign: boolean;
  canDelete: boolean;
  onRoleChange: (role: string) => void;
  onDelete: () => void;
}) {
  const role = user.roles[0] ?? "—";

  return (
    <tr className="transition hover:bg-slate-50/60">
      <td className="px-5 py-3.5">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold text-slate-600">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <span className="font-medium text-slate-900">
            {user.name}
            {isCurrentUser && (
              <span className="ml-2 rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-medium text-amber-700">
                You
              </span>
            )}
          </span>
        </div>
      </td>
      <td className="px-5 py-3.5 text-slate-600">
        <div className="flex items-center gap-1.5">
          <Mail className="h-3.5 w-3.5 text-slate-400" />
          {user.email}
        </div>
      </td>
      <td className="px-5 py-3.5">
        {canAssign && !isCurrentUser ? (
          <select
            value={role}
            onChange={(e) => onRoleChange(e.target.value)}
            className="rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-sm text-slate-700 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
          >
            {roles.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        ) : (
          <span className="inline-flex items-center gap-1.5 rounded-md bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">
            <Shield className="h-3 w-3" />
            {role}
          </span>
        )}
      </td>
      <td className="px-5 py-3.5 text-right">
        {canDelete && !isCurrentUser && (
          <button
            onClick={onDelete}
            className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 px-2.5 py-1.5 text-xs font-medium text-red-600 transition hover:bg-red-50"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Delete
          </button>
        )}
      </td>
    </tr>
  );
}

function CreateUserModal({
  roles,
  onClose,
  onCreated,
}: {
  roles: string[];
  onClose: () => void;
  onCreated: () => void;
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState(roles[0] ?? "");
  const [error, setError] = useState("");

  const mutation = useMutation({
    mutationFn: createUser,
    onSuccess: onCreated,
    onError: (err: unknown) => {
      const apiError = err as { response?: { data?: { message?: string } } };
      setError(apiError.response?.data?.message ?? "Failed to create user.");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    mutation.mutate({ name, email, password, role });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-lg bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <h2 className="text-base font-semibold text-[#1a1d23]">
            Create New User
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 transition hover:text-slate-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 px-6 py-5">
          {error && (
            <div className="rounded-md border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm text-red-700">
              {error}
            </div>
          )}

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Full Name
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Password
            </label>
            <input
              type="password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Role
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
            >
              {roles.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={mutation.isPending}
              className="rounded-md bg-amber-500 px-4 py-2 text-sm font-semibold text-[#1a1d23] transition hover:bg-amber-400 disabled:opacity-60"
            >
              {mutation.isPending ? "Creating..." : "Create User"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function UsersPage() {
  return (
    <PermissionGuard permission="users.view">
      <UsersContent />
    </PermissionGuard>
  );
}