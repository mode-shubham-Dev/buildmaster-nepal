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

            // Purchase Workflow (Module 14)
            'purchases.view', 'purchases.create', 'purchases.approve', 'purchases.receive',

            // Subcontractors (Module 16)
            'subcontractors.view', 'subcontractors.manage', 'subcontractors.pay',

            // Equipment (Module 17)
            'equipment.view', 'equipment.manage',

            // Vehicles (Module 18)
            'vehicles.view', 'vehicles.manage',

            // Attendance & leave (Module 19)
            'attendance.view', 'attendance.mark', 'attendance.manage',
            'leave.view', 'leave.request', 'leave.approve',

            // Payroll (Module 21) — money-critical, strong separation of duties
            'payroll.view', 'payroll.process', 'payroll.finalize',

            // Expenses & Petty Cash (Module 22)
            'expenses.view', 'expenses.create', 'expenses.approve',

            // BOQ & Estimation (Module 9)
            'boq.view', 'boq.create', 'boq.update', 'boq.delete',

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
            'boq.view', 'boq.create', 'boq.update', 'boq.delete',
            'materials.view', 'warehouse.view',
            'purchases.view', 'purchases.create', 'purchases.approve', 'purchases.receive',
            'subcontractors.view', 'subcontractors.manage', 'subcontractors.pay',
            'equipment.view', 'equipment.manage',
            'vehicles.view', 'vehicles.manage',
            'attendance.view', 'attendance.mark', 'leave.view', 'leave.request', 'leave.approve',
            'payroll.view', 'payroll.process', 'payroll.finalize',
            'expenses.view', 'expenses.create', 'expenses.approve',
            'dashboard.view', 'analytics.view',
        ]);

        // Project Manager
        $pm = Role::firstOrCreate(['name' => 'Project Manager', 'guard_name' => 'web']);
        $pm->syncPermissions([
            'employees.view', 'clients.view',
            'tenders.view', 'tenders.create', 'tenders.update', 'tenders.delete',
            'projects.view', 'projects.create', 'projects.update',
            'boq.view', 'boq.create', 'boq.update', 'boq.delete',
            'reports.view', 'reports.create',
            'materials.view', 'warehouse.view',
            'purchases.view', 'purchases.create', 'purchases.approve',
            'subcontractors.view', 'subcontractors.manage',
            'equipment.view', 'equipment.manage',
            'vehicles.view', 'vehicles.manage',
            'attendance.view', 'attendance.mark', 'leave.view', 'leave.request', 'leave.approve',
            'expenses.view', 'expenses.create', 'expenses.approve',
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
            'leave.view', 'leave.request',
            'expenses.view', 'expenses.create',
            'dashboard.view',
        ]);

        // Store Manager
        $store = Role::firstOrCreate(['name' => 'Store Manager', 'guard_name' => 'web']);
        $store->syncPermissions([
            'materials.view', 'materials.manage',
            'warehouse.view', 'warehouse.manage',
            'purchases.view', 'purchases.create', 'purchases.receive',
            'equipment.view', 'equipment.manage',
            'vehicles.view', 'vehicles.manage',
            'leave.view', 'leave.request',
            'expenses.view', 'expenses.create',
            'dashboard.view',
        ]);

        // Accountant
        $accountant = Role::firstOrCreate(['name' => 'Accountant', 'guard_name' => 'web']);
        $accountant->syncPermissions([
            'clients.view',
            'boq.view',
            'purchases.view',
            'subcontractors.view', 'subcontractors.pay',
            'payroll.view', 'payroll.process', 'payroll.finalize',
            'expenses.view', 'expenses.create', 'expenses.approve',
            'leave.view', 'leave.request',
            'dashboard.view', 'analytics.view',
        ]);

        // HR Manager
        $hr = Role::firstOrCreate(['name' => 'HR Manager', 'guard_name' => 'web']);
        $hr->syncPermissions([
            'employees.view', 'employees.create', 'employees.update', 'employees.delete',
            'attendance.view', 'attendance.mark', 'attendance.manage',
            'leave.view', 'leave.request', 'leave.approve',
            'payroll.view', 'payroll.process',
            'expenses.view', 'expenses.create',
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