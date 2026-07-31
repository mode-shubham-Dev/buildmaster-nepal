<?php

use App\Http\Controllers\Api\Auth\AuthController;
use App\Http\Controllers\Api\UserController;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->group(function () {

    // Public routes
    Route::post('/login', [AuthController::class, 'login']);

    // Protected routes (require a valid token)
    Route::middleware('auth:sanctum')->group(function () {

        // Auth
        Route::post('/logout', [AuthController::class, 'logout']);
        Route::get('/me', [AuthController::class, 'me']);

        // Roles list (any authenticated user can read role names for dropdowns)
        Route::get('/roles', [UserController::class, 'roles']);

        // User management — each route guarded by a specific permission
        Route::get('/users', [UserController::class, 'index'])
            ->middleware('permission:users.view');

        Route::post('/users', [UserController::class, 'store'])
            ->middleware('permission:users.create');

        Route::put('/users/{user}/role', [UserController::class, 'updateRole'])
            ->middleware('permission:roles.assign');

        Route::delete('/users/{user}', [UserController::class, 'destroy'])
            ->middleware('permission:users.delete');
    });

});