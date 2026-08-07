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
        Schema::create('tenders', function (Blueprint $table) {
            $table->id();

            // Which client/agency issued this tender (optional link to Module 6)
            $table->foreignId('client_id')->nullable()->constrained()->nullOnDelete();

            $table->string('title');
            $table->string('reference_no')->nullable();       // tender/notice reference
            $table->string('issuing_authority')->nullable();  // if not a tracked client

            $table->decimal('estimated_value', 15, 2)->nullable();   // project's estimated worth
            $table->decimal('bid_amount', 15, 2)->nullable();        // OUR bid amount
            $table->decimal('bid_security', 15, 2)->nullable();      // bid bond / earnest money

            $table->date('published_date')->nullable();
            $table->date('submission_deadline')->nullable();
            $table->date('submitted_date')->nullable();

            // The pipeline stage
            $table->enum('status', [
                'identified',   // spotted the opportunity
                'preparing',    // working on the bid
                'submitted',    // bid submitted, awaiting result
                'won',          // we won it
                'lost',         // we lost it
                'cancelled',    // tender cancelled
            ])->default('identified');

            $table->text('scope')->nullable();       // work scope summary
            $table->text('notes')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tenders');
    }
};
