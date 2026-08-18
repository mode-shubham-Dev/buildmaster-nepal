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
        Schema::create('ra_bills', function (Blueprint $table) {
            $table->id();
            $table->foreignId('project_id')->constrained()->cascadeOnDelete();
            $table->unsignedInteger('bill_no');               // sequential per project: 1, 2, 3...
            $table->date('bill_date');

            // ALL backend-computed money (frozen once approved)
            $table->decimal('gross_amount', 15, 2)->default(0);        // sum of line amounts (this bill)
            $table->decimal('retention_percentage', 5, 2)->default(5); // held back %
            $table->decimal('retention_amount', 15, 2)->default(0);
            $table->decimal('vat_percentage', 5, 2)->default(13);
            $table->decimal('vat_amount', 15, 2)->default(0);
            $table->decimal('advance_recovery', 15, 2)->default(0);    // deduct advance given
            $table->decimal('net_payable', 15, 2)->default(0);

            $table->enum('status', ['draft', 'submitted', 'approved', 'paid'])->default('draft');

            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('approved_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('approved_at')->nullable();
            $table->text('remarks')->nullable();

            $table->timestamps();

            $table->unique(['project_id', 'bill_no']); 
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('ra_bills');
    }
};
