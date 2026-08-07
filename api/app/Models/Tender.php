<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Spatie\Activitylog\Models\Concerns\LogsActivity;
use Spatie\Activitylog\Support\LogOptions;

class Tender extends Model
{
    use LogsActivity;

    protected $fillable = [
        'client_id',
        'title',
        'reference_no',
        'issuing_authority',
        'estimated_value',
        'bid_amount',
        'bid_security',
        'published_date',
        'submission_deadline',
        'submitted_date',
        'status',
        'scope',
        'notes',
    ];

    protected function casts(): array
    {
        return [
            'estimated_value'     => 'decimal:2',
            'bid_amount'          => 'decimal:2',
            'bid_security'        => 'decimal:2',
            'published_date'      => 'date',
            'submission_deadline' => 'date',
            'submitted_date'      => 'date',
        ];
    }

    public function client(): BelongsTo
    {
        return $this->belongsTo(Client::class);
    }

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logOnly(['title', 'status', 'bid_amount', 'estimated_value'])
            ->logOnlyDirty()
            ->dontLogEmptyChanges();
    }
}