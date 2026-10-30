<?php

require dirname(__DIR__).'/vendor/autoload.php';

// Docker-injected variables also appear in $_SERVER. Keep PHPUnit's forced
// test values authoritative in both adapters before Laravel reads config.
foreach (['APP_ENV', 'APP_MAINTENANCE_DRIVER', 'BCRYPT_ROUNDS', 'BROADCAST_CONNECTION', 'CACHE_STORE', 'DB_CONNECTION', 'DB_DATABASE', 'DB_URL', 'MAIL_MAILER', 'QUEUE_CONNECTION', 'SESSION_DRIVER'] as $name) {
    if (isset($_ENV[$name])) {
        $_SERVER[$name] = $_ENV[$name];
    }
}
