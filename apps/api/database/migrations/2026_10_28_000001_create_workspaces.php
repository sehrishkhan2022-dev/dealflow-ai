<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('workspaces', function (Blueprint $t) {
            $t->uuid('id')->primary();
            $t->string('name', 100);
            $t->string('slug')->unique();
            $t->string('region', 2);
            $t->string('timezone', 100);
            $t->string('status')->default('active');
            $t->boolean('is_demo')->default(false);
            $t->timestamps();
        });
        Schema::create('workspace_members', function (Blueprint $t) {
            $t->uuid('id')->primary();
            $t->foreignUuid('workspace_id')->constrained()->cascadeOnDelete();
            $t->foreignUuid('user_id')->constrained()->cascadeOnDelete();
            $t->enum('role', ['owner', 'admin', 'sales_manager', 'sales_agent', 'viewer']);
            $t->timestamps();
            $t->unique(['workspace_id', 'user_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('workspace_members');
        Schema::dropIfExists('workspaces');
    }
};
