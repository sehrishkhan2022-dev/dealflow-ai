<?php

namespace Tests;

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Testing\TestCase as BaseTestCase;

abstract class TestCase extends BaseTestCase
{
    public function createApplication(): Application
    {
        $app = parent::createApplication();
        $database = $app['config']->get('database.connections.'.$app['config']->get('database.default').'.database');
        if (! $app->environment('testing') || ($database !== ':memory:' && ! str_ends_with($database, '_test'))) {
            throw new \RuntimeException('Tests require an isolated _test database or in-memory SQLite.');
        }
        $app['config']->set('app.key', 'base64:'.base64_encode(random_bytes(32)));

        return $app;
    }
}
