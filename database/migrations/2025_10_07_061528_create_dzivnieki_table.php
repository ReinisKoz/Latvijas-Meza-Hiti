<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('dzivnieki', function (Blueprint $table) {
            $table->id();
            $table->string('nosaukums');
            $table->string('bilde')->nullable();  // saite uz bildi
            $table->string('audio')->nullable();  // saite uz skaņu
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('dzivnieki');
    }
};
