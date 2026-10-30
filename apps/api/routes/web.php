<?php

use App\Http\Controllers\Api\V1\AuthController;
use App\Http\Controllers\Api\V1\HealthController;
use App\Http\Controllers\Api\V1\WorkspaceController;
use Illuminate\Foundation\Http\Middleware\ValidateCsrfToken;
use Illuminate\Session\Middleware\StartSession;
use Illuminate\Support\Facades\Route;
use Illuminate\View\Middleware\ShareErrorsFromSession;

Route::prefix('api/v1')->group(function () {
    Route::get('/csrf', fn () => response()->json(['message' => 'CSRF cookie set.']));
    Route::get('/health', HealthController::class)->withoutMiddleware([StartSession::class, ShareErrorsFromSession::class, ValidateCsrfToken::class]);
    Route::middleware('throttle:auth')->group(function () {
        Route::post('/auth/register', [AuthController::class, 'register']);
        Route::post('/auth/login', [AuthController::class, 'login']);
        Route::post('/auth/forgot-password', [AuthController::class, 'forgot']);
        Route::post('/auth/reset-password', [AuthController::class, 'reset']);
    });
    Route::middleware(['auth', 'auth.session'])->group(function () {
        Route::get('/me', [AuthController::class, 'me']);
        Route::post('/auth/logout', [AuthController::class, 'logout']);
        Route::post('/auth/verification-notification', [AuthController::class, 'resend'])->middleware('throttle:6,1');
        Route::get('/auth/verify-email/{id}/{hash}', [AuthController::class, 'verify'])->middleware(['signed:relative', 'throttle:6,1'])->name('verification.verify');
        Route::post('/workspaces', [WorkspaceController::class, 'store']);
        Route::get('/workspaces/{workspaceId}', [WorkspaceController::class, 'show'])->whereUuid('workspaceId');
        Route::get('/workspaces/{workspaceId}/members', [WorkspaceController::class, 'members'])->whereUuid('workspaceId');
    });
});
