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
        Schema::create('settings', function (Blueprint $table) {
            $table->id();

            // Company identity (used on bills, documents, reports)
            $table->string('company_name')->default('BuildMaster Nepal');
            $table->string('company_address')->nullable();
            $table->string('pan_vat_no')->nullable();          // PAN/VAT registration
            $table->string('phone')->nullable();
            $table->string('email')->nullable();

            // Financial defaults (billing/purchases read these)
            $table->decimal('default_vat_percentage', 5, 2)->default(13);
            $table->decimal('default_retention_percentage', 5, 2)->default(5);
            $table->string('currency_symbol')->default('Rs.');

            // Fiscal year — Nepal runs Shrawan–Ashar. Store the BS start month/day.
            $table->unsignedTinyInteger('fiscal_year_start_month')->default(4);  // 4 = Shrawan (BS month index)
            $table->unsignedTinyInteger('fiscal_year_start_day')->default(1);

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('settings');
    }
};
