<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class DocumentCategory extends Model
{
    protected $fillable = ['name', 'color', 'is_active'];
    protected function casts(): array { return ['is_active' => 'boolean']; }

    public function documents(): HasMany { return $this->hasMany(Document::class); }
}