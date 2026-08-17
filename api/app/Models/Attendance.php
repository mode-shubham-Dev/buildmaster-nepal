<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Attendance extends Model
{
    protected $fillable = [
        'employee_id', 'date', 'status', 'check_in', 'check_out',
        'project_id', 'remarks', 'marked_by',
    ];

    protected function casts(): array
    {
        return ['date' => 'date'];
    }

    protected $appends = ['hours_worked'];

    public function employee(): BelongsTo
    {
        return $this->belongsTo(Employee::class);
    }

    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class);
    }

    /** DERIVED: hours from check-in/out, else inferred from status. */
    public function getHoursWorkedAttribute(): float
    {
        if ($this->check_in && $this->check_out) {
            $mins = strtotime($this->check_out) - strtotime($this->check_in);
            return round(max($mins, 0) / 3600, 2);
        }

        return match ($this->status) {
            'present'  => 8.0,
            'half_day' => 4.0,
            default    => 0.0,   // absent, on_leave, holiday
        };
    }
}