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
        Schema::create('petty_cash_topups', function (Blueprint $table) {
            $table->id();
            $table->foreignId('petty_cash_fund_id')->constrained()->cascadeOnDelete();
            $table->decimal('amount', 12, 2);
            $table->date('topup_date');
            $table->string('remarks')->nullable();
            $table->foreignId('added_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('petty_cash_topups');
    }
};
