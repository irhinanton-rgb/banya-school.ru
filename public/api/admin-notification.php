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

$token = '8683515876:AAHzMeka0nuQG0Hc1lTJCNuPZRogpg-Lw_0';
$chatId = '471147423';

$type = isset($body['type']) ? $body['type'] : 'question';
$message = isset($body['message']) ? htmlspecialchars($body['message']) : '';
$userName = isset($body['userName']) ? htmlspecialchars($body['userName']) : 'Ученик';
$userEmail = isset($body['userEmail']) ? htmlspecialchars($body['userEmail']) : '';
$amount = isset($body['amount']) ? htmlspecialchars((string)$body['amount']) : '3 390 ₽';
$orderId = isset($body['orderId']) ? htmlspecialchars($body['orderId']) : '';
$answer = isset($body['answer']) ? htmlspecialchars($body['answer']) : '';
$time = isset($body['createdAt']) ? htmlspecialchars($body['createdAt']) : date('d.m.Y, H:i');

$lines = [];
if ($type === 'registration') {
    $lines = [
        "🌱 <b>[РЕГИСТРАЦИЯ] Новый банный ученик на PQ!</b>",
        "",
        "👤 <b>Имя:</b> {$userName}",
        $userEmail ? "📧 <b>Email:</b> <code>{$userEmail}</code>" : "",
        "🕒 <b>Время:</b> {$time}",
        "",
        "🌿 <i>Ученик начал путь в школе «Пармастер Квест».</i>"
    ];
} elseif ($type === 'payment') {
    $lines = [
        "🎉 <b>[ОПЛАТА КУРСА] Новый студент «Мастер Пара PRO»!</b>",
        "",
        "🎓 <b>Тариф:</b> «Мастер Пара PRO»",
        "💰 <b>Сумма:</b> {$amount}",
        "👤 <b>Ученик:</b> {$userName}",
        $userEmail ? "📧 <b>Email:</b> {$userEmail}" : "",
        $orderId ? "🧾 <b>Заказ:</b> <code>{$orderId}</code>" : "",
        "🕒 <b>Время:</b> {$time}",
        "",
        "👑 <i>Доступ активирован на banya-school.ru!</i>"
    ];
} elseif ($type === 'payment_intent') {
    $lines = [
        "🛒 <b>[ЗАЯВКА НА ОПЛАТУ КУРСА] Ученик запросил оплату</b>",
        "",
        "🎓 <b>Тариф:</b> «Мастер Пара PRO» ({$amount})",
        "👤 <b>Ученик:</b> {$userName}",
        $userEmail ? "📧 <b>Email:</b> <code>{$userEmail}</code>" : "",
        "🕒 <b>Время:</b> {$time}",
    ];
} elseif ($type === 'bug') {
    $lines = [
        "🐞 <b>[Баг-репорт] Сообщение об ошибке</b>",
        "",
        "👤 <b>От:</b> {$userName}",
        $userEmail ? "📧 <b>Контакт:</b> {$userEmail}" : "",
        "🕒 <b>Время:</b> {$time}",
        "",
        "💬 <b>Ошибка:</b>",
        $message
    ];
} elseif ($type === 'feedback') {
    $lines = [
        "💬 <b>[Отзыв] Впечатления ученика о курсе</b>",
        "",
        "👤 <b>Ученик:</b> {$userName}",
        $userEmail ? "📧 <b>Контакт:</b> {$userEmail}" : "",
        "🕒 <b>Время:</b> {$time}",
        "",
        "⭐ <b>Отзыв:</b>",
        $message
    ];
} else {
    $lines = [
        "🦉 <b>[Сова PQ] Вопрос ученика по квесту</b>",
        "",
        "👤 <b>Ученик:</b> {$userName}",
        $userEmail ? "📧 <b>Контакт:</b> {$userEmail}" : "",
        "🕒 <b>Время:</b> {$time}",
        "",
        "❓ <b>Вопрос:</b>",
        $message
    ];
    if ($answer) {
        $lines[] = "";
        $lines[] = "💡 <b>Ответ Совы PQ:</b>";
        $lines[] = $answer;
    }
}

$text = implode("\n", array_filter($lines, function($v) { return $v !== ''; }));

$tgPayload = json_encode([
    'chat_id' => $chatId,
    'text' => $text,
    'parse_mode' => 'HTML',
    'disable_web_page_preview' => true
]);

$ch = curl_init("https://api.telegram.org/bot{$token}/sendMessage");
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, $tgPayload);
curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
curl_setopt($ch, CURLOPT_TIMEOUT, 10);
$res = curl_exec($ch);
curl_close($ch);

echo json_encode(['ok' => true, 'response' => json_decode($res, true)]);
