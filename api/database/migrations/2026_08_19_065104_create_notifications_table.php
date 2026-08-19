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
        Schema::create('notifications', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('type');                    // "leave.approved", "expense.rejected"
            $table->string('title');
            $table->string('body')->nullable();
            $table->string('link')->nullable();        // deep-link, e.g. "/leave"
            $table->string('icon')->nullable();        // optional UI hint
            $table->timestamp('read_at')->nullable();  // null = unread
            $table->timestamps();

            $table->index(['user_id', 'read_at']);  
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('notifications');
    }
};
