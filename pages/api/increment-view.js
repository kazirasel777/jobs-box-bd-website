// pages/api/increment-view.js

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    const { id } = req.body;
    if (!id) {
      return res.status(400).json({ message: 'Job ID is required' });
    }

    const apiToken = process.env.API_TOKEN;
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

    // Laravel API-কে কল করে ভিউ বাড়ানো হচ্ছে
    await fetch(`${baseUrl}/jobs/${id}/view`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiToken}`,
        'Accept': 'application/json',
      },
    });

    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error incrementing view count:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
}
