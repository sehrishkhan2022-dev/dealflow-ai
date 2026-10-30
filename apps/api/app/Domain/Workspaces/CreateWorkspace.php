<?php

namespace App\Domain\Workspaces;

use App\Models\User;
use App\Models\Workspace;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class CreateWorkspace
{
    public function execute(User $owner, array $data): Workspace
    {
        return DB::transaction(function () use ($owner, $data) {
            $workspace = Workspace::create(['name' => $data['name'], 'slug' => Str::slug($data['name']).'-'.Str::lower(Str::random(8)), 'region' => $data['region'], 'timezone' => $data['timezone']]);
            $workspace->members()->attach($owner->id, ['id' => (string) Str::uuid(), 'role' => 'owner']);

            return $workspace;
        });
    }
}
