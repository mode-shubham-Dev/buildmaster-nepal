"use client";

import { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Plus,
  Trash2,
  Calendar,
  Wallet,
  ImagePlus,
  X,
  Pencil,
  Check,
} from "lucide-react";
import {
  fetchMilestones,
  addMilestone,
  updateMilestone,
  deleteMilestone,
  uploadMilestoneImage,
  deleteAttachment,
  type Milestone,
  type MilestoneStatus,
} from "@/lib/milestones-api";

const STATUS_META: Record<MilestoneStatus, { label: string; color: string; bar: string }> = {
  pending: { label: "Pending", color: "bg-slate-100 text-slate-600", bar: "bg-slate-400" },
  in_progress: { label: "In Progress", color: "bg-blue-100 text-blue-700", bar: "bg-blue-500" },
  completed: { label: "Completed", color: "bg-green-100 text-green-700", bar: "bg-green-500" },
  delayed: { label: "Delayed", color: "bg-red-100 text-red-700", bar: "bg-red-500" },
};

function money(v: string | null): string {
  if (!v) return "—";
  return `Rs. ${Number(v).toLocaleString()}`;
}

export function MilestonesTab({ projectId, canManage }: { projectId: number; canManage: boolean }) {
  const queryClient = useQueryClient();
  const [showAdd, setShowAdd] = useState(false);

  const { data: milestones, isLoading } = useQuery({
    queryKey: ["milestones", projectId],
    queryFn: () => fetchMilestones(projectId),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="h-7 w-7 animate-spin rounded-full border-2 border-slate-300 border-t-amber-500" />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {canManage && (
        <div className="flex justify-end">
          <button
            onClick={() => setShowAdd(true)}
            className="flex items-center gap-2 rounded-md bg-amber-500 px-3.5 py-2 text-sm font-semibold text-[#1a1d23] shadow-sm transition hover:bg-amber-400"
          >
            <Plus className="h-4 w-4" />
            Add Milestone
          </button>
        </div>
      )}

      {(milestones?.length ?? 0) === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white py-12 text-center text-sm text-slate-500">
          No milestones yet. Break the project into trackable stages.
        </div>
      ) : (
        <div className="space-y-4">
          {milestones?.map((m, idx) => (
            <MilestoneCard
              key={m.id}
              milestone={m}
              index={idx + 1}
              projectId={projectId}
              canManage={canManage}
            />
          ))}
        </div>
      )}

      {showAdd && (
        <MilestoneModal
          projectId={projectId}
          milestone={null}
          onClose={() => setShowAdd(false)}
          onSaved={() => {
            queryClient.invalidateQueries({ queryKey: ["milestones", projectId] });
            setShowAdd(false);
          }}
        />
      )}
    </div>
  );
}

