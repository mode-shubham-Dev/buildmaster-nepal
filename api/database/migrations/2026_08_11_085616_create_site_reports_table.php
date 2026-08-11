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
        Schema::create('site_reports', function (Blueprint $table) {
            $table->id();
            $table->foreignId('project_id')->constrained()->cascadeOnDelete();
            $table->foreignId('reported_by')->nullable()->constrained('users')->nullOnDelete();

            $table->date('report_date');
            $table->text('work_done');                          // narrative of the day
            $table->unsignedInteger('workers_present')->default(0);
            $table->string('weather')->nullable();              // sunny, rainy, cloudy
            $table->unsignedTinyInteger('progress_percentage')->nullable();  // 0–100
            $table->text('materials_used')->nullable();
            $table->text('issues')->nullable();                 // problems / safety incidents
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('site_reports');
    }
};
