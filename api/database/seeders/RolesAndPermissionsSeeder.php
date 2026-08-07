<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class RolesAndPermissionsSeeder extends Seeder
{
    public function run(): void
    {
        // Reset cached roles and permissions
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        /*
        |--------------------------------------------------------------------
        | 1. Define all permissions, grouped by module.
        | Convention: "module.action" (view, create, update, delete, plus
        | any module-specific actions like "payroll.process").
        | As we build each module, we add its permissions to this list.
        |--------------------------------------------------------------------
        */
        $permissions = [
            // User & access management
            'users.view', 'users.create', 'users.update', 'users.delete',
            'roles.view', 'roles.assign',

            // Company management
            'company.view', 'company.manage',

            // Employees
            'employees.view', 'employees.create', 'employees.update', 'employees.delete',

            // Clients
            'clients.view', 'clients.create', 'clients.update', 'clients.delete',

            // Tenders (Module 7)
            'tenders.view', 'tenders.create', 'tenders.update', 'tenders.delete',

            // Projects
            'projects.view', 'projects.create', 'projects.update', 'projects.delete',

            // Site reports
            'reports.view', 'reports.create',

            // Materials & inventory
            'materials.view', 'materials.manage',
            'warehouse.view', 'warehouse.manage',

            // Purchases
            'purchases.view', 'purchases.create', 'purchases.approve',

            // Attendance & leave
            'attendance.view', 'attendance.manage',
            'leave.view', 'leave.request', 'leave.approve',

            // Payroll & finance
            'payroll.view', 'payroll.process',
            'expenses.view', 'expenses.create',

            // Dashboards & analytics
            'dashboard.view',
            'analytics.view',
        ];

        foreach ($permissions as $permission) {
            Permission::firstOrCreate(['name' => $permission, 'guard_name' => 'web']);
        }

        /*
        |--------------------------------------------------------------------
        | 2. Define the 8 roles and the permissions each one gets.
        |--------------------------------------------------------------------
        */

        // Super Admin — gets EVERYTHING (handled specially below)
        $superAdmin = Role::firstOrCreate(['name' => 'Super Admin', 'guard_name' => 'web']);
        $superAdmin->syncPermissions(Permission::all());

        // CEO / Director — full visibility, high-level control
        $ceo = Role::firstOrCreate(['name' => 'CEO', 'guard_name' => 'web']);
        $ceo->syncPermissions([
            'users.view', 'company.view', 'company.manage',
            'employees.view', 'clients.view',
            'tenders.view', 'tenders.create', 'tenders.update', 'tenders.delete',
            'projects.view', 'reports.view',
            'materials.view', 'warehouse.view',
            'purchases.view', 'purchases.approve',
            'attendance.view', 'leave.view', 'leave.approve',
            'payroll.view', 'expenses.view',
            'dashboard.view', 'analytics.view',
        ]);

        // Project Manager
        $pm = Role::firstOrCreate(['name' => 'Project Manager', 'guard_name' => 'web']);
        $pm->syncPermissions([
            'employees.view', 'clients.view',
            'tenders.view', 'tenders.create', 'tenders.update', 'tenders.delete',
            'projects.view', 'projects.create', 'projects.update',
            'reports.view', 'reports.create',
            'materials.view', 'warehouse.view',
            'purchases.view', 'purchases.create', 'purchases.approve',
            'attendance.view', 'leave.view', 'leave.approve',
            'expenses.view', 'expenses.create',
            'dashboard.view',
        ]);

        // Site Engineer
        $engineer = Role::firstOrCreate(['name' => 'Site Engineer', 'guard_name' => 'web']);
        $engineer->syncPermissions([
            'projects.view',
            'reports.view', 'reports.create',
            'materials.view',
            'purchases.create',
            'attendance.view',
            'leave.request',
            'dashboard.view',
        ]);

        // Store Manager
        $store = Role::firstOrCreate(['name' => 'Store Manager', 'guard_name' => 'web']);
        $store->syncPermissions([
            'materials.view', 'materials.manage',
            'warehouse.view', 'warehouse.manage',
            'purchases.view', 'purchases.create',
            'leave.request',
            'dashboard.view',
        ]);

        // Accountant
        $accountant = Role::firstOrCreate(['name' => 'Accountant', 'guard_name' => 'web']);
        $accountant->syncPermissions([
            'clients.view',
            'purchases.view',
            'payroll.view', 'payroll.process',
            'expenses.view', 'expenses.create',
            'leave.request',
            'dashboard.view', 'analytics.view',
        ]);

        // HR Manager
        $hr = Role::firstOrCreate(['name' => 'HR Manager', 'guard_name' => 'web']);
        $hr->syncPermissions([
            'employees.view', 'employees.create', 'employees.update', 'employees.delete',
            'attendance.view', 'attendance.manage',
            'leave.view', 'leave.approve',
            'payroll.view',
            'dashboard.view',
        ]);

        // Client — very limited, external-facing
        $client = Role::firstOrCreate(['name' => 'Client', 'guard_name' => 'web']);
        $client->syncPermissions([
            'projects.view',
            'reports.view',
            'dashboard.view',
        ]);
    }
}