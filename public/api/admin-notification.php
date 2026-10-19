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

$type = isset($body['type']) ? (string)$body['type'] : 'question';
$message = isset($body['message']) ? htmlspecialchars((string)$body['message'], ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8') : '';
$userName = !empty($body['userName']) ? htmlspecialchars((string)$body['userName'], ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8') : 'Гость курса';
$userEmail = !empty($body['userEmail']) ? htmlspecialchars((string)$body['userEmail'], ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8') : '';
$phoneNumber = !empty($body['phoneNumber']) ? htmlspecialchars((string)$body['phoneNumber'], ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8') : '';
$referralSource = !empty($body['referralSource']) ? htmlspecialchars((string)$body['referralSource'], ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8') : '';
$amount = isset($body['amount']) ? htmlspecialchars((string)$body['amount'], ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8') : '3 390 ₽';
$orderId = !empty($body['orderId']) ? htmlspecialchars((string)$body['orderId'], ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8') : '';
$answer = !empty($body['answer']) ? htmlspecialchars((string)$body['answer'], ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8') : '';
$currentLevel = !empty($body['currentLevel']) ? htmlspecialchars((string)$body['currentLevel'], ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8') : '';
$time = !empty($body['createdAt']) ? htmlspecialchars((string)$body['createdAt'], ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8') : date('d.m.Y, H:i');

$lines = [];
if ($type === 'registration') {
    $lines = [
        "🌱 <b>[РЕГИСТРАЦИЯ] Новый банный ученик на PQ!</b>",
        "",
        "👤 <b>Имя:</b> {$userName}",
        $userEmail ? "📧 <b>Email:</b> <code>{$userEmail}</code>" : "",
        $phoneNumber ? "📱 <b>Телефон:</b> <code>{$phoneNumber}</code>" : "",
        $referralSource ? "🔍 <b>Источник:</b> {$referralSource}" : "",
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
        $userEmail ? "📧 <b>Email:</b> <code>{$userEmail}</code>" : "",
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
        $phoneNumber ? "📱 <b>Телефон:</b> <code>{$phoneNumber}</code>" : "",
        "🕒 <b>Время:</b> {$time}",
        $message ? "" : "",
        $message ? "💬 <b>Детали:</b> {$message}" : ""
    ];
} elseif ($type === 'bug') {
    $lines = [
        "🐞 <b>[Баг-репорт] Сообщение об ошибке с сайта</b>",
        "",
        "👤 <b>От:</b> {$userName}",
        $userEmail ? "📧 <b>Контакт:</b> <code>{$userEmail}</code>" : "",
        "🕒 <b>Время:</b> {$time}",
        "",
        "💬 <b>Ошибка:</b>",
        $message
    ];
} elseif ($type === 'feedback') {
    $lines = [
        "⭐ <b>[Отзыв] Впечатления ученика о курсе</b>",
        "",
        "👤 <b>Ученик:</b> {$userName}",
        $userEmail ? "📧 <b>Контакт:</b> <code>{$userEmail}</code>" : "",
        $referralSource ? "🔍 <b>Откуда узнал:</b> {$referralSource}" : "",
        "🕒 <b>Время:</b> {$time}",
        "",
        "💬 <b>Отзыв:</b>",
        $message
    ];
} elseif ($type === 'ad_inquiry' || $type === 'b2b_inquiry') {
    $lines = [
        "🤝 <b>[СОТРУДНИЧЕСТВО / РЕКЛАМА] Заявка от партнёра на banya-school.ru</b>",
        "",
        "🏢 <b>Имя / Компания:</b> {$userName}",
        $userEmail ? "📱 <b>Контакт:</b> <code>{$userEmail}</code>" : "",
        $referralSource ? "📌 <b>Направление:</b> {$referralSource}" : "",
        "🕒 <b>Время:</b> {$time}",
        "",
        "💬 <b>Предложение / Детали:</b>",
        $message
    ];
} else {
    $levelSuffix = $currentLevel ? " (Станция {$currentLevel})" : "";
    $lines = [
        "🦉 <b>[Сова PQ] Вопрос ученика на сайте banya-school.ru</b>",
        "",
        "👤 <b>Ученик:</b> {$userName}{$levelSuffix}",
        $userEmail ? "📧 <b>Контакт:</b> <code>{$userEmail}</code>" : "",
        $referralSource ? "🔍 <b>Источник:</b> {$referralSource}" : "",
        "🕒 <b>Время:</b> {$time}",
        "",
        "❓ <b>Вопрос ученика:</b>",
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

$tgUrl = "https://api.telegram.org/bot{$token}/sendMessage";
$res = false;

if (function_exists('curl_init')) {
    $ch = curl_init($tgUrl);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, $tgPayload);
    curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
    curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, 5);
    curl_setopt($ch, CURLOPT_TIMEOUT, 10);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
    curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, 0);
    $res = curl_exec($ch);
    curl_close($ch);
}

if ($res === false) {
    $ctx = stream_context_create([
        'http' => [
            'method' => 'POST',
            'header' => "Content-Type: application/json\r\n",
            'content' => $tgPayload,
            'timeout' => 8,
            'ignore_errors' => true
        ],
        'ssl' => [
            'verify_peer' => false,
            'verify_peer_name' => false
        ]
    ]);
    $res = @file_get_contents($tgUrl, false, $ctx);
}

$decoded = $res ? json_decode($res, true) : null;
$isOk = is_array($decoded) && !empty($decoded['ok']);

if (!$isOk) {
    http_response_code(502);
    echo json_encode([
        'success' => false,
        'ok' => false,
        'error' => 'Telegram delivery failed on server, fallback to direct client dispatch',
        'response' => $decoded
    ]);
    exit;
}

echo json_encode([
    'success' => true,
    'ok' => true,
    'response' => $decoded
]);
