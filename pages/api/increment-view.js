// pages/api/increment-view.js
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    const { id, type = 'web' } = req.body || {};
    if (!id) {
      return res.status(400).json({ message: 'Job ID is required' });
    }

    const BASE  = process.env.JOBSBOX_API_BASE || process.env.NEXT_PUBLIC_API_BASE_URL;
    const TOKEN = process.env.JOBSBOX_API_TOKEN || process.env.API_TOKEN;

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

    const text = await r.text();
    if (!r.ok) {
      console.error('Laravel API Error:', { status: r.status, body: text });
      return res.status(r.status).json({ message: 'Failed to update view count on the backend.' });
    }

    // চেষ্টা করে JSON ফিরিয়ে দিচ্ছি; না হলে সাকসেস true
    try { return res.status(200).json(JSON.parse(text)); }
    catch { return res.status(200).json({ success: true, message: 'View count updated.' }); }
  } catch (err) {
    console.error('Error in /api/increment-view:', err);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
}