function MilestoneCard({
  milestone,
  index,
  projectId,
  canManage,
}: {
  milestone: Milestone;
  index: number;
  projectId: number;
  canManage: boolean;
}) {
  const queryClient = useQueryClient();
  const [showEdit, setShowEdit] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const meta = STATUS_META[milestone.status];

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ["milestones", projectId] });

  const delMut = useMutation({
    mutationFn: () => deleteMilestone(milestone.id),
    onSuccess: invalidate,
  });

  const delImgMut = useMutation({
    mutationFn: deleteAttachment,
    onSuccess: invalidate,
  });

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      await uploadMilestoneImage(milestone.id, file);
      invalidate();
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const images = milestone.attachments ?? [];

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-amber-500 text-sm font-bold text-[#1a1d23]">
            {index}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-slate-900">{milestone.title}</h3>
              <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${meta.color}`}>
                {meta.label}
              </span>
            </div>
            {milestone.description && (
              <p className="mt-1 text-sm text-slate-500">{milestone.description}</p>
            )}
          </div>
        </div>

        {canManage && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowEdit(true)}
              className="inline-flex items-center gap-1 rounded-md border border-slate-200 px-2.5 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-50"
            >
              <Pencil className="h-3.5 w-3.5" />
              Edit
            </button>
            <button
              onClick={() => confirm(`Delete "${milestone.title}"?`) && delMut.mutate()}
              className="inline-flex items-center rounded-md border border-slate-200 p-1.5 text-red-600 transition hover:border-red-200 hover:bg-red-50"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* completion bar */}
      <div className="mt-4">
        <div className="mb-1 flex items-center justify-between text-xs">
          <span className="text-slate-500">Progress</span>
          <span className="font-semibold text-slate-700">{milestone.completion_percentage}%</span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
          <div
            className={`h-full rounded-full transition-all ${meta.bar}`}
            style={{ width: `${milestone.completion_percentage}%` }}
          />
        </div>
      </div>

      {/* meta row */}
      <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-xs text-slate-500">
        {milestone.deadline && (
          <span className="flex items-center gap-1">
            <Calendar className="h-3.5 w-3.5" />
            Due {milestone.deadline.split("T")[0]}
          </span>
        )}
        {milestone.budget && (
          <span className="flex items-center gap-1">
            <Wallet className="h-3.5 w-3.5" />
            {money(milestone.budget)}
          </span>
        )}
      </div>

      {/* images */}
      <div className="mt-4 border-t border-slate-100 pt-4">
        <div className="flex flex-wrap items-center gap-3">
          {images.map((img) => (
            <div key={img.id} className="group relative h-20 w-20 overflow-hidden rounded-lg border border-slate-200">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={img.url} alt={img.original_name} className="h-full w-full object-cover" />
              {canManage && (
                <button
                  onClick={() => delImgMut.mutate(img.id)}
                  className="absolute right-1 top-1 rounded-full bg-black/60 p-0.5 text-white opacity-0 transition group-hover:opacity-100"
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </div>
          ))}

          {canManage && (
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="flex h-20 w-20 flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-slate-300 text-slate-400 transition hover:border-amber-400 hover:text-amber-500 disabled:opacity-50"
            >
              {uploading ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-amber-500" />
              ) : (
                <>
                  <ImagePlus className="h-5 w-5" />
                  <span className="text-[10px]">Add</span>
                </>
              )}
            </button>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFile}
            className="hidden"
          />
        </div>
      </div>

      {showEdit && (
        <MilestoneModal
          projectId={projectId}
          milestone={milestone}
          onClose={() => setShowEdit(false)}
          onSaved={() => {
            invalidate();
            setShowEdit(false);
          }}
        />
      )}
    </div>
  );
}

function MilestoneModal({
  projectId,
  milestone,
  onClose,
  onSaved,
}: {
  projectId: number;
  milestone: Milestone | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const isEdit = !!milestone;
  const [title, setTitle] = useState(milestone?.title ?? "");
  const [description, setDescription] = useState(milestone?.description ?? "");
  const [budget, setBudget] = useState(milestone?.budget ?? "");
  const [deadline, setDeadline] = useState(milestone?.deadline ?? "");
  const [completion, setCompletion] = useState(String(milestone?.completion_percentage ?? 0));
  const [status, setStatus] = useState<MilestoneStatus>(milestone?.status ?? "pending");
  const [error, setError] = useState("");

  const mutation = useMutation({
    mutationFn: () => {
      const payload = {
        title,
        description: description || undefined,
        budget: budget ? Number(budget) : undefined,
        deadline: deadline || undefined,
        completion_percentage: Number(completion),
        status,
      };
      return isEdit
        ? updateMilestone(milestone!.id, payload)
        : addMilestone(projectId, payload);
    },
    onSuccess: onSaved,
    onError: (err: unknown) => {
      const apiError = err as { response?: { data?: { message?: string } } };
      setError(apiError.response?.data?.message ?? "Failed to save milestone.");
    },
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-lg rounded-xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <h2 className="text-base font-semibold text-[#1a1d23]">
            {isEdit ? "Edit Milestone" : "Add Milestone"}
          </h2>
          <button onClick={onClose} className="text-slate-400 transition hover:text-slate-600">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4 px-6 py-5">
          {error && (
            <div className="rounded-md border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm text-red-700">
              {error}
            </div>
          )}

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Title *</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Foundation Complete"
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Budget (Rs.)</label>
              <input
                type="number"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Deadline</label>
              <input
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Completion: {completion}%
              </label>
              <input
                type="range"
                min="0"
                max="100"
                value={completion}
                onChange={(e) => setCompletion(e.target.value)}
                className="w-full accent-amber-500"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as MilestoneStatus)}
                className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
              >
                <option value="pending">Pending</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="delayed">Delayed</option>
              </select>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 border-t border-slate-100 px-6 py-4">
          <button
            onClick={onClose}
            className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            onClick={() => title && mutation.mutate()}
            disabled={mutation.isPending}
            className="flex items-center gap-2 rounded-md bg-amber-500 px-4 py-2 text-sm font-semibold text-[#1a1d23] transition hover:bg-amber-400 disabled:opacity-60"
          >
            <Check className="h-4 w-4" />
            {mutation.isPending ? "Saving..." : isEdit ? "Save" : "Add"}
          </button>
        </div>
      </div>
    </div>
  );
}