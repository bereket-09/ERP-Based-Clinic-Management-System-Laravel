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
        Schema::create('visits', function (Blueprint $table) {
            $table->id();
            $table->integer('p_id');
            $table->integer('doc_id');
            $table->longText('symptoms')->nullable();
            $table->longText('diagnosis')->nullable();
            $table->longText('deasease')->nullable();
            $table->integer('lab_order_id')->nullable();
            $table->integer('lab_result_id')->nullable();
            $table->integer('order_drug_id')->nullable();
            $table->string('statues')->nullable();

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
        Schema::dropIfExists('visits');
    }
};
