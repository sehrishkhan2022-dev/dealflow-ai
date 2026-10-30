<?php

namespace App\Policies;

use App\Models\User;
use App\Models\Workspace;

class WorkspacePolicy
{
    public function view(User $user, Workspace $workspace): bool
    {
        return $user->workspaces()->whereKey($workspace->id)->exists();
    }

    public function viewMembers(User $user, Workspace $workspace): bool
    {
        return $user->workspaces()->whereKey($workspace->id)->wherePivotIn('role', ['owner', 'admin', 'sales_manager'])->exists();
    }

    public function manage(User $user, Workspace $workspace): bool
    {
        return $user->workspaces()->whereKey($workspace->id)->wherePivotIn('role', ['owner', 'admin'])->exists();
    }
}
