<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Workspace extends Model
{
    use HasUuids;

    protected $attributes = ['is_demo' => false, 'status' => 'active'];

    protected $fillable = ['name', 'slug', 'region', 'timezone'];

    protected function casts(): array
    {
        return ['is_demo' => 'boolean'];
    }

    public function members(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'workspace_members')->withPivot('role')->withTimestamps();
    }
}
