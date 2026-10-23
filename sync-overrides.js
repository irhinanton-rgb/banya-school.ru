import fs from 'fs';
import path from 'path';

export default async function handler(req, res) {
  const filePath = path.resolve(process.cwd(), 'src/data/liveTextOverrides.json');

  if (req.method === 'GET') {
    try {
      const content = fs.existsSync(filePath) ? fs.readFileSync(filePath, 'utf-8') : '{}';
      return res.status(200).json(JSON.parse(content || '{}'));
    } catch (e) {
      return res.status(200).json({});
    }
  }

  if (req.method === 'POST') {
    const host = String(req.headers?.host || '').toLowerCase();
    if (host.includes('banya-school.ru')) {
      return res.status(403).json({ error: 'Live text override writes are disabled in production' });
    }
    try {
      const incoming = req.body && req.body.overrides && typeof req.body.overrides === 'object'
        ? req.body.overrides
        : {};
      const replaceAll = Boolean(req.body && req.body.replaceAll);

      let existing = {};
      if (!replaceAll && fs.existsSync(filePath)) {
        try {
          existing = JSON.parse(fs.readFileSync(filePath, 'utf-8') || '{}');
        } catch {
          existing = {};
        }
      }

      const merged = replaceAll ? incoming : { ...existing, ...incoming };
      fs.writeFileSync(filePath, JSON.stringify(merged, null, 2), 'utf-8');
      return res.status(200).json({ ok: true, count: Object.keys(merged).length });
    } catch (err) {
      return res.status(500).json({ error: String(err) });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
