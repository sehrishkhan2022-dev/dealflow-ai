<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Workspace;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        if (! app()->environment(['local', 'testing'])) {
            throw new \RuntimeException('Demo seeding is restricted to local/testing.');
        }
        $password = config('app.demo_password');
        if (! $password || strlen($password) < 12) {
            throw new \RuntimeException('Set DEMO_PASSWORD to a local password of at least 12 characters.');
        }
        foreach ([['owner@demo.dealflow.test', 'Alex Morgan', 'owner'], ['viewer@demo.dealflow.test', 'Jordan Lee', 'viewer']] as [$email,$name,$role]) {
            $user = User::firstOrCreate(['email' => $email], ['name' => $name, 'password' => $password]);
            $user->forceFill(['email_verified_at' => now()])->save();
            $workspace = Workspace::firstOrCreate(['slug' => 'demo-studio'], ['name' => 'Demo Studio', 'region' => 'US', 'timezone' => 'America/New_York']);
            $workspace->forceFill(['is_demo' => true])->save();
            $workspace->members()->syncWithoutDetaching([$user->id => ['id' => (string) Str::uuid(), 'role' => $role]]);
        }
    }
}
