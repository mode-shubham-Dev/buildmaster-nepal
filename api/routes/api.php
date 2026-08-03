<?php

use App\Http\Controllers\Api\Auth\AuthController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\CompanyController;
use App\Http\Controllers\Api\BranchController;
use App\Http\Controllers\Api\DepartmentController;
use App\Http\Controllers\Api\TeamController;
use App\Http\Controllers\Api\OfficeLocationController;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->group(function () {

    // Public
    Route::post('/login', [AuthController::class, 'login']);

    // Protected
    Route::middleware('auth:sanctum')->group(function () {

        // Auth
        Route::post('/logout', [AuthController::class, 'logout']);
        Route::get('/me', [AuthController::class, 'me']);

        // Roles list
        Route::get('/roles', [UserController::class, 'roles']);

        // User management
        Route::get('/users', [UserController::class, 'index'])->middleware('permission:users.view');
        Route::post('/users', [UserController::class, 'store'])->middleware('permission:users.create');
        Route::put('/users/{user}/role', [UserController::class, 'updateRole'])->middleware('permission:roles.assign');
        Route::delete('/users/{user}', [UserController::class, 'destroy'])->middleware('permission:users.delete');

        /*
        |------------------------------------------------------------------
        | Module 4 — Company & Branch Management
        |------------------------------------------------------------------
        */

        // Company (singleton) — view needs company.view, edit needs company.manage
        Route::get('/company', [CompanyController::class, 'show'])->middleware('permission:company.view');
        Route::put('/company', [CompanyController::class, 'update'])->middleware('permission:company.manage');

        // Branches
        Route::get('/branches', [BranchController::class, 'index'])->middleware('permission:company.view');
        Route::post('/branches', [BranchController::class, 'store'])->middleware('permission:company.manage');
        Route::put('/branches/{branch}', [BranchController::class, 'update'])->middleware('permission:company.manage');
        Route::delete('/branches/{branch}', [BranchController::class, 'destroy'])->middleware('permission:company.manage');

        // Departments
        Route::get('/departments', [DepartmentController::class, 'index'])->middleware('permission:company.view');
        Route::post('/departments', [DepartmentController::class, 'store'])->middleware('permission:company.manage');
        Route::put('/departments/{department}', [DepartmentController::class, 'update'])->middleware('permission:company.manage');
        Route::delete('/departments/{department}', [DepartmentController::class, 'destroy'])->middleware('permission:company.manage');

        // Teams
        Route::get('/teams', [TeamController::class, 'index'])->middleware('permission:company.view');
        Route::post('/teams', [TeamController::class, 'store'])->middleware('permission:company.manage');
        Route::put('/teams/{team}', [TeamController::class, 'update'])->middleware('permission:company.manage');
        Route::delete('/teams/{team}', [TeamController::class, 'destroy'])->middleware('permission:company.manage');

        // Office Locations
        Route::get('/office-locations', [OfficeLocationController::class, 'index'])->middleware('permission:company.view');
        Route::post('/office-locations', [OfficeLocationController::class, 'store'])->middleware('permission:company.manage');
        Route::put('/office-locations/{officeLocation}', [OfficeLocationController::class, 'update'])->middleware('permission:company.manage');
        Route::delete('/office-locations/{officeLocation}', [OfficeLocationController::class, 'destroy'])->middleware('permission:company.manage');
    });

});