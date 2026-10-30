<?php

namespace App\Jobs;

use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Cache;

class VerifyQueue implements ShouldQueue
{
    use Queueable;

    public function __construct(public string $probe) {}

    public function handle(): void
    {
        Cache::put('queue-probe:'.$this->probe, 'completed', 60);
    }
}
