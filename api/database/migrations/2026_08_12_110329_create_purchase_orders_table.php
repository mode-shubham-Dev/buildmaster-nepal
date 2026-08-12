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
        Schema::create('purchase_orders', function (Blueprint $table) {
            $table->id();
            $table->string('po_number')->unique();          // PO-2081-0001
            $table->foreignId('supplier_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('warehouse_id')->nullable()->constrained()->nullOnDelete(); // where goods land
            $table->foreignId('project_id')->nullable()->constrained()->nullOnDelete();   // optional project link

            // The state machine
            $table->enum('status', [
                'draft',
                'submitted',
                'approved',
                'received',
                'rejected',
                'cancelled',
            ])->default('draft');

            // Money — ALL backend-computed
            $table->decimal('subtotal', 15, 2)->default(0);
            $table->decimal('vat_percentage', 5, 2)->default(13);  // Nepal VAT 13%
            $table->decimal('vat_amount', 15, 2)->default(0);
            $table->decimal('total', 15, 2)->default(0);

            $table->date('order_date')->nullable();
            $table->date('expected_delivery')->nullable();
            $table->text('notes')->nullable();

            // Workflow audit trail
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('approved_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('approved_at')->nullable();
            $table->timestamp('received_at')->nullable();

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('purchase_orders');
    }
};
