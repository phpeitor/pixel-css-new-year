<?php

declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');

$patterns = require __DIR__ . '/patterns.php';
$animalId = isset($_GET['animal']) ? trim((string) $_GET['animal']) : '';

if ($animalId === '') {
    $animals = [];

    foreach ($patterns as $id => $pattern) {
        $animals[] = [
            'id' => $id,
            'name' => $pattern['name'],
            'emoji' => $pattern['emoji'],
        ];
    }

    echo json_encode(['animals' => $animals], JSON_UNESCAPED_UNICODE | JSON_THROW_ON_ERROR);
    exit;
}

if (!array_key_exists($animalId, $patterns)) {
    http_response_code(404);
    echo json_encode(['error' => 'El animal seleccionado no está disponible.'], JSON_UNESCAPED_UNICODE);
    exit;
}

$pattern = $patterns[$animalId];
$matrix = $pattern['matrix'];
$palette = $pattern['palette'];
$height = count($matrix);
$width = strlen($matrix[0]);
$pixelSize = $pattern['pixelSize'] ?? 12;
$shadows = [];

foreach ($matrix as $rowIndex => $row) {
    if (strlen($row) !== $width) {
        http_response_code(500);
        echo json_encode(['error' => 'El patrón solicitado no es válido.'], JSON_UNESCAPED_UNICODE);
        exit;
    }

    for ($columnIndex = 0; $columnIndex < $width; $columnIndex++) {
        $symbol = $row[$columnIndex];

        if ($symbol === '.') {
            continue;
        }

        if (!array_key_exists($symbol, $palette)) {
            http_response_code(500);
            echo json_encode(['error' => 'La paleta del patrón está incompleta.'], JSON_UNESCAPED_UNICODE);
            exit;
        }

        $x = $columnIndex * $pixelSize;
        $y = $rowIndex * $pixelSize;
        $shadows[] = sprintf('%dpx %dpx 0 %s', $x, $y, $palette[$symbol]);
    }
}

echo json_encode([
    'id' => $animalId,
    'name' => $pattern['name'],
    'emoji' => $pattern['emoji'],
    'width' => $width,
    'height' => $height,
    'pixelSize' => $pixelSize,
    'boxShadow' => implode(', ', $shadows),
], JSON_UNESCAPED_UNICODE | JSON_THROW_ON_ERROR);
