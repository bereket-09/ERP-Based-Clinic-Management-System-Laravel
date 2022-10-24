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
        Schema::create('medcines', function (Blueprint $table) {
            $table->id();
            $table->string('name')->nullable();
            $table->string('qty')->nullable();
            $table->string('price')->nullable();
            $table->string('reciptNo')->nullable();
            $table->string('bno')->nullable();
            $table->date('expdate')->nullable();
            $table->string('manufactor')->nullable();
            $table->string('catagory')->nullable();
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
        Schema::dropIfExists('medcines');
    }
};
