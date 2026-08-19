<?php

namespace App\Services;

use App\Models\Document;
use App\Models\Expense;
use App\Models\LeaveRequest;
use App\Models\PurchaseOrder;
use App\Models\RaBill;
use App\Models\User;

class ActionCenterService
{
    /**
     * Build the current list of action items for a user, gated by their
     * permissions. Each module contributes only if the user can act on it.
     * Everything here is DERIVED live — never stored.
     */
    public function forUser(User $user): array
    {
        $items = [];

        // Pending purchase approvals
        if ($user->can('purchases.approve')) {
            $count = PurchaseOrder::where('status', 'submitted')->count();
            if ($count) {
                $items[] = $this->item('purchases', "$count purchase order" . ($count > 1 ? 's' : '') . " awaiting approval", $count, '/purchases', 'shopping-cart');
            }
        }

        // Pending leave approvals
        if ($user->can('leave.approve')) {
            $count = LeaveRequest::where('status', 'pending')->count();
            if ($count) {
                $items[] = $this->item('leave', "$count leave request" . ($count > 1 ? 's' : '') . " pending", $count, '/leave', 'plane');
            }
        }

        // Pending expense approvals
        if ($user->can('expenses.approve')) {
            $count = Expense::where('status', 'pending')->count();
            if ($count) {
                $items[] = $this->item('expenses', "$count expense" . ($count > 1 ? 's' : '') . " to review", $count, '/expenses', 'wallet');
            }
        }

        // RA bills awaiting approval
        if ($user->can('billing.approve')) {
            $count = RaBill::where('status', 'submitted')->count();
            if ($count) {
                $items[] = $this->item('billing', "$count RA bill" . ($count > 1 ? 's' : '') . " to approve", $count, '/billing', 'receipt');
            }
        }

        // Documents expiring soon
        if ($user->can('documents.view')) {
            $count = Document::whereNotNull('expiry_date')->whereDate('expiry_date', '<=', now()->addDays(30))->count();
            if ($count) {
                $items[] = $this->item('documents', "$count document" . ($count > 1 ? 's' : '') . " expiring soon", $count, '/documents?expiring=1', 'file-warning', 'warning');
            }
        }

        return $items;
    }

    protected function item(string $key, string $label, int $count, string $link, string $icon, string $tone = 'default'): array
    {
        return compact('key', 'label', 'count', 'link', 'icon', 'tone');
    }
}