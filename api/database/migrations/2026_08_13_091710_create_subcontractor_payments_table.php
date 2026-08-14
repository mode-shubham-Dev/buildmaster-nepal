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
        Schema::create('subcontractor_payments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('work_package_id')->constrained()->cascadeOnDelete();

            $table->decimal('amount', 15, 2);               // this payment
            $table->date('payment_date');
            $table->enum('method', ['cash', 'bank_transfer', 'cheque'])->default('bank_transfer');
            $table->string('reference')->nullable();        // cheque no, txn id
            $table->text('remarks')->nullable();
            $table->foreignId('paid_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('subcontractor_payments');
    }
};
