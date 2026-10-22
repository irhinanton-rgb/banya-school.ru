<?php
header('Content-Type: application/json; charset=utf-8');

// Key verification: ?key=batya_cron_secret_2026 or Authorization: Bearer batya_cron_secret_2026
$providedKey = $_GET['key'] ?? '';
$authHeader = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
$secret = 'batya_cron_secret_2026';

if ($providedKey !== $secret && $authHeader !== "Bearer {$secret}") {
    http_response_code(401);
    echo json_encode([
        'error' => 'Unauthorized cron trigger. Pass ?key=batya_cron_secret_2026'
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

date_default_timezone_set('Europe/Moscow');

$botToken = '7992502826:AAFaVxzLifwnqRGnV1q3OhUmx4Ykz2C5OBU';
$chatId = '@BatyaVBane';
$vkToken = getenv('VK_ACCESS_TOKEN') ?: 'vk1.a.1y5Haqf_ujhVhQCDET6yww5f4IbAQ1s2e5MyCo9dSLkuuCxZ8sduqFEtbWwRXduGSH_1Psl06QqmGPjZAW49Z7haUlbYoFQ41phVaxI8WywulnukFznXP_iUwE_-8s_0HfXEP-fcg_PSefXzWbEtW-VnbB1cX_lrjEOxd58dC_ULXRrKfX7obVphtUCTEbY7HHJyf_ygQlHKoaWLIsLasg';
$vkGroupId = getenv('VK_GROUP_ID') ?: '242053676';

// 1. Locate posts data
$possiblePaths = [
    __DIR__ . '/telegramPosts.json',
    __DIR__ . '/../../src/data/telegramPosts.json',
    __DIR__ . '/../src/data/telegramPosts.json'
];

$posts = [];
foreach ($possiblePaths as $path) {
    if (file_exists($path)) {
        $content = file_get_contents($path);
        $decoded = json_decode($content, true);
        if (is_array($decoded) && !empty($decoded)) {
            $posts = $decoded;
            break;
        }
    }
}

if (empty($posts)) {
    http_response_code(500);
    echo json_encode([
        'error' => 'Posts data not found. Ensure telegramPosts.json is present in /public/api/ or /src/data/'
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

// 2. State management (prevents duplicate spam on frequent cron calls)
$stateFile = __DIR__ . '/.cron-state.json';
$state = [
    'lastPublishedDate' => null,
    'lastPublishedDay' => 0,
    'history' => []
];

if (file_exists($stateFile)) {
    $rawState = @file_get_contents($stateFile);
    $parsedState = json_decode($rawState, true);
    if (is_array($parsedState)) {
        $state = array_merge($state, $parsedState);
    }
}

$todayStr = date('Y-m-d');
$force = isset($_GET['force']) && ($_GET['force'] === '1' || $_GET['force'] === 'true');
$customDay = isset($_GET['day']) ? (int)$_GET['day'] : null;

// Determine target day
if ($customDay !== null && $customDay > 0) {
    $targetDay = $customDay;
} elseif ($state['lastPublishedDate'] === $todayStr && !$force) {
    // Already published today, do not duplicate
    echo json_encode([
        'success' => true,
        'status' => 'already_published_today',
        'message' => "Пост на сегодня ({$todayStr}) уже был опубликован: День {$state['lastPublishedDay']}. Для принудительной отправки используйте ?force=1 или ?day=N.",
        'day' => $state['lastPublishedDay'],
        'date' => $todayStr
    ], JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
    exit;
} else {
    // Sequential progression
    $lastDay = (int)($state['lastPublishedDay'] ?? 0);
    $targetDay = ($lastDay % count($posts)) + 1;
}

// Find post
$post = null;
foreach ($posts as $p) {
    if ((int)$p['day'] === $targetDay) {
        $post = $p;
        break;
    }
}
if (!$post) {
    $post = $posts[0];
}

// 3. Format Telegram HTML message
$raw = htmlspecialchars($post['text'], ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
$raw = preg_replace('/\*\*([^*]+)\*\*/u', '<b>$1</b>', $raw);
$raw = preg_replace('/\*([^*\n]+)\*/u', '<i>$1</i>', $raw);
$raw = preg_replace('/\[([^\]]+)\]\((https?:\/\/[^\)]+)\)/u', '<a href="$2">$1</a>', $raw);
$header = !empty($post['rubric']) ? "<b>{$post['rubric']}</b> • <i>День {$post['day']}/30</i>\n\n" : "";
$takeaway = !empty($post['keyTakeaway']) ? "\n\n📌 <b>Главный вывод Бати:</b>\n<i>{$post['keyTakeaway']}</i>" : "";
$tgMessage = $header . $raw . $takeaway;

// 4. Send to Telegram
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
curl_setopt($ch, CURLOPT_TIMEOUT, 15);
$tgResRaw = curl_exec($ch);
curl_close($ch);
$tgResult = json_decode($tgResRaw, true);

// 5. Send to VKontakte Wall
$vkResult = null;
if (!empty($vkToken) && !empty($vkGroupId)) {
    $cleanVk = preg_replace('/\[([^\]]+)\]\((https?:\/\/[^\)]+)\)/u', '$1 ($2)', $post['text']);
    $cleanVk = preg_replace('/\*\*([^*]+)\*\*/u', '$1', $cleanVk);
    $cleanVk = preg_replace('/\*([^*\n]+)\*/u', '$1', $cleanVk);
    $vkHeader = !empty($post['rubric']) ? "{$post['rubric']} | День {$post['day']}/30\n\n" : "";
    $vkTakeaway = !empty($post['keyTakeaway']) ? "\n\n📌 Главный вывод Бати:\n{$post['keyTakeaway']}" : "";
    $vkMessage = $vkHeader . $cleanVk . $vkTakeaway;

    $cleanGroupId = ltrim($vkGroupId, '-');
    $vkParams = http_build_query([
        'owner_id' => '-' . $cleanGroupId,
        'from_group' => '1',
        'message' => $vkMessage,
        'access_token' => $vkToken,
        'v' => '5.199',
    ]);
    $chVk = curl_init('https://api.vk.com/method/wall.post');
    curl_setopt($chVk, CURLOPT_POST, true);
    curl_setopt($chVk, CURLOPT_POSTFIELDS, $vkParams);
    curl_setopt($chVk, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($chVk, CURLOPT_TIMEOUT, 15);
    $vkRaw = curl_exec($chVk);
    curl_close($chVk);
    $vkResult = json_decode($vkRaw, true);
}

// 6. Save State on success
$tgSuccess = isset($tgResult['ok']) && $tgResult['ok'] === true;
$vkSuccess = isset($vkResult['response']['post_id']);

if ($tgSuccess || $vkSuccess) {
    $state['lastPublishedDate'] = $todayStr;
    $state['lastPublishedDay'] = (int)$post['day'];
    $state['history'][] = [
        'day' => (int)$post['day'],
        'date' => $todayStr,
        'time' => date('H:i:s'),
        'tg_id' => $tgResult['result']['message_id'] ?? null,
        'vk_id' => $vkResult['response']['post_id'] ?? null
    ];
    if (count($state['history']) > 30) {
        array_shift($state['history']);
    }
    @file_put_contents($stateFile, json_encode($state, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
}

echo json_encode([
    'success' => $tgSuccess || $vkSuccess,
    'day' => $post['day'],
    'title' => $post['title'],
    'published_date' => $todayStr,
    'telegram' => [
        'success' => $tgSuccess,
        'message_id' => $tgResult['result']['message_id'] ?? null,
        'error' => $tgResult['description'] ?? null
    ],
    'vk' => [
        'success' => $vkSuccess,
        'post_id' => $vkResult['response']['post_id'] ?? null,
        'error' => $vkResult['error']['error_msg'] ?? null
    ],
    'next_day' => (($post['day'] % count($posts)) + 1)
], JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
