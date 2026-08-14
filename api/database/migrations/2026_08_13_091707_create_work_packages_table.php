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
        Schema::create('work_packages', function (Blueprint $table) {
            $table->id();
            $table->foreignId('subcontractor_id')->constrained()->cascadeOnDelete();
            $table->foreignId('project_id')->constrained()->cascadeOnDelete();

            $table->string('title');                        // "Electrical wiring - Block A"
            $table->text('scope')->nullable();
            $table->decimal('contract_amount', 15, 2);      // agreed value — the basis for balance
            $table->date('start_date')->nullable();
            $table->date('end_date')->nullable();
            $table->unsignedTinyInteger('progress_percentage')->default(0);
            $table->enum('status', ['assigned', 'in_progress', 'completed', 'terminated'])
                  ->default('assigned');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('work_packages');
    }
};
