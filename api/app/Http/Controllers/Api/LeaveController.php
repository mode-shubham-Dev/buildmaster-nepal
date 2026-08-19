<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\LeaveRequest;
use App\Models\LeaveType;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class LeaveController extends Controller
{
    /** Leave types (for the request dropdown + management). */
    public function types(): JsonResponse
    {
        return response()->json(['types' => LeaveType::where('is_active', true)->get()]);
    }

    /** All requests, newest first, optional status filter. */
    public function index(Request $request): JsonResponse
    {
        $requests = LeaveRequest::with(['employee:id,first_name,last_name,employee_code', 'leaveType:id,name,is_paid', 'approver:id,name'])
            ->when($request->status, fn ($q) => $q->where('status', $request->status))
            ->latest()
            ->get();

        return response()->json(['requests' => $requests]);
    }

    /** Submit a leave request → always starts pending. */
    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'employee_id'   => ['required', 'exists:employees,id'],
            'leave_type_id' => ['required', 'exists:leave_types,id'],
            'from_date'     => ['required', 'date'],
            'to_date'       => ['required', 'date', 'after_or_equal:from_date'],
            'reason'        => ['nullable', 'string'],
        ]);

        $leave = LeaveRequest::create([...$data, 'status' => 'pending']);

        return response()->json([
            'message' => 'Leave request submitted.',
            'request' => $leave->load(['employee:id,first_name,last_name', 'leaveType:id,name']),
        ], 201);
    }

    /** Approve or reject — only a pending request can be actioned. */
    public function action(Request $request, LeaveRequest $leaveRequest): JsonResponse
    {
        $data = $request->validate([
            'status'         => ['required', 'in:approved,rejected'],
            'action_remarks' => ['nullable', 'string', 'max:255'],
        ]);

        if ($leaveRequest->status !== 'pending') {
            throw ValidationException::withMessages([
                'status' => 'This request has already been actioned.',
            ]);
        }

        $leaveRequest->update([
            'status'         => $data['status'],
            'action_remarks' => $data['action_remarks'] ?? null,
            'approved_by'    => $request->user()->id,
            'actioned_at'    => now(),
        ]);

        // Notify the employee's user account, if linked.
        if ($leaveRequest->employee->user_id) {
            \App\Support\Notify::send(
                $leaveRequest->employee->user,
                "leave.{$data['status']}",
                "Leave request {$data['status']}",
                "Your leave request has been {$data['status']}.",
                '/leave',
            );
        }

        return response()->json(['message' => "Leave {$data['status']}."]);
    }

    public function destroy(LeaveRequest $leaveRequest): JsonResponse
    {
        $leaveRequest->delete();
        return response()->json(['message' => 'Leave request deleted.']);
    }
}