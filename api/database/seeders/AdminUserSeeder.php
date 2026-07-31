<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class AdminUserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $admin = User::firstOrCreate(
            ['email' => 'admin@buildmaster.test'],
            [
                'name' => 'Shubham Admin',
                'password' => 'password123'
            ]
        );

        if (! $admin->hasRole('Super Admin')){
            $admin->assignRole('Super Admin');
        }
    }
}
