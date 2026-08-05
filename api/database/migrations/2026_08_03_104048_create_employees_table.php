<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('employees', function (Blueprint $table) {
            $table->id();

            // OPTIONAL link to a login account. nullable = employee may not log in.
            // nullOnDelete = if the user account is deleted, keep the employee but blank the link.
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();

            // Which department they work in (from Module 4). nullable in case unassigned.
            $table->foreignId('department_id')->nullable()->constrained()->nullOnDelete();

            // Personal info
            $table->string('employee_code')->unique();   // e.g. EMP-0001
            $table->string('first_name');
            $table->string('last_name');
            $table->string('email')->nullable();
            $table->string('phone')->nullable();
            $table->date('date_of_birth')->nullable();
            $table->enum('gender', ['male', 'female', 'other'])->nullable();
            $table->text('address')->nullable();

            // Employment info
            $table->string('job_title')->nullable();
            $table->enum('employment_type', ['full_time', 'part_time', 'contract', 'daily_wage'])
                  ->default('full_time');
            $table->date('joining_date')->nullable();
            $table->decimal('basic_salary', 12, 2)->nullable();  // stored as decimal (money)
            $table->enum('status', ['active', 'inactive', 'terminated'])->default('active');

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('employees');
    }
};
