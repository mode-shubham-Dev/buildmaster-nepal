<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Payslip extends Model
{
    protected $fillable = [
        'payroll_run_id', 'employee_id',
        'basic_salary', 'total_allowances', 'overtime_amount', 'gross_pay',
        'unpaid_leave_deduction', 'tax_amount', 'other_deductions', 'total_deductions',
        'net_pay', 'unpaid_leave_days', 'tax_rate',
    ];

    protected function casts(): array
    {
        return [
            'basic_salary'           => 'decimal:2',
            'total_allowances'       => 'decimal:2',
            'overtime_amount'        => 'decimal:2',
            'gross_pay'              => 'decimal:2',
            'unpaid_leave_deduction' => 'decimal:2',
            'tax_amount'             => 'decimal:2',
            'other_deductions'       => 'decimal:2',
            'total_deductions'       => 'decimal:2',
            'net_pay'                => 'decimal:2',
            'tax_rate'               => 'decimal:2',
        ];
    }

    public function payrollRun(): BelongsTo
    {
        return $this->belongsTo(PayrollRun::class);
    }

    public function employee(): BelongsTo
    {
        return $this->belongsTo(Employee::class);
    }

    public function lines(): HasMany
    {
        return $this->hasMany(PayslipLine::class);
    }
}