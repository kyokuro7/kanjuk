export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method === 'OPTIONS') return res.status(204).end();

  const mailbox = req.query && req.query.mailbox;
  if (!mailbox) return res.status(400).json({ error: 'mailbox query required' });

  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 8000);
    const resp = await fetch(`https://ilovetempmail.com/mailbox/${encodeURIComponent(mailbox)}`, {
      signal: ctrl.signal,
      headers: { 'User-Agent': 'Mozilla/5.0', Accept: 'application/json' },
    });
    clearTimeout(t);
    if (resp.status !== 200) return res.status(404).json({ error: 'Mailbox not found' });
    return res.status(200).json(await resp.json());
  } catch (err) {
    return res.status(502).json({ error: 'Upstream error', detail: String((err && err.message) || err) });
  }
}
