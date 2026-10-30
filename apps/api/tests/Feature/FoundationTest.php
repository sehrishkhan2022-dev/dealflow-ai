<?php

namespace Tests\Feature;

use App\Domain\Workspaces\CreateWorkspace;
use App\Models\User;
use App\Models\Workspace;
use Illuminate\Auth\Notifications\ResetPassword;
use Illuminate\Auth\Notifications\VerifyEmail;
use Illuminate\Database\QueryException;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Facades\Redis;
use Illuminate\Support\Facades\URL;
use Illuminate\Support\Str;
use Tests\TestCase;

class FoundationTest extends TestCase
{
    use RefreshDatabase;

    private function workspace(User $user, string $name = 'Example'): Workspace
    {
        return app(CreateWorkspace::class)->execute($user, ['name' => $name, 'region' => 'US', 'timezone' => 'UTC']);
    }

    public function test_registration_hashes_password_and_requests_verification(): void
    {
        Notification::fake();
        $this->postJson('/api/v1/auth/register', ['name' => 'Taylor', 'email' => 'taylor@example.test', 'password' => 'SecurePassword123', 'password_confirmation' => 'SecurePassword123'])->assertCreated()->assertJsonMissingPath('user.password');
        $user = User::firstOrFail();
        $this->assertTrue(Hash::check('SecurePassword123', $user->password));
        $this->assertNull($user->email_verified_at);
        Notification::assertSentTo($user, VerifyEmail::class);
        $this->getJson('/api/v1/me')->assertOk()->assertJsonCount(0, 'workspaces');
    }

    public function test_invalid_registration_returns_standard_error(): void
    {
        $this->postJson('/api/v1/auth/register', ['email' => 'bad', 'password' => 'short'])->assertUnprocessable()->assertJsonPath('error.code', 'VALIDATION_ERROR')->assertJsonStructure(['request_id', 'error' => ['details']]);
    }

    public function test_authentication_login_logout_and_wrong_password(): void
    {
        $user = User::factory()->create(['password' => 'SecurePassword123']);
        $this->getJson('/api/v1/me')->assertUnauthorized();
        $this->postJson('/api/v1/auth/login', ['email' => $user->email, 'password' => 'wrong'])->assertUnprocessable();
        $this->postJson('/api/v1/auth/login', ['email' => $user->email, 'password' => 'SecurePassword123'])->assertOk();
        $this->getJson('/api/v1/me')->assertOk();
        $this->postJson('/api/v1/auth/logout')->assertOk();
        $this->getJson('/api/v1/me')->assertUnauthorized();
    }

    public function test_verified_owner_can_create_workspace_without_client_role_override(): void
    {
        $user = User::factory()->create();
        $response = $this->actingAs($user)->postJson('/api/v1/workspaces', ['name' => 'Studio', 'region' => 'UK', 'timezone' => 'Europe/London', 'terms_accepted' => true, 'role' => 'admin', 'is_demo' => true]);
        $response->assertCreated()->assertJsonPath('is_demo', false);
        $this->assertDatabaseHas('workspace_members', ['user_id' => $user->id, 'workspace_id' => $response->json('id'), 'role' => 'owner']);
    }

    public function test_unverified_user_cannot_create_workspace(): void
    {
        $this->actingAs(User::factory()->unverified()->create())->postJson('/api/v1/workspaces', ['name' => 'Studio', 'region' => 'US', 'timezone' => 'UTC', 'terms_accepted' => true])->assertForbidden();
    }

    public function test_workspace_validation_rejects_invalid_timezone_and_terms(): void
    {
        $this->actingAs(User::factory()->create())->postJson('/api/v1/workspaces', ['name' => 'Studio', 'region' => 'US', 'timezone' => 'Invalid/Zone', 'terms_accepted' => false])->assertUnprocessable();
        $this->assertDatabaseCount('workspaces', 0);
    }

    public function test_two_tenants_cannot_read_each_others_workspace_or_members(): void
    {
        $alice = User::factory()->create();
        $bob = User::factory()->create();
        $a = $this->workspace($alice, 'Alpha');
        $b = $this->workspace($bob, 'Beta');
        $this->actingAs($alice)->getJson('/api/v1/me')->assertJsonCount(1, 'workspaces')->assertJsonPath('workspaces.0.id', $a->id);
        $this->getJson('/api/v1/workspaces/'.$b->id)->assertNotFound();
        $this->getJson('/api/v1/workspaces/'.$b->id.'/members')->assertNotFound();
        $this->actingAs($bob)->getJson('/api/v1/workspaces/'.$a->id)->assertNotFound();
        $this->getJson('/api/v1/workspaces/'.$a->id.'/members')->assertNotFound();
    }

