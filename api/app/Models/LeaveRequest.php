<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class LeaveRequest extends Model
{
    protected $fillable = [
        'employee_id', 'leave_type_id', 'from_date', 'to_date',
        'reason', 'status', 'approved_by', 'actioned_at', 'action_remarks',
    ];

    protected function casts(): array
    {
        return [
            'from_date'   => 'date',
            'to_date'     => 'date',
            'actioned_at' => 'datetime',
        ];
    }

    protected $appends = ['days'];

    public function employee(): BelongsTo
    {
        return $this->belongsTo(Employee::class);
    }

    public function leaveType(): BelongsTo
    {
        return $this->belongsTo(LeaveType::class);
    }

    public function approver(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    /** DERIVED: inclusive day count of the leave period. */
    public function getDaysAttribute(): int
    {
        return Carbon::parse($this->from_date)->diffInDays(Carbon::parse($this->to_date)) + 1;
    }
}