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
        Schema::create('equipment', function (Blueprint $table) {
            $table->id();
            $table->string('code')->unique();               // EQP-0001
            $table->string('name');                         // "CAT 320 Excavator"
            $table->string('category')->nullable();         // "Earthmoving", "Concrete", "Power"
            $table->enum('ownership', ['owned', 'rented'])->default('owned');

            // cost means different things per ownership
            $table->decimal('purchase_cost', 15, 2)->nullable();   // if owned
            $table->decimal('rental_rate', 15, 2)->nullable();     // if rented (per month/day)
            $table->date('purchase_date')->nullable();

            $table->enum('status', ['available', 'in_use', 'maintenance', 'retired'])
                  ->default('available');

            // current location — nullable. See note: assignment-history table
            // would slot in here later if Module 27 needs utilization reports.
            $table->foreignId('project_id')->nullable()->constrained()->nullOnDelete();

            $table->text('notes')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('equipment');
    }
};
