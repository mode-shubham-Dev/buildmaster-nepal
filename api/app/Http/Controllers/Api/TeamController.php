<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Team\StoreTeamRequest;
use App\Http\Requests\Team\UpdateTeamRequest;
use App\Models\Team;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TeamController extends Controller
{
    /**
     * GET /teams — list teams, optionally filtered by department.
     * e.g. /teams?department_id=1
     */
    public function index(Request $request): JsonResponse
    {
        $teams = Team::with('department')
            ->when($request->department_id, fn ($q) => $q->where('department_id', $request->department_id))
            ->latest()
            ->get();

        return response()->json(['teams' => $teams]);
    }

    /**
     * POST /teams
     */
    public function store(StoreTeamRequest $request): JsonResponse
    {
        $team = Team::create($request->validated());

        return response()->json([
            'message' => 'Team created successfully.',
            'team'    => $team,
        ], 201);
    }

    /**
     * PUT /teams/{team}
     */
    public function update(UpdateTeamRequest $request, Team $team): JsonResponse
    {
        $team->update($request->validated());

        return response()->json([
            'message' => 'Team updated successfully.',
            'team'    => $team,
        ]);
    }

    /**
     * DELETE /teams/{team}
     */
    public function destroy(Team $team): JsonResponse
    {
        $team->delete();

        return response()->json(['message' => 'Team deleted successfully.']);
    }
}