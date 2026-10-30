<?php

namespace App\Domain\Providers;

interface ProviderGateway
{
    public function status(): array;

    public function send(array $message): never;

    public function generate(array $evidence): never;

    public function checkout(): never;
}
