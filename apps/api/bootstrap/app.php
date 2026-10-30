<?php

use App\Http\Middleware\RequestContext;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpKernel\Exception\HttpExceptionInterface;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(web: __DIR__.'/../routes/web.php', commands: __DIR__.'/../routes/console.php', health: '/up')
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->redirectGuestsTo(fn (Request $request) => config('app.web_url').'/login');
        $middleware->append(RequestContext::class);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        $exceptions->shouldRenderJsonWhen(fn (Request $request, Throwable $e) => $request->is('api/*') || $request->expectsJson());
        $exceptions->render(function (Throwable $e, Request $request) {
            if (! $request->is('api/*')) {
                return null;
            }
            $status = match (true) {
                $e instanceof ValidationException => 422,$e instanceof AuthenticationException => 401,$e instanceof AuthorizationException => 403,$e instanceof ModelNotFoundException => 404,$e instanceof HttpExceptionInterface => $e->getStatusCode(),default => 500
            };
            $code = match ($status) {
                401 => 'UNAUTHENTICATED',403 => 'FORBIDDEN',404 => 'NOT_FOUND',419 => 'CSRF_MISMATCH',422 => 'VALIDATION_ERROR',429 => 'RATE_LIMITED',default => 'INTERNAL_ERROR'
            };
            $message = match ($status) {
                401 => 'Please log in to continue.',403 => 'You do not have permission for this action.',404 => 'The requested resource was not found.',419 => 'Your session expired. Please refresh and try again.',422 => $e->getMessage(),429 => 'Too many attempts. Please try again later.',default => 'An unexpected error occurred.'
            };

            return response()->json(['error' => ['code' => $code, 'message' => $message, 'details' => $e instanceof ValidationException ? $e->errors() : (object) []], 'request_id' => $request->attributes->get('request_id') ?? (string) Str::uuid()], $status);
        });
    })->create();
