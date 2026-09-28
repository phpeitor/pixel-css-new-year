<?php

declare(strict_types=1);

function appConfig(): array
{
    static $config = null;
    if ($config !== null) {
        return $config;
    }

    $defaults = [
        'PYTHON_SERVICE_URL' => 'http://127.0.0.1:8765',
        'PYTHON_HEALTH_PATH' => '/health',
        'PYTHON_REMOVE_BACKGROUND_PATH' => '/remove-background',
        'PYTHON_PIXELATE_PATH' => '/pixelate',
        'PYTHON_CONNECT_TIMEOUT' => '2',
        'PYTHON_REMOVE_BACKGROUND_TIMEOUT' => '120',
        'PYTHON_PIXELATE_TIMEOUT' => '30',
    ];

    $envValues = [];
    $envPath = dirname(__DIR__) . DIRECTORY_SEPARATOR . '.env';
    if (is_readable($envPath)) {
        foreach (file($envPath, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES) ?: [] as $line) {
            $line = trim($line);
            if ($line === '' || str_starts_with($line, '#') || !str_contains($line, '=')) {
                continue;
            }

            [$key, $value] = explode('=', $line, 2);
            $key = trim($key);
            $value = trim($value);
            if (strlen($value) >= 2 && (($value[0] === '"' && str_ends_with($value, '"')) || ($value[0] === "'" && str_ends_with($value, "'")))) {
                $value = substr($value, 1, -1);
            }
            $envValues[$key] = $value;
        }
    }

    $config = [];
    foreach ($defaults as $key => $default) {
        $processValue = getenv($key);
        $config[$key] = $processValue !== false
            ? $processValue
            : ($envValues[$key] ?? $default);
    }

    return $config;
}

function pythonServiceEndpoint(string $path): string
{
    $config = appConfig();
    return rtrim($config['PYTHON_SERVICE_URL'], '/') . '/' . ltrim($path, '/');
}
