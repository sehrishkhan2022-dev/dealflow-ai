<?php

namespace App\Http\Controllers\Api\V1;

use App\Domain\Workspaces\CreateWorkspace;
use App\Http\Controllers\Controller;
use App\Http\Requests\WorkspaceRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;

class WorkspaceController extends Controller
{
    public function store(WorkspaceRequest $request, CreateWorkspace $service)
    {
        return response()->json($service->execute($request->user(), $request->validated()), 201);
    }

    public function show(Request $request, string $workspaceId)
    {
        $workspace = $request->user()->workspaces()->whereKey($workspaceId)->firstOrFail();
        Gate::authorize('view', $workspace);

        return response()->json($workspace);
    }

    public function members(Request $request, string $workspaceId)
    {
        $workspace = $request->user()->workspaces()->whereKey($workspaceId)->firstOrFail();
        Gate::authorize('viewMembers', $workspace);

        return response()->json($workspace->members()->orderBy('name')->get()->map(fn ($u) => ['id' => $u->id, 'name' => $u->name, 'email' => $u->email, 'role' => $u->pivot->role]));
    }
}
