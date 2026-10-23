import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const SCAN_ROOTS = ['api', 'public/api', 'server', 'src', 'src_backup_v1'];
const SECRET_PATTERNS = [
  ['Telegram bot token', /\b\d{8,12}:[A-Za-z0-9_-]{30,}\b/],
  ['VK access token', /\bvk1\.[A-Za-z0-9._-]{40,}\b/],
  ['YooKassa live secret', /\blive_[A-Za-z0-9_-]{25,}\b/],
  ['private key material', /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/],
];

function walk(directory) {
  if (!fs.existsSync(directory)) return [];
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) return walk(fullPath);
    if (!entry.isFile()) return [];
    if (/\.(?:js|jsx|ts|tsx|php|json|html|css|txt)$/i.test(entry.name)) return [fullPath];
    return [];
  });
}

test('server and application sources do not contain embedded credentials', () => {
  const files = [...new Set(SCAN_ROOTS.flatMap((root) => walk(path.join(ROOT, root))))];
  const findings = [];
  for (const file of files) {
    const source = fs.readFileSync(file, 'utf8');
    for (const [label, pattern] of SECRET_PATTERNS) {
      if (pattern.test(source)) findings.push(`${path.relative(ROOT, file)}: ${label}`);
    }
  }
  assert.deepEqual(findings, [], `Embedded credentials found:\n${findings.join('\n')}`);
});
