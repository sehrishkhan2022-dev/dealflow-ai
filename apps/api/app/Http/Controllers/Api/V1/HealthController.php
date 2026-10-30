<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Redis;

class HealthController extends Controller
{
    public function __invoke()
    {
        try {
            DB::select('select 1');
            Redis::ping();

            return response()->json(['status' => 'ok', 'database' => 'ok', 'redis' => 'ok', 'providers' => 'mock']);
        } catch (\Throwable $e) {
            return response()->json(['error' => ['code' => 'SERVICE_UNAVAILABLE', 'message' => 'A required service is unavailable.', 'details' => (object) []], 'request_id' => request()->attributes->get('request_id')], 503);
        }
    }
}
