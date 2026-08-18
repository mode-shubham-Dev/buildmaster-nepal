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
        Schema::create('ra_bill_lines', function (Blueprint $table) {
            $table->id();
            $table->foreignId('ra_bill_id')->constrained()->cascadeOnDelete();
            $table->foreignId('boq_item_id')->constrained()->cascadeOnDelete();

            // The cumulative approach: store cumulative-to-date; the rest is derived.
            $table->decimal('cumulative_qty', 12, 3);         // total qty completed to date for this item
            $table->decimal('previous_qty', 12, 3)->default(0); // qty billed in prior bills (snapshot)
            $table->decimal('this_bill_qty', 12, 3)->default(0);// cumulative − previous (backend-computed)
            $table->decimal('rate', 15, 2);                    // snapshot of BOQ rate at bill time
            $table->decimal('amount', 15, 2)->default(0);      // this_bill_qty × rate (backend-computed)

            $table->timestamps();

            $table->unique(['ra_bill_id', 'boq_item_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('ra_bill_lines');
    }
};
