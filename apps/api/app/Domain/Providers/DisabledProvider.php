<?php

namespace App\Domain\Providers;

class DisabledProvider implements ProviderGateway
{
    public function status(): array
    {
        return ['mode' => 'mock', 'connected' => false, 'sending_enabled' => false];
    }

    public function send(array $message): never
    {
        throw new \LogicException('Outbound sending is disabled in Phase 0.');
    }

    public function generate(array $evidence): never
    {
        throw new \LogicException('AI generation is disabled in Phase 0.');
    }

    public function checkout(): never
    {
        throw new \LogicException('Billing is disabled in Phase 0.');
    }
}
