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
        Schema::create('materials', function (Blueprint $table) {
            $table->id();
            $table->foreignId('material_category_id')->nullable()->constrained()->nullOnDelete();

            $table->string('code')->unique();          // MAT-0001
            $table->string('name');                    // "OPC Cement 53 Grade"
            $table->text('description')->nullable();
            $table->string('unit');                    // "bag", "kg", "cum", "nos"
            $table->decimal('unit_cost', 15, 2)->default(0);   // standard cost per unit
            $table->decimal('reorder_level', 12, 3)->default(0); // low-stock threshold
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('materials');
    }
};
