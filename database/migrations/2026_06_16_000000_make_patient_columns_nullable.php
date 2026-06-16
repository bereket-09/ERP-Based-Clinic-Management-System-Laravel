<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * The original create_patients_table migration used `->nullable` (property access,
 * a no-op) instead of `->nullable()` (the method). As a result every column was
 * created NOT NULL, which made patient registration fail with an integrity-
 * constraint violation whenever an optional field was left blank.
 *
 * This migration restores the intended nullability without dropping data.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('patients', function (Blueprint $table) {
            $table->string('name')->nullable()->change();
            $table->string('gender')->nullable()->change();
            $table->date('birthday')->nullable()->change();
            $table->string('dept')->nullable()->change();
            $table->string('block')->nullable()->change();
            $table->integer('dorm')->nullable()->change();
            $table->integer('year')->nullable()->change();
            $table->string('address')->nullable()->change();
            $table->string('region')->nullable()->change();
            $table->string('phone')->nullable()->change();
            $table->string('nationality')->nullable()->change();
            $table->string('bloodtype')->nullable()->change();
        });
    }

    public function down(): void
    {
        // Intentionally left as a no-op: reverting to NOT NULL could fail on
        // existing rows that legitimately contain null values.
    }
};
