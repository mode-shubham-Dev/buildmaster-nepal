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
        Schema::create('vehicles', function (Blueprint $table) {
            $table->id();
            $table->string('registration_no')->unique();    // "BA 2 KHA 1234"
            $table->string('make')->nullable();             // "Tata"
            $table->string('model')->nullable();            // "LPT 1109"
            $table->string('type')->nullable();             // "Tipper", "Pickup", "Truck"
            $table->enum('ownership', ['owned', 'rented'])->default('owned');
            $table->decimal('purchase_cost', 15, 2)->nullable();
            $table->decimal('rental_rate', 15, 2)->nullable();
            $table->enum('status', ['available', 'in_use', 'maintenance', 'retired'])
                  ->default('available');
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
        Schema::dropIfExists('vehicles');
    }
};
