<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Same `->nullable` (no parens) typo affected the departements table, leaving
 * `desc` and `status` NOT NULL. Restore the intended nullability without data loss.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('departements', function (Blueprint $table) {
            $table->longText('desc')->nullable()->change();
            $table->string('status')->nullable()->change();
        });
    }

    public function down(): void
    {
        // no-op (see patients nullable migration)
    }
};
