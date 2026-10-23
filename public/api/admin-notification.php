<?php
declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');

$allowedOrigins = [
    'https://banya-school.ru',
    'https://www.banya-school.ru',
    'http://localhost:3000',
    'http://127.0.0.1:3000',
];
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if ($origin !== '' && !in_array($origin, $allowedOrigins, true)) {
    http_response_code(403);
    echo json_encode(['error' => 'Origin not allowed'], JSON_UNESCAPED_UNICODE);
    exit;
}
if ($origin !== '') {
    header('Access-Control-Allow-Origin: ' . $origin);
    header('Vary: Origin');
    header('Access-Control-Allow-Methods: POST, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type, Authorization');
}
if (($_SERVER['REQUEST_METHOD'] ?? '') === 'OPTIONS') {
    http_response_code(204);
    exit;
}
if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed'], JSON_UNESCAPED_UNICODE);
    exit;
}

$rawBody = file_get_contents('php://input');
$body = json_decode($rawBody ?: '{}', true);
if (!is_array($body)) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid JSON'], JSON_UNESCAPED_UNICODE);
    exit;
}

$type = isset($body['type']) && is_string($body['type']) ? $body['type'] : 'question';
$allowedTypes = ['question', 'bug', 'feedback'];
if (!in_array($type, $allowedTypes, true)) {
    http_response_code(401);
    echo json_encode(['error' => 'This notification type is not available through the public endpoint'], JSON_UNESCAPED_UNICODE);
    exit;
}

$message = trim((string)($body['message'] ?? ''));
if ($message === '') {
    http_response_code(400);
    echo json_encode(['error' => 'Message is required'], JSON_UNESCAPED_UNICODE);
    exit;
}
$truncate = static fn(string $value, int $limit): string => function_exists('mb_substr') ? mb_substr($value, 0, $limit, 'UTF-8') : substr($value, 0, $limit);
$message = $truncate($message, 2000);
$userName = $truncate(trim((string)($body['userName'] ?? 'Гость курса')), 100);
$userEmail = $truncate(trim((string)($body['userEmail'] ?? '')), 150);
$answer = $truncate(trim((string)($body['answer'] ?? '')), 1500);
$level = $truncate(trim((string)($body['currentLevel'] ?? '')), 10);
$source = $truncate(trim((string)($body['referralSource'] ?? '')), 120);

$ip = (string)($_SERVER['REMOTE_ADDR'] ?? 'unknown');
$rateFile = rtrim(sys_get_temp_dir(), DIRECTORY_SEPARATOR) . DIRECTORY_SEPARATOR . 'banya-notify-' . hash('sha256', $ip) . '.json';
$now = time();
$rateHandle = @fopen($rateFile, 'c+');
if ($rateHandle === false) {
    http_response_code(503);
    echo json_encode(['error' => 'Notification service temporarily unavailable'], JSON_UNESCAPED_UNICODE);
    exit;
}
flock($rateHandle, LOCK_EX);
$rateContents = stream_get_contents($rateHandle);
$timestamps = json_decode($rateContents ?: '[]', true);
if (!is_array($timestamps)) $timestamps = [];
$timestamps = array_values(array_filter($timestamps, static fn($ts) => is_int($ts) && $now - $ts < 600));
if (count($timestamps) >= 5) {
    flock($rateHandle, LOCK_UN);
    fclose($rateHandle);
    http_response_code(429);
    echo json_encode(['error' => 'Too many messages. Please try again later.'], JSON_UNESCAPED_UNICODE);
    exit;
}
$timestamps[] = $now;
rewind($rateHandle);
ftruncate($rateHandle, 0);
fwrite($rateHandle, json_encode($timestamps));
fflush($rateHandle);
flock($rateHandle, LOCK_UN);
fclose($rateHandle);

if (!function_exists('curl_init')) {
    http_response_code(503);
    echo json_encode(['error' => 'Notification service temporarily unavailable'], JSON_UNESCAPED_UNICODE);
    exit;
}

$token = getenv('PARMASTER_BOT_TOKEN') ?: getenv('TELEGRAM_BOT_TOKEN') ?: '';
$chatId = getenv('TELEGRAM_ADMIN_CHAT_ID') ?: '';
if ($token === '' || $chatId === '') {
    error_log('[banya-school] Telegram notification environment variables are not configured');
    http_response_code(503);
    echo json_encode(['error' => 'Notification delivery temporarily unavailable'], JSON_UNESCAPED_UNICODE);
    exit;
}

$escape = static fn(string $value): string => htmlspecialchars($value, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
$lines = [
    $type === 'question' ? '🦉 <b>[Сова PQ] Вопрос ученика</b>' : ($type === 'bug' ? '🐞 <b>[Баг-репорт] Сообщение об ошибке</b>' : '⭐ <b>[Отзыв] Впечатления ученика</b>'),
    '',
    '👤 <b>От:</b> ' . $escape($userName !== '' ? $userName : 'Гость курса'),
];
if ($userEmail !== '') $lines[] = '📧 <b>Контакт:</b> <code>' . $escape($userEmail) . '</code>';
if ($level !== '') $lines[] = '📚 <b>Станция:</b> ' . $escape($level);
if ($source !== '') $lines[] = '🔎 <b>Источник:</b> ' . $escape($source);
$lines[] = '🕒 <b>Время:</b> ' . date('d.m.Y H:i');
$lines[] = '';
$lines[] = $type === 'question' ? '❓ <b>Вопрос:</b>' : ($type === 'bug' ? '💬 <b>Описание ошибки:</b>' : '💬 <b>Отзыв:</b>');
$lines[] = $escape($message);
if ($type === 'question' && $answer !== '') {
    $lines[] = '';
    $lines[] = '💡 <b>Ответ Совы PQ:</b>';
    $lines[] = $escape($answer);
}
$telegramPayload = json_encode([
    'chat_id' => $chatId,
    'text' => implode("\n", $lines),
    'parse_mode' => 'HTML',
    'disable_web_page_preview' => true,
], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);

$ch = curl_init('https://api.telegram.org/bot' . $token . '/sendMessage');
curl_setopt_array($ch, [
    CURLOPT_POST => true,
    CURLOPT_POSTFIELDS => $telegramPayload,
    CURLOPT_HTTPHEADER => ['Content-Type: application/json'],
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_CONNECTTIMEOUT => 5,
    CURLOPT_TIMEOUT => 10,
]);
$responseBody = curl_exec($ch);
$curlError = curl_error($ch);
$httpStatus = (int)curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

$telegramResponse = is_string($responseBody) ? json_decode($responseBody, true) : null;
if ($curlError !== '' || $httpStatus < 200 || $httpStatus >= 300 || !is_array($telegramResponse) || ($telegramResponse['ok'] ?? false) !== true) {
    error_log('[banya-school] Telegram delivery failed: ' . ($curlError !== '' ? $curlError : 'HTTP ' . $httpStatus));
    http_response_code(503);
    echo json_encode(['error' => 'Notification delivery temporarily unavailable'], JSON_UNESCAPED_UNICODE);
    exit;
}

http_response_code(200);
echo json_encode(['success' => true], JSON_UNESCAPED_UNICODE);
