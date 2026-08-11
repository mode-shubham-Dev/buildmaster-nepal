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
        Schema::create('boq_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('project_id')->constrained()->cascadeOnDelete();

            $table->string('category')->nullable();       // optional grouping: "Earthwork", "Concrete"
            $table->string('item_code')->nullable();       // optional ref like "1.1", "2.3"
            $table->text('description');                   // "PCC 1:2:4 for foundation"
            $table->string('unit');                        // "cum", "sqm", "kg", "nos"
            $table->decimal('quantity', 12, 3);            // 3 decimals — quantities can be fractional
            $table->decimal('rate', 15, 2);                // price per unit
            $table->decimal('amount', 15, 2)->default(0);  // quantity × rate — BACKEND computes this
            $table->integer('sort_order')->default(0);     // for ordering within the BOQ
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('boq_items');
    }
};
