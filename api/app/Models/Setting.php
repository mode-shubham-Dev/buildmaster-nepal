<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Setting extends Model
{
    protected $fillable = [
        'company_name', 'company_address', 'pan_vat_no', 'phone', 'email',
        'default_vat_percentage', 'default_retention_percentage', 'currency_symbol',
        'fiscal_year_start_month', 'fiscal_year_start_day',
    ];

    protected function casts(): array
    {
        return [
            'default_vat_percentage'        => 'decimal:2',
            'default_retention_percentage'  => 'decimal:2',
        ];
    }

    /** The single settings row — create with defaults if missing. */
    public static function current(): self
    {
        return static::firstOrCreate(['id' => 1]);
    }
}