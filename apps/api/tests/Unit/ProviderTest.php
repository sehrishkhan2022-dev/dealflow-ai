<?php

namespace Tests\Unit;

use App\Domain\Providers\DisabledProvider;
use PHPUnit\Framework\TestCase;

class ProviderTest extends TestCase
{
    public function test_mock_is_explicitly_disconnected(): void
    {
        $this->assertSame(['mode' => 'mock', 'connected' => false, 'sending_enabled' => false], (new DisabledProvider)->status());
    }

    public function test_sending_is_impossible(): void
    {
        $this->expectException(\LogicException::class);
        (new DisabledProvider)->send(['body' => 'Do not send']);
    }

    public function test_ai_calls_are_disabled(): void
    {
        $this->expectException(\LogicException::class);
        (new DisabledProvider)->generate([]);
    }

    public function test_payments_are_disabled(): void
    {
        $this->expectException(\LogicException::class);
        (new DisabledProvider)->checkout();
    }
}
