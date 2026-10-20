<?php
header('Content-Type: application/json; charset=utf-8');

// Fallback key: ?key=batya_cron_secret_2026
$providedKey = $_GET['key'] ?? '';
$authHeader = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
$secret = 'batya_cron_secret_2026';

if ($providedKey !== $secret && $authHeader !== "Bearer {$secret}") {
    http_response_code(401);
    echo json_encode(['error' => 'Unauthorized cron trigger. Pass ?key=batya_cron_secret_2026']);
    exit;
}

$botToken = '7992502826:AAFaVxzLifwnqRGnV1q3OhUmx4Ykz2C5OBU';
$chatId = '@BatyaVBane';
$vkToken = getenv('VK_ACCESS_TOKEN') ?: '';
$vkGroupId = getenv('VK_GROUP_ID') ?: '242053676';

// Read posts
$postsFile = __DIR__ . '/../../src/data/telegramPosts.json';
if (!file_exists($postsFile)) {
    $postsFile = __DIR__ . '/telegramPosts.json';
}

$posts = [];
if (file_exists($postsFile)) {
    $posts = json_decode(file_get_contents($postsFile), true);
}

if (empty($posts)) {
    http_response_code(500);
    echo json_encode(['error' => 'Posts data not found']);
    exit;
}

// Day calculation from 2026-10-15
date_default_timezone_set('Europe/Moscow');
$startTimestamp = strtotime('2026-10-15 10:00:00');
$now = time();
$daysPassed = max(0, (int)floor(($now - $startTimestamp) / 86400));
$targetDay = isset($_GET['day']) ? (int)$_GET['day'] : (($daysPassed % count($posts)) + 1);

$post = null;
foreach ($posts as $p) {
    if ((int)$p['day'] === $targetDay) {
        $post = $p;
        break;
    }
}
if (!$post) $post = $posts[0];

// Format TG HTML
$raw = htmlspecialchars($post['text'], ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
$raw = preg_replace('/\*\*([^*]+)\*\*/u', '<b>$1</b>', $raw);
$raw = preg_replace('/\*([^*\n]+)\*/u', '<i>$1</i>', $raw);
$raw = preg_replace('/\[([^\]]+)\]\((https?:\/\/[^\)]+)\)/u', '<a href="$2">$1</a>', $raw);
$header = !empty($post['rubric']) ? "<b>{$post['rubric']}</b> • <i>День {$post['day']}/30</i>\n\n" : "";
$takeaway = !empty($post['keyTakeaway']) ? "\n\n📌 <b>Главный вывод Бати:</b>\n<i>{$post['keyTakeaway']}</i>" : "";
$tgMessage = $header . $raw . $takeaway;

// Send TG
$imageUrl = !empty($post['imageUrl']) ? "https://banya-school.ru{$post['imageUrl']}" : null;
$tgResult = null;

if ($imageUrl && mb_strlen($tgMessage) <= 1020) {
    $payload = json_encode([
        'chat_id' => $chatId,
        'photo' => $imageUrl,
        'caption' => $tgMessage,
        'parse_mode' => 'HTML',
    ]);
    $ch = curl_init("https://api.telegram.org/bot{$botToken}/sendPhoto");
} else {
    $payload = json_encode([
        'chat_id' => $chatId,
        'text' => $tgMessage,
        'parse_mode' => 'HTML',
    ]);
    $ch = curl_init("https://api.telegram.org/bot{$botToken}/sendMessage");
}

curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, $payload);
curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
$tgResRaw = curl_exec($ch);
curl_close($ch);
$tgResult = json_decode($tgResRaw, true);

echo json_encode([
    'success' => true,
    'day' => $post['day'],
    'title' => $post['title'],
    'telegram_message_id' => $tgResult['result']['message_id'] ?? null,
    'imageUrl' => $imageUrl,
]);
