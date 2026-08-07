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
        Schema::create('projects', function (Blueprint $table) {
            $table->id();

            // Links (all optional-ish for flexibility)
            $table->foreignId('client_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('tender_id')->nullable()->constrained()->nullOnDelete();  // came from a won tender
            $table->foreignId('project_manager_id')->nullable()->constrained('employees')->nullOnDelete();

            // Identity
            $table->string('project_code')->unique();      // PRJ-0001
            $table->string('name');
            $table->text('description')->nullable();

            // Money
            $table->decimal('budget', 15, 2)->nullable();          // what we plan to spend
            $table->decimal('contract_value', 15, 2)->nullable();  // what the client pays us

            // Timeline
            $table->date('start_date')->nullable();
            $table->date('end_date')->nullable();

            // Site
            $table->string('site_location')->nullable();
            $table->string('latitude')->nullable();
            $table->string('longitude')->nullable();

            // Lifecycle
            $table->enum('status', [
                'planning',
                'approval',
                'execution',
                'monitoring',
                'completion',
                'archived',
            ])->default('planning');

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('projects');
    }
};
