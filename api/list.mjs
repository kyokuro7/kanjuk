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

    // 404 = mailbox belum menerima email apa pun -> inbox kosong, bukan error
    if (resp.status === 404) return res.status(200).json({ mailbox, messages: [] });

    if (resp.status !== 200) {
      return res.status(502).json({ error: 'Upstream error', upstreamStatus: resp.status });
    }

    const text = await resp.text();
    try {
      return res.status(200).json(JSON.parse(text));
    } catch {
      return res.status(502).json({ error: 'Upstream returned non-JSON', preview: text.slice(0, 200) });
    }
  } catch (err) {
    return res.status(502).json({ error: 'Upstream error', detail: String((err && err.message) || err) });
  }
}