    public function test_role_boundary_for_member_list(): void
    {
        $owner = User::factory()->create();
        $viewer = User::factory()->create();
        $workspace = $this->workspace($owner);
        $workspace->members()->attach($viewer->id, ['id' => (string) Str::uuid(), 'role' => 'viewer']);
        $this->actingAs($viewer)->getJson('/api/v1/workspaces/'.$workspace->id)->assertOk();
        $this->getJson('/api/v1/workspaces/'.$workspace->id.'/members')->assertForbidden();
        $this->actingAs($owner)->getJson('/api/v1/workspaces/'.$workspace->id.'/members')->assertOk()->assertJsonCount(2);
    }

    public function test_roles_match_documented_permissions(): void
    {
        $owner = User::factory()->create();
        $ws = $this->workspace($owner);
        foreach (['admin' => true, 'sales_manager' => true, 'sales_agent' => false, 'viewer' => false] as $role => $allowed) {
            $user = User::factory()->create();
            $ws->members()->attach($user->id, ['id' => (string) Str::uuid(), 'role' => $role]);
            $this->actingAs($user)->getJson('/api/v1/workspaces/'.$ws->id.'/members')->assertStatus($allowed ? 200 : 403);
        }
    }

    public function test_duplicate_membership_is_rejected_by_database(): void
    {
        $owner = User::factory()->create();
        $ws = $this->workspace($owner);
        $this->expectException(QueryException::class);
        $ws->members()->attach($owner->id, ['id' => (string) Str::uuid(), 'role' => 'viewer']);
    }

    public function test_signed_email_verification_and_tampering(): void
    {
        $user = User::factory()->unverified()->create();
        $url = URL::temporarySignedRoute('verification.verify', now()->addMinutes(60), ['id' => $user->id, 'hash' => sha1($user->email)], absolute: false);
        $this->actingAs($user)->get($url.'&tampered=true')->assertForbidden();
        $this->get($url)->assertRedirect();
        $this->assertTrue($user->fresh()->hasVerifiedEmail());
    }

    public function test_password_reset_requires_valid_token(): void
    {
        Notification::fake();
        $user = User::factory()->create();
        $this->postJson('/api/v1/auth/forgot-password', ['email' => $user->email])->assertOk();
        Notification::assertSentTo($user, ResetPassword::class);
        $payload = ['email' => $user->email, 'token' => 'invalid', 'password' => 'NewSecurePassword123', 'password_confirmation' => 'NewSecurePassword123'];
        $this->postJson('/api/v1/auth/reset-password', $payload)->assertUnprocessable();
        $payload['token'] = Password::createToken($user);
        $this->postJson('/api/v1/auth/reset-password', $payload)->assertOk();
        $this->assertTrue(Hash::check('NewSecurePassword123', $user->fresh()->password));
    }

    public function test_login_is_rate_limited(): void
    {
        for ($i = 0; $i < 5; $i++) {
            $this->postJson('/api/v1/auth/login', ['email' => 'absent@example.test', 'password' => 'incorrect'])->assertUnprocessable();
        }$this->postJson('/api/v1/auth/login', ['email' => 'absent@example.test', 'password' => 'incorrect'])->assertStatus(429)->assertJsonPath('error.code', 'RATE_LIMITED');
    }

    public function test_demo_seeding_is_repeatable_and_marked(): void
    {
        config(['app.demo_password' => 'LocalDemoPassword123']);
        $this->seed();
        $this->seed();
        $this->assertDatabaseCount('workspaces', 1);
        $this->assertDatabaseCount('workspace_members', 2);
        $this->assertTrue(Workspace::firstOrFail()->is_demo);
    }

    public function test_health_does_not_require_a_session_or_issue_csrf_cookies(): void
    {
        Redis::shouldReceive('ping')->once()->andReturn('PONG');
        $this->getJson('/api/v1/health')->assertOk()->assertJsonPath('status', 'ok')->assertCookieMissing('XSRF-TOKEN')->assertCookieMissing('dealflow-ai-session');
    }

    public function test_health_reports_a_dependency_outage_without_details(): void
    {
        Redis::shouldReceive('ping')->once()->andThrow(new \RuntimeException('Internal connection details'));
        $this->getJson('/api/v1/health')->assertStatus(503)->assertJsonPath('error.code', 'SERVICE_UNAVAILABLE')->assertDontSee('Internal connection details');
    }
}
