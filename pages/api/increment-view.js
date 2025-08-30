// pages/api/increment-view.js

export default async function handler(req, res) {
  if (req.method !== 'POST')
    return res.status(405).json({ error: 'Method Not Allowed' });

  try {
    const BASE  = process.env.JOBSBOX_API_BASE || process.env.NEXT_PUBLIC_API_BASE_URL;
    const TOKEN = process.env.JOBSBOX_API_TOKEN || process.env.API_TOKEN;

    const { id, type = 'web' } = req.body || {};
    if (!id) return res.status(400).json({ error: 'Job ID is required' });

    const r = await fetch(`${BASE}/job/${id}/update-view`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${TOKEN}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ view_type: type }),
      cache: 'no-store',
    });

    const data = await r.json().catch(() => ({}));
    return res.status(r.status).json(data);
  } catch (e) {
    console.error('increment-view error:', e);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
