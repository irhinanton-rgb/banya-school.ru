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
$vkToken = getenv('VK_ACCESS_TOKEN') ?: 'vk1.a.1y5Haqf_ujhVhQCDET6yww5f4IbAQ1s2e5MyCo9dSLkuuCxZ8sduqFEtbWwRXduGSH_1Psl06QqmGPjZAW49Z7haUlbYoFQ41phVaxI8WywulnukFznXP_iUwE_-8s_0HfXEP-fcg_PSefXzWbEtW-VnbB1cX_lrjEOxd58dC_ULXRrKfX7obVphtUCTEbY7HHJyf_ygQlHKoaWLIsLasg';
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

// Also publish to VKontakte Wall
$vkResult = null;
if (!empty($vkToken) && !empty($vkGroupId)) {
    $cleanVk = preg_replace('/\[([^\]]+)\]\((https?:\/\/[^\)]+)\)/u', '$1 ($2)', $post['text']);
    $cleanVk = preg_replace('/\*\*([^*]+)\*\*/u', '$1', $cleanVk);
    $cleanVk = preg_replace('/\*([^*\n]+)\*/u', '$1', $cleanVk);
    $vkHeader = !empty($post['rubric']) ? "{$post['rubric']} | День {$post['day']}/30\n\n" : "";
    $vkTakeaway = !empty($post['keyTakeaway']) ? "\n\n📌 Главный вывод Бати:\n{$post['keyTakeaway']}" : "";
    $vkMessage = $vkHeader . $cleanVk . $vkTakeaway;

    $vkParams = http_build_query([
        'owner_id' => '-' . ltrim($vkGroupId, '-'),
        'from_group' => '1',
        'message' => $vkMessage,
        'access_token' => $vkToken,
        'v' => '5.199',
    ]);
    $chVk = curl_init('https://api.vk.com/method/wall.post');
    curl_setopt($chVk, CURLOPT_POST, true);
    curl_setopt($chVk, CURLOPT_POSTFIELDS, $vkParams);
    curl_setopt($chVk, CURLOPT_RETURNTRANSFER, true);
    $vkRaw = curl_exec($chVk);
    curl_close($chVk);
    $vkResult = json_decode($vkRaw, true);
}


echo json_encode([
    'success' => true,
    'day' => $post['day'],
    'title' => $post['title'],
    'telegram_message_id' => $tgResult['result']['message_id'] ?? null,
    'imageUrl' => $imageUrl,
    'vk_post_id' => $vkResult['response']['post_id'] ?? null,
    'vk_error' => $vkResult['error']['error_msg'] ?? null,
]);
