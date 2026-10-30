FROM php:8.4-cli
RUN apt-get update && apt-get install -y libpq-dev libzip-dev unzip git libicu-dev libsqlite3-dev libonig-dev libxml2-dev && docker-php-ext-install pdo_pgsql pdo_sqlite pcntl intl zip mbstring dom xml xmlwriter && rm -rf /var/lib/apt/lists/*
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer
WORKDIR /app
CMD ["php", "artisan", "serve", "--host=0.0.0.0", "--port=8000", "--no-reload"]
