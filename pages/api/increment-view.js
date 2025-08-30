// pages/api/increment-view.js

export default async function handler(req, res) {
  // শুধুমাত্র POST রিকোয়েস্ট গ্রহণ করা হবে
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    const { id } = req.body;

    // চাকরির ID না থাকলে Error দেওয়া হবে
    if (!id) {
      return res.status(400).json({ message: 'Job ID is required' });
    }

    const apiToken = process.env.API_TOKEN;
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

    // Laravel API-কে কল করে ভিউ বাড়ানোর অনুরোধ পাঠানো হচ্ছে
    const apiResponse = await fetch(`${baseUrl}/jobs/${id}/view`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiToken}`,
        'Accept': 'application/json',
      },
    });

    // যদি Laravel API থেকে কোনো সফল উত্তর না আসে
    if (!apiResponse.ok) {
      // কী কারণে বিফল হলো, তা Vercel Log-এ দেখানোর জন্য
      const errorBody = await apiResponse.text();
      console.error('Laravel API Error:', {
        status: apiResponse.status,
        body: errorBody,
      });
      // ব্রাউজারকে জানানো হচ্ছে যে কাজটি সফল হয়নি
      return res.status(apiResponse.status).json({ message: 'Failed to update view count on the backend.' });
    }

    // সবকিছু ঠিক থাকলে সফল বার্তা পাঠানো হচ্ছে
    res.status(200).json({ success: true, message: 'View count updated.' });

  } catch (error) {
    // অন্য কোনো অপ্রত্যাশিত সমস্যা হলে তা Log-এ দেখানো হবে
    console.error('Error in /api/increment-view:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
}
