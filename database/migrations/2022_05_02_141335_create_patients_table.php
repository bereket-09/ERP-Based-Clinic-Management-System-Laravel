<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('patients', function (Blueprint $table) {
            $table->id();
            $table->string('stud_id')->unique();
            $table->string('mrn')->unique();
            $table->string('name')->nullable;
            $table->string('gender')->nullable;
            $table->date('birthday')->nullable;
            $table->string('dept')->nullable;
            $table->string('block')->nullable;
            $table->integer('dorm')->nullable;
            $table->integer('year')->nullable;
            $table->string('address')->nullable;
            $table->string('region')->nullable;
            $table->string('phone')->nullable;
            $table->string('nationality')->nullable;
            $table->string('bloodtype')->nullable;


            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('patients');
    }
};
