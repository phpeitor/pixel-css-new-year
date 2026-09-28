<?php

declare(strict_types=1);

header('X-Content-Type-Options: nosniff');
header('Cache-Control: no-store');

function respondWithError(int $status, string $message): void
{
    http_response_code($status);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode(['error' => $message], JSON_UNESCAPED_UNICODE);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    header('Allow: POST');
    respondWithError(405, 'Método no permitido.');
}

if (!isset($_FILES['image']) || !is_array($_FILES['image'])) {
    respondWithError(400, 'Adjunta una imagen para convertir.');
}

$image = $_FILES['image'];
if ($image['error'] !== UPLOAD_ERR_OK || !is_uploaded_file($image['tmp_name'])) {
    respondWithError(400, 'No se pudo recibir la imagen.');
}

if ($image['size'] < 1 || $image['size'] > 10 * 1024 * 1024) {
    respondWithError(413, 'La imagen debe pesar menos de 10 MB.');
}

$mimeType = (new finfo(FILEINFO_MIME_TYPE))->file($image['tmp_name']);
$allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
if (!in_array($mimeType, $allowedMimeTypes, true)) {
    respondWithError(415, 'Formato no admitido. Usa PNG, JPG, GIF o WebP.');
}

$resolution = filter_input(INPUT_POST, 'resolution', FILTER_VALIDATE_INT);
$colors = filter_input(INPUT_POST, 'colors', FILTER_VALIDATE_INT);
if ($resolution === false || $resolution === null || $resolution < 16 || $resolution > 48) {
    respondWithError(400, 'La resolución debe estar entre 16 y 48 píxeles.');
}
if ($colors === false || $colors === null || $colors < 4 || $colors > 16) {
    respondWithError(400, 'La paleta debe tener entre 4 y 16 colores.');
}

$imageContents = file_get_contents($image['tmp_name']);
if ($imageContents === false) {
    respondWithError(400, 'No se pudo leer la imagen.');
}

$url = sprintf(
    'http://127.0.0.1:8765/pixelate?resolution=%d&colors=%d',
    $resolution,
    $colors,
);
$curl = curl_init($url);
curl_setopt_array($curl, [
    CURLOPT_POST => true,
    CURLOPT_POSTFIELDS => $imageContents,
    CURLOPT_HTTPHEADER => [
        'Content-Type: ' . $mimeType,
        'Accept: image/png',
    ],
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_CONNECTTIMEOUT => 2,
    CURLOPT_TIMEOUT => 30,
]);

$result = curl_exec($curl);
$status = (int) curl_getinfo($curl, CURLINFO_RESPONSE_CODE);
$contentType = (string) curl_getinfo($curl, CURLINFO_CONTENT_TYPE);
$curlError = curl_errno($curl);
curl_close($curl);

if ($result === false || $curlError !== 0) {
    respondWithError(503, 'El servicio local de conversión no está iniciado.');
}

if ($status !== 200 || !str_starts_with($contentType, 'image/png')) {
    respondWithError(502, 'El servicio local no pudo convertir la imagen.');
}

http_response_code(200);
header('Content-Type: image/png');
echo $result;
