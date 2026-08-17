<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Attendance;
use App\Models\Employee;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AttendanceController extends Controller
{
    /**
     * The roster for a given date: every active employee, with their
     * attendance for that day if already marked (else null → "unmarked").
     */
    public function roster(Request $request): JsonResponse
    {
        $date = $request->date ?? now()->toDateString();

        $marked = Attendance::where('date', $date)
            ->get()
            ->keyBy('employee_id');

        $roster = Employee::query()
            ->where('status', 'active')
            ->orderBy('first_name')
            ->get(['id', 'first_name', 'last_name', 'employee_code', 'job_title'])
            ->map(fn ($e) => [
                'employee'   => $e,
                'attendance' => $marked->get($e->id),
            ]);

        return response()->json(['date' => $date, 'roster' => $roster]);
    }

    /**
     * Bulk upsert a day's attendance. Send only the rows you're marking.
     * One record per employee per day — updateOrCreate on the unique key.
     */
    public function markBulk(Request $request): JsonResponse
    {
        $data = $request->validate([
            'date'                => ['required', 'date'],
            'entries'             => ['required', 'array', 'min:1'],
            'entries.*.employee_id' => ['required', 'exists:employees,id'],
            'entries.*.status'    => ['required', 'in:present,absent,half_day,on_leave,holiday'],
            'entries.*.check_in'  => ['nullable', 'date_format:H:i'],
            'entries.*.check_out' => ['nullable', 'date_format:H:i'],
            'entries.*.project_id'=> ['nullable', 'exists:projects,id'],
            'entries.*.remarks'   => ['nullable', 'string', 'max:255'],
        ]);

        foreach ($data['entries'] as $e) {
            Attendance::updateOrCreate(
                ['employee_id' => $e['employee_id'], 'date' => $data['date']],
                [...$e, 'marked_by' => $request->user()->id],
            );
        }

        return response()->json(['message' => count($data['entries']) . ' records saved.']);
    }

    /**
     * One employee's attendance history (most recent first).
     */
    public function forEmployee(Employee $employee, Request $request): JsonResponse
    {
        $records = $employee->attendances()
            ->with('project:id,name')
            ->latest('date')
            ->limit(60)
            ->get();

        // quick summary counts
        $summary = $records->groupBy('status')->map->count();

        return response()->json(['records' => $records, 'summary' => $summary]);
    }
}