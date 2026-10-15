<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, X-Requested-With');
header('Content-Type: application/json; charset=UTF-8');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

$raw = file_get_contents('php://input');
$body = json_decode($raw, true) ?: [];

$amountNum = isset($body['amount']) ? (float)$body['amount'] : 3390;
$validAmount = ($amountNum == 10) ? '10.00' : '3390.00';

$description = !empty($body['description']) ? $body['description'] : (
    $amountNum == 10
        ? 'Тестовый платёж 10 ₽ (Курс Пармастера banya-school.ru)'
        : 'Курс Пармастера: Путь к Мастерству (Тариф Мастер PRO)'
);

$userId = !empty($body['userId']) ? $body['userId'] : 'guest';
$userEmail = !empty($body['userEmail']) ? $body['userEmail'] : 'guest@banya-school.ru';

$shopId = '1485718';
$secretKey = 'live_pko1h4rfqyVG9Un0_S8qJAHmitTEhR6u2od3psGUd5s';

$idempotenceKey = sprintf(
    '%04x%04x-%04x-%04x-%04x-%04x%04x%04x',
    mt_rand(0, 0xffff), mt_rand(0, 0xffff),
    mt_rand(0, 0xffff),
    mt_rand(0, 0x0fff) | 0x4000,
    mt_rand(0, 0x3fff) | 0x8000,
    mt_rand(0, 0xffff), mt_rand(0, 0xffff), mt_rand(0, 0xffff)
);

$host = !empty($_SERVER['HTTP_HOST']) ? $_SERVER['HTTP_HOST'] : 'banya-school.ru';
$isHttps = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') || (isset($_SERVER['SERVER_PORT']) && $_SERVER['SERVER_PORT'] == 443);
$protocol = $isHttps ? 'https' : 'http';
$returnUrl = "{$protocol}://{$host}/?payment=success&orderId={$idempotenceKey}&amount={$validAmount}";

$payload = [
    'amount' => [
        'value' => $validAmount,
        'currency' => 'RUB'
    ],
    'capture' => true,
    'confirmation' => [
        'type' => 'redirect',
        'return_url' => $returnUrl
    ],
    'description' => $description,
    'metadata' => [
        'userId' => $userId,
        'userEmail' => $userEmail,
        'isTest' => ($amountNum == 10)
    ]
];

$payloadJson = json_encode($payload);

$ch = curl_init('https://api.yookassa.ru/v3/payments');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, $payloadJson);
curl_setopt($ch, CURLOPT_USERPWD, "{$shopId}:{$secretKey}");
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Content-Type: application/json',
    "Idempotence-Key: {$idempotenceKey}"
]);
curl_setopt($ch, CURLOPT_TIMEOUT, 15);
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, true);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$curlErr = curl_error($ch);
curl_close($ch);

if ($response === false) {
    http_response_code(500);
    echo json_encode(['error' => 'Curl error to YooKassa: ' . $curlErr]);
    exit;
}

$data = json_decode($response, true);
if ($httpCode >= 200 && $httpCode < 300) {
    $confUrl = isset($data['confirmation']['confirmation_url']) ? $data['confirmation']['confirmation_url'] : null;
    echo json_encode([
        'success' => true,
        'paymentId' => isset($data['id']) ? $data['id'] : null,
        'status' => isset($data['status']) ? $data['status'] : 'pending',
        'confirmationUrl' => $confUrl,
        'orderId' => $idempotenceKey,
        'amount' => $validAmount
    ]);
} else {
    http_response_code($httpCode ?: 500);
    echo json_encode([
        'error' => isset($data['description']) ? $data['description'] : 'YooKassa API Error',
        'details' => $data
    ]);
}
