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
        Schema::create('attachments', function (Blueprint $table) {
            $table->id();

            // Polymorphic columns — these let an attachment belong to ANY model.
            // attachable_type = the model class (e.g. "App\Models\Milestone")
            // attachable_id   = that record's id
            $table->morphs('attachable');

            $table->foreignId('uploaded_by')->nullable()->constrained('users')->nullOnDelete();

            $table->string('collection')->default('default');  // group files: "images", "documents"
            $table->string('original_name');                    // what the user named it
            $table->string('path');                             // where it's stored
            $table->string('mime_type')->nullable();
            $table->unsignedBigInteger('size')->default(0);     // bytes
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('attachments');
    }
};
