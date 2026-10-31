function randomString(len = 12) {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let out = '';
  for (let i = 0; i < len; i++) out += chars[Math.floor(Math.random() * chars.length)];
  return out;
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method === 'OPTIONS') return res.status(204).end();

  try {
    for (let i = 0; i < 3; i++) {
      const mailbox = `${randomString()}@ilovetempmail.com`;
      try {
        const ctrl = new AbortController();
        const t = setTimeout(() => ctrl.abort(), 4000);
        const check = await fetch(`https://ilovetempmail.com/mailbox/${mailbox}`, {
          signal: ctrl.signal,
          headers: { 'User-Agent': 'Mozilla/5.0' },
        });
        clearTimeout(t);
        if (check.status === 404) return res.status(200).json({ mailbox });
      } catch (e) {
        // abaikan, coba lagi
      }
    }
    return res.status(200).json({ mailbox: `${randomString(14)}@ilovetempmail.com`, verified: false });
  } catch (err) {
    return res.status(500).json({ error: 'Internal error', detail: String((err && err.message) || err) });
  }
}
