<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class PettyCashFund extends Model
{
    protected $fillable = ['name', 'project_id', 'custodian_id', 'is_active'];
    protected function casts(): array { return ['is_active' => 'boolean']; }

    protected $appends = ['balance', 'total_topups', 'total_spent'];

    public function project(): BelongsTo { return $this->belongsTo(Project::class); }
    public function custodian(): BelongsTo { return $this->belongsTo(Employee::class, 'custodian_id'); }
    public function topups(): HasMany { return $this->hasMany(PettyCashTopup::class); }
    public function expenses(): HasMany { return $this->hasMany(Expense::class); }

    /** DERIVED: total money added to the fund. */
    public function getTotalTopupsAttribute(): float
    {
        return (float) ($this->relationLoaded('topups') ? $this->topups->sum('amount') : $this->topups()->sum('amount'));
    }

    /** DERIVED: total APPROVED expenses drawn from the fund. */
    public function getTotalSpentAttribute(): float
    {
        if ($this->relationLoaded('expenses')) {
            return (float) $this->expenses->where('status', 'approved')->sum('amount');
        }
        return (float) $this->expenses()->where('status', 'approved')->sum('amount');
    }

    /** DERIVED: available balance. */
    public function getBalanceAttribute(): float
    {
        return round($this->total_topups - $this->total_spent, 2);
    }
}