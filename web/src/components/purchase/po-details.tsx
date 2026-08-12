"use client";

import { type ReactNode } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth-context";
import {
  X,
  Send,
  Check,
  Ban,
  PackageCheck,
  XCircle,
  Building,
  Warehouse as WarehouseIcon,
  Calendar,
  User,
} from "lucide-react";
import {
  fetchPurchaseOrder,
  submitPO,
  approvePO,
  rejectPO,
  cancelPO,
  receivePO,
  type POStatus,
} from "@/lib/purchase-api";

const STATUS_META: Record<POStatus, { label: string; color: string }> = {
  draft: { label: "Draft", color: "bg-slate-100 text-slate-600" },
  submitted: { label: "Submitted", color: "bg-blue-100 text-blue-700" },
  approved: { label: "Approved", color: "bg-purple-100 text-purple-700" },
  received: { label: "Received", color: "bg-green-100 text-green-700" },
  rejected: { label: "Rejected", color: "bg-red-100 text-red-700" },
  cancelled: { label: "Cancelled", color: "bg-slate-100 text-slate-500" },
};

function money(v: string | null): string {
  if (!v) return "Rs. 0";
  return `Rs. ${Number(v).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function PODetail({ poId, onClose }: { poId: number; onClose: () => void }) {
  const queryClient = useQueryClient();
  const { can } = useAuth();

  const { data: po, isLoading } = useQuery({
    queryKey: ["purchase-order", poId],
    queryFn: () => fetchPurchaseOrder(poId),
  });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["purchase-order", poId] });
    queryClient.invalidateQueries({ queryKey: ["purchase-orders"] });
    queryClient.invalidateQueries({ queryKey: ["stock-levels"] });
  };

  const submitMut = useMutation({ mutationFn: () => submitPO(poId), onSuccess: invalidate });
  const approveMut = useMutation({ mutationFn: () => approvePO(poId), onSuccess: invalidate });
  const rejectMut = useMutation({ mutationFn: () => rejectPO(poId), onSuccess: invalidate });
  const cancelMut = useMutation({ mutationFn: () => cancelPO(poId), onSuccess: invalidate });
  const receiveMut = useMutation({ mutationFn: () => receivePO(poId), onSuccess: invalidate });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-hidden rounded-xl bg-white shadow-xl">
        {isLoading || !po ? (
          <div className="flex items-center justify-center py-20">
            <div className="h-7 w-7 animate-spin rounded-full border-2 border-slate-300 border-t-amber-500" />
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
              <div className="flex items-center gap-3">
                <h2 className="font-mono text-base font-semibold text-[#1a1d23]">{po.po_number}</h2>
                <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_META[po.status].color}`}>
                  {STATUS_META[po.status].label}
                </span>
              </div>
              <button onClick={onClose} className="text-slate-400 transition hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="max-h-[calc(90vh-140px)] overflow-y-auto px-6 py-5">
              {/* meta */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <Meta icon={<Building className="h-4 w-4" />} label="Supplier" value={po.supplier?.name} />
                <Meta icon={<WarehouseIcon className="h-4 w-4" />} label="Deliver To" value={po.warehouse?.name} />
                <Meta icon={<Calendar className="h-4 w-4" />} label="Order Date" value={po.order_date?.split("T")[0]} />
                <Meta icon={<Calendar className="h-4 w-4" />} label="Expected" value={po.expected_delivery?.split("T")[0]} />
                {po.creator && <Meta icon={<User className="h-4 w-4" />} label="Created By" value={po.creator.name} />}
                {po.approver && <Meta icon={<Check className="h-4 w-4" />} label="Approved By" value={po.approver.name} />}
              </div>

              {/* line items */}
              <div className="mt-5 overflow-hidden rounded-lg border border-slate-200">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50 text-left text-xs font-medium uppercase tracking-wide text-slate-500">
                      <th className="px-4 py-2.5">Material</th>
                      <th className="px-4 py-2.5 text-right">Qty</th>
                      <th className="px-4 py-2.5 text-right">Rate</th>
                      <th className="px-4 py-2.5 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {po.items?.map((it) => (
                      <tr key={it.id}>
                        <td className="px-4 py-2.5 text-slate-900">
                          {it.material?.name}
                          <span className="ml-1 text-xs text-slate-400">({it.material?.unit})</span>
                        </td>
                        <td className="px-4 py-2.5 text-right text-slate-600">{Number(it.quantity).toLocaleString()}</td>
                        <td className="px-4 py-2.5 text-right text-slate-600">{Number(it.rate).toLocaleString()}</td>
                        <td className="px-4 py-2.5 text-right font-medium text-slate-900">{money(it.amount)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* totals */}
              <div className="mt-4 ml-auto w-full max-w-xs space-y-1.5 text-sm">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal</span>
                  <span>{money(po.subtotal)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>VAT ({Number(po.vat_percentage)}%)</span>
                  <span>{money(po.vat_amount)}</span>
                </div>
                <div className="flex justify-between border-t border-slate-200 pt-1.5 text-base font-bold text-[#1a1d23]">
                  <span>Total</span>
                  <span className="text-amber-600">{money(po.total)}</span>
                </div>
              </div>
            </div>

            {/* workflow actions — gated by status + permission */}
            <div className="flex flex-wrap items-center justify-end gap-2 border-t border-slate-200 bg-slate-50 px-6 py-4">
              {po.status === "draft" && can("purchases.create") && (
                <ActionBtn label="Submit for Approval" icon={<Send className="h-4 w-4" />} onClick={() => submitMut.mutate()} pending={submitMut.isPending} primary />
              )}
              {po.status === "submitted" && can("purchases.approve") && (
                <>
                  <ActionBtn label="Reject" icon={<XCircle className="h-4 w-4" />} onClick={() => rejectMut.mutate()} pending={rejectMut.isPending} danger />
                  <ActionBtn label="Approve" icon={<Check className="h-4 w-4" />} onClick={() => approveMut.mutate()} pending={approveMut.isPending} primary />
                </>
              )}
              {po.status === "approved" && can("purchases.receive") && (
                <ActionBtn label="Receive Goods → Update Stock" icon={<PackageCheck className="h-4 w-4" />} onClick={() => receiveMut.mutate()} pending={receiveMut.isPending} primary />
              )}
              {["draft", "submitted", "approved"].includes(po.status) && can("purchases.create") && (
                <ActionBtn label="Cancel" icon={<Ban className="h-4 w-4" />} onClick={() => cancelMut.mutate()} pending={cancelMut.isPending} />
              )}
              {["received", "rejected", "cancelled"].includes(po.status) && (
                <span className="text-xs text-slate-400">No further actions — this order is {STATUS_META[po.status].label.toLowerCase()}.</span>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function Meta({ icon, label, value }: { icon: ReactNode; label: string; value: string | null | undefined }) {
  return (
    <div className="flex items-start gap-2">
      <span className="mt-0.5 text-slate-400">{icon}</span>
      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-slate-400">{label}</p>
        <p className="text-sm text-slate-900">{value || "—"}</p>
      </div>
    </div>
  );
}

function ActionBtn({
  label,
  icon,
  onClick,
  pending,
  primary,
  danger,
}: {
  label: string;
  icon: ReactNode;
  onClick: () => void;
  pending: boolean;
  primary?: boolean;
  danger?: boolean;
}) {
  const base = "flex items-center gap-2 rounded-md px-4 py-2 text-sm font-semibold transition disabled:opacity-60";
  const style = primary
    ? "bg-amber-500 text-[#1a1d23] hover:bg-amber-400"
    : danger
    ? "border border-red-200 bg-white text-red-600 hover:bg-red-50"
    : "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50";
  return (
    <button onClick={onClick} disabled={pending} className={`${base} ${style}`}>
      {icon}
      {pending ? "..." : label}
    </button>
  );
}