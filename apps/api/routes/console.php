<?php

use App\Jobs\VerifyQueue;
use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Str;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

Artisan::command('dealflow:queue-probe', function () {
    $probe = (string) Str::uuid();
    VerifyQueue::dispatch($probe);
    for ($attempt = 0; $attempt < 20; $attempt++) {
        if (Cache::get('queue-probe:'.$probe) === 'completed') {
            $this->info('Redis-backed queue job completed.');

            return 0;
        }
        usleep(250000);
    }
    $this->error('Queue worker did not acknowledge the probe.');

    return 1;
})->purpose('Verify a worker can process a harmless job without provider side effects');
