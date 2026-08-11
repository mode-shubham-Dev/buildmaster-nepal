"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { PermissionGuard } from "@/components/permission-guard";
import { useAuth } from "@/lib/auth-context";
import Link from "next/link";
import {
  Package,
  ArrowLeft,
  Plus,
  Search,
  X,
  Trash2,
  Pencil,
  Tag,
  Layers,
} from "lucide-react";
import {
  fetchMaterials,
  createMaterial,
  updateMaterial,
  deleteMaterial,
  fetchMaterialCategories,
  createMaterialCategory,
  deleteMaterialCategory,
  type Material,
  type MaterialPayload,
} from "@/lib/materials-api";

function money(v: string | null): string {
  if (!v) return "—";
  return `Rs. ${Number(v).toLocaleString()}`;
}

function MaterialsContent() {
  const queryClient = useQueryClient();
  const { can } = useAuth();
  const canManage = can("materials.manage");
  const [search, setSearch] = useState("");
  const [categoryId, setCategoryId] = useState<string>("");
  const [materialModal, setMaterialModal] = useState<{ open: boolean; material: Material | null }>({ open: false, material: null });
  const [showCategories, setShowCategories] = useState(false);

  const { data: materials, isLoading } = useQuery({
    queryKey: ["materials", search, categoryId],
    queryFn: () =>
      fetchMaterials({
        search: search || undefined,
        category_id: categoryId ? Number(categoryId) : undefined,
      }),
  });

  const { data: categories } = useQuery({
    queryKey: ["material-categories"],
    queryFn: fetchMaterialCategories,
  });

  const deleteMut = useMutation({
    mutationFn: deleteMaterial,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["materials"] }),
  });

  return (
    <div className="min-h-screen bg-[#f6f7f9]">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="flex h-9 w-9 items-center justify-center rounded-md border border-slate-200 text-slate-500 transition hover:bg-slate-50 hover:text-slate-700"
            >
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-500 text-[#1a1d23]">
                <Package className="h-5 w-5" strokeWidth={2.2} />
              </div>
              <div>
                <h1 className="text-base font-semibold tracking-tight text-[#1a1d23]">
                  Materials
                </h1>
                <p className="text-xs text-slate-500">Company-wide material catalog</p>
              </div>
            </div>
          </div>

          {canManage && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowCategories(true)}
                className="flex items-center gap-2 rounded-md border border-slate-300 bg-white px-3.5 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
              >
                <Tag className="h-4 w-4" />
                Categories
              </button>
              <button
                onClick={() => setMaterialModal({ open: true, material: null })}
                className="flex items-center gap-2 rounded-md bg-amber-500 px-3.5 py-2 text-sm font-semibold text-[#1a1d23] shadow-sm transition hover:bg-amber-400"
              >
                <Plus className="h-4 w-4" />
                Add Material
              </button>
            </div>
          )}
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-8">
        {/* filters */}
        <div className="mb-5 flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[240px]">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              placeholder="Search by name or code..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-md border border-slate-300 bg-white py-2.5 pl-10 pr-3 text-sm outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
            />
          </div>
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="rounded-md border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
          >
            <option value="">All categories</option>
            {categories?.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="h-7 w-7 animate-spin rounded-full border-2 border-slate-300 border-t-amber-500" />
          </div>
        ) : materials?.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white py-16">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
              <Package className="h-6 w-6" />
            </div>
            <p className="text-sm text-slate-500">No materials found.</p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-left text-xs font-medium uppercase tracking-wide text-slate-500">
                  <th className="px-5 py-3">Code</th>
                  <th className="px-5 py-3">Material</th>
                  <th className="px-5 py-3">Category</th>
                  <th className="px-5 py-3 text-center">Unit</th>
                  <th className="px-5 py-3 text-right">Unit Cost</th>
                  <th className="px-5 py-3 text-center">Status</th>
                  {canManage && <th className="px-5 py-3 text-right">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {materials?.map((m) => (
                  <tr key={m.id} className="transition hover:bg-slate-50/60">
                    <td className="px-5 py-3.5 font-mono text-xs text-slate-500">{m.code}</td>
                    <td className="px-5 py-3.5">
                      <p className="font-medium text-slate-900">{m.name}</p>
                      {m.description && (
                        <p className="text-xs text-slate-400 line-clamp-1">{m.description}</p>
                      )}
                    </td>
                    <td className="px-5 py-3.5">
                      {m.category ? (
                        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs text-slate-600">
                          {m.category.name}
                        </span>
                      ) : (
                        <span className="text-xs text-slate-400">—</span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-center text-slate-600">{m.unit}</td>
                    <td className="px-5 py-3.5 text-right font-medium text-slate-900">
                      {money(m.unit_cost)}
                    </td>
                    <td className="px-5 py-3.5 text-center">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                          m.is_active ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        {m.is_active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    {canManage && (
                      <td className="px-5 py-3.5">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setMaterialModal({ open: true, material: m })}
                            className="inline-flex items-center rounded-md border border-slate-200 p-1.5 text-slate-600 transition hover:bg-slate-50"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => confirm(`Delete ${m.name}?`) && deleteMut.mutate(m.id)}
                            className="inline-flex items-center rounded-md border border-slate-200 p-1.5 text-red-600 transition hover:border-red-200 hover:bg-red-50"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>

      {materialModal.open && (
        <MaterialModal
          material={materialModal.material}
          categories={categories ?? []}
          onClose={() => setMaterialModal({ open: false, material: null })}
          onSaved={() => {
            queryClient.invalidateQueries({ queryKey: ["materials"] });
            setMaterialModal({ open: false, material: null });
          }}
        />
      )}

      {showCategories && (
        <CategoriesModal onClose={() => setShowCategories(false)} />
      )}
    </div>
  );
}

function MaterialModal({
  material,
  categories,
  onClose,
  onSaved,
}: {
  material: Material | null;
  categories: { id: number; name: string }[];
  onClose: () => void;
  onSaved: () => void;
}) {
  const isEdit = !!material;
  const [form, setForm] = useState<MaterialPayload>({
    material_category_id: material?.category?.id ?? null,
    code: material?.code ?? "",
    name: material?.name ?? "",
    description: material?.description ?? "",
    unit: material?.unit ?? "",
    unit_cost: material?.unit_cost ? Number(material.unit_cost) : undefined,
    reorder_level: material?.reorder_level ? Number(material.reorder_level) : undefined,
    is_active: material?.is_active ?? true,
  });
  const [error, setError] = useState("");

  const mutation = useMutation({
    mutationFn: () =>
      isEdit ? updateMaterial(material!.id, form) : createMaterial(form),
    onSuccess: onSaved,
    onError: (err: unknown) => {
      const apiError = err as { response?: { data?: { message?: string } } };
      setError(apiError.response?.data?.message ?? "Failed to save material.");
    },
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-lg rounded-xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <h2 className="text-base font-semibold text-[#1a1d23]">
            {isEdit ? "Edit Material" : "Add Material"}
          </h2>
          <button onClick={onClose} className="text-slate-400 transition hover:text-slate-600">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="max-h-[70vh] space-y-4 overflow-y-auto px-6 py-5">
          {error && (
            <div className="rounded-md border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Code *</label>
              <input
                value={form.code}
                onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))}
                placeholder="MAT-0001"
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Category</label>
              <select
                value={form.material_category_id ?? ""}
                onChange={(e) => setForm((f) => ({ ...f, material_category_id: e.target.value ? Number(e.target.value) : null }))}
                className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
              >
                <option value="">— None —</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Name *</label>
            <input
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="OPC Cement 53 Grade"
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Description</label>
            <textarea
              value={form.description ?? ""}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              rows={2}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Unit *</label>
              <input
                value={form.unit}
                onChange={(e) => setForm((f) => ({ ...f, unit: e.target.value }))}
                placeholder="bag, kg, cum"
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Unit Cost</label>
              <input
                type="number"
                value={form.unit_cost ?? ""}
                onChange={(e) => setForm((f) => ({ ...f, unit_cost: e.target.value ? Number(e.target.value) : undefined }))}
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Reorder Level</label>
              <input
                type="number"
                value={form.reorder_level ?? ""}
                onChange={(e) => setForm((f) => ({ ...f, reorder_level: e.target.value ? Number(e.target.value) : undefined }))}
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
              />
            </div>
          </div>

          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={form.is_active ?? true}
              onChange={(e) => setForm((f) => ({ ...f, is_active: e.target.checked }))}
              className="h-4 w-4 rounded border-slate-300 accent-amber-500"
            />
            Active (available for use)
          </label>
        </div>

        <div className="flex justify-end gap-2 border-t border-slate-100 px-6 py-4">
          <button
            onClick={onClose}
            className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            onClick={() => form.code && form.name && form.unit && mutation.mutate()}
            disabled={mutation.isPending}
            className="rounded-md bg-amber-500 px-4 py-2 text-sm font-semibold text-[#1a1d23] transition hover:bg-amber-400 disabled:opacity-60"
          >
            {mutation.isPending ? "Saving..." : isEdit ? "Save Changes" : "Create Material"}
          </button>
        </div>
      </div>
    </div>
  );
}

function CategoriesModal({ onClose }: { onClose: () => void }) {
  const queryClient = useQueryClient();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const { data: categories } = useQuery({
    queryKey: ["material-categories"],
    queryFn: fetchMaterialCategories,
  });

  const addMut = useMutation({
    mutationFn: () => createMaterialCategory({ name, description: description || undefined }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["material-categories"] });
      setName(""); setDescription("");
    },
  });

  const delMut = useMutation({
    mutationFn: deleteMaterialCategory,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["material-categories"] }),
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <h2 className="text-base font-semibold text-[#1a1d23]">Material Categories</h2>
          <button onClick={onClose} className="text-slate-400 transition hover:text-slate-600">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4 px-6 py-5">
          <div className="flex gap-2">
            <input
              placeholder="Category name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="flex-1 rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
            />
            <button
              onClick={() => name && addMut.mutate()}
              disabled={addMut.isPending}
              className="flex items-center gap-1 rounded-md bg-amber-500 px-3 py-2 text-sm font-semibold text-[#1a1d23] transition hover:bg-amber-400 disabled:opacity-60"
            >
              <Plus className="h-4 w-4" />
              Add
            </button>
          </div>

          <div className="space-y-2">
            {categories?.length === 0 ? (
              <p className="py-4 text-center text-sm text-slate-400">No categories yet.</p>
            ) : (
              categories?.map((c) => (
                <div key={c.id} className="flex items-center justify-between rounded-md border border-slate-200 px-3 py-2">
                  <div className="flex items-center gap-2">
                    <Layers className="h-4 w-4 text-slate-400" />
                    <div>
                      <p className="text-sm font-medium text-slate-800">{c.name}</p>
                      <p className="text-xs text-slate-400">{c.materials_count ?? 0} materials</p>
                    </div>
                  </div>
                  <button
                    onClick={() => confirm(`Delete category "${c.name}"?`) && delMut.mutate(c.id)}
                    className="text-slate-400 transition hover:text-red-600"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function MaterialsPage() {
  return (
    <PermissionGuard permission="materials.view">
      <MaterialsContent />
    </PermissionGuard>
  );
}