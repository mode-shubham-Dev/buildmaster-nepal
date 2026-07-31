<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\User\StoreUserRequest;
use App\Http\Requests\User\UpdateUserRoleRequest;
use App\Http\Resources\UserResource;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Spatie\Permission\Models\Role;

class UserController extends Controller
{
    /**
     * GET /users — list all users with their roles.
     */
    public function index(): JsonResponse
    {
        $users = User::with('roles')->latest()->get();

        return response()->json([
            'users' => UserResource::collection($users),
        ]);
    }

    /**
     * POST /users — create a new user and assign a role.
     */
    public function store(StoreUserRequest $request): JsonResponse
    {
        $data = $request->validated();

        $user = User::create([
            'name'     => $data['name'],
            'email'    => $data['email'],
            'password' => $data['password'],
        ]);

        $user->assignRole($data['role']);

        return response()->json([
            'message' => 'User created successfully.',
            'user'    => new UserResource($user),
        ], 201);
    }

    /**
     * PUT /users/{user}/role — change a user's role.
     */
    public function updateRole(UpdateUserRoleRequest $request, User $user): JsonResponse
    {
        $user->syncRoles([$request->validated()['role']]);

        return response()->json([
            'message' => 'User role updated successfully.',
            'user'    => new UserResource($user),
        ]);
    }

    /**
     * DELETE /users/{user}
     */
    public function destroy(User $user): JsonResponse
    {
        $user->delete();

        return response()->json(['message' => 'User deleted successfully.']);
    }

    /**
     * GET /roles — list all roles (for populating dropdowns in the UI).
     */
    public function roles(): JsonResponse
    {
        return response()->json([
            'roles' => Role::pluck('name'),
        ]);
    }
}