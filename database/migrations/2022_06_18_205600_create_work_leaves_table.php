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
        Schema::create('work_leaves', function (Blueprint $table) {
            $table->id();
            $table->string('u_id')->nullable();
            $table->date('from')->nullable();
            $table->date('to')->nullable();
            $table->longText('desc')->nullable();
            $table->longText('comment')->nullable();
            $table->string('status')->nullable();
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
        Schema::dropIfExists('work_leaves');
    }
};
