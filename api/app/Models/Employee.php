<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Spatie\Activitylog\Models\Concerns\LogsActivity;
use Spatie\Activitylog\Support\LogOptions;

class Employee extends Model
{
    use LogsActivity;

    protected $fillable = [
        'user_id',
        'department_id',
        'employee_code',
        'first_name',
        'last_name',
        'email',
        'phone',
        'date_of_birth',
        'gender',
        'address',
        'job_title',
        'employment_type',
        'joining_date',
        'basic_salary',
        'status',
    ];

    protected function casts(): array
    {
        return [
            'date_of_birth' => 'date',
            'joining_date'  => 'date',
            'basic_salary'  => 'decimal:2',
        ];
    }

    // Links UP to a login account (optional) and a department
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function department(): BelongsTo
    {
        return $this->belongsTo(Department::class);
    }

    // Owns MANY of these child records
    public function emergencyContacts(): HasMany
    {
        return $this->hasMany(EmergencyContact::class);
    }

    public function skills(): HasMany
    {
        return $this->hasMany(EmployeeSkill::class);
    }

    public function certifications(): HasMany
    {
        return $this->hasMany(Certification::class);
    }

    // Convenience accessor: full name from first + last
    public function getFullNameAttribute(): string
    {
        return "{$this->first_name} {$this->last_name}";
    }

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logOnly(['first_name', 'last_name', 'job_title', 'status', 'basic_salary'])
            ->logOnlyDirty()
            ->dontLogEmptyChanges();
    }
}