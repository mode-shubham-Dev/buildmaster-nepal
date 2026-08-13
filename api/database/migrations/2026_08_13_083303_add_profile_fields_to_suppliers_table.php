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
        Schema::table('suppliers', function (Blueprint $table) {
            $table->string('category')->nullable()->after('name');        // "Cement", "Steel", "General"
            $table->unsignedTinyInteger('rating')->nullable()->after('is_active'); // 1–5
            $table->string('payment_terms')->nullable()->after('rating'); // "Net 30", "Advance"
            $table->string('bank_name')->nullable()->after('payment_terms');
            $table->string('bank_account')->nullable()->after('bank_name');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('suppliers', function (Blueprint $table) {
            $table->dropColumn(['category', 'rating', 'payment_terms', 'bank_name', 'bank_account']);
        });
    }
};
