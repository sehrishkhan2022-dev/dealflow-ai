<?php

namespace App\Providers;

use App\Domain\Providers\DisabledProvider;
use App\Domain\Providers\ProviderGateway;
use Illuminate\Auth\Notifications\ResetPassword;
use Illuminate\Auth\Notifications\VerifyEmail;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Facades\URL;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->app->bind(ProviderGateway::class, DisabledProvider::class);
    }

    public function boot(): void
    {
        RateLimiter::for('auth', fn (Request $request) => [Limit::perMinute(10)->by($request->ip()), Limit::perMinute(5)->by(hash('sha256', strtolower((string) $request->input('email')).'|'.$request->ip()))]);
        ResetPassword::createUrlUsing(fn ($user, string $token) => config('app.web_url').'/reset-password?token='.$token.'&email='.urlencode($user->email));
        VerifyEmail::createUrlUsing(fn ($user) => config('app.web_url').URL::temporarySignedRoute('verification.verify', now()->addMinutes(60), ['id' => $user->id, 'hash' => sha1($user->getEmailForVerification())], absolute: false));
    }
}
