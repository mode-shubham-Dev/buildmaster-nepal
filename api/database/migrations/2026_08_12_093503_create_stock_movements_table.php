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
        Schema::create('stock_movements', function (Blueprint $table) {
            $table->id();
            $table->foreignId('warehouse_id')->constrained()->cascadeOnDelete();
            $table->foreignId('material_id')->constrained()->cascadeOnDelete();

            $table->enum('type', ['in', 'out']);            // direction of movement
            $table->decimal('quantity', 12, 3);             // always POSITIVE; 'type' gives direction
            $table->decimal('unit_cost', 15, 2)->nullable();// cost at time of movement (for valuation)

            $table->enum('reason', [
                'purchase',           // stock came in from a purchase
                'issue_to_project',   // issued out to site/project
                'return',             // returned to store
                'adjustment',         // correction (in or out)
                'transfer',           // moved between warehouses
            ]);

            $table->foreignId('project_id')->nullable()->constrained()->nullOnDelete(); // if issued to a project
            $table->string('reference')->nullable();        // PO no, note, etc.
            $table->text('remarks')->nullable();
            $table->foreignId('moved_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('moved_at')->useCurrent();    // when the movement happened

            $table->timestamps();

            // Indexes — we'll query balances by warehouse+material constantly
            $table->index(['warehouse_id', 'material_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('stock_movements');
    }
};
