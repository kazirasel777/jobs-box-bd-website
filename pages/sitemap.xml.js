// pages/sitemap.xml.js

import axios from 'axios';
import { getAllCategoriesForDisplay } from '../utils/categories'; // ক্যাটাগরি ডেটা পাওয়ার ফাংশন
import { generateSlug } from '../utils/slugify'; // স্লাগ তৈরির ফাংশন

const URL = "https://jobsboxbd.com"; // আপনার ওয়েবসাইটের মূল URL

// একটি Date অবজেক্ট ভ্যালিড কিনা তা চেক করার জন্য Helper ফাংশন
function isValidDate(d) {
  // এটি চেক করে যে ইনপুট একটি Date অবজেক্ট কিনা এবং এর মান NaN (Not-a-Number) নয়
  return d instanceof Date && !isNaN(d);
}

function generateSiteMap(jobs, categories) {
  let xml = `<?xml version="1.0" encoding="UTF-8"?>`;
  xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;

  // আজকের তারিখ (ISO ফরম্যাটে YYYY-MM-DD) একবার তৈরি করে রাখা হচ্ছে
  const today = new Date().toISOString().split('T')[0];

  // ১. স্ট্যাটিক পেজ (হোম, অ্যাবাউট)
  xml += `
    <url>
      <loc>${URL}</loc>
      <lastmod>${today}</lastmod>
      <changefreq>daily</changefreq>
      <priority>1.0</priority>
    </url>
  `;
  xml += `
    <url>
      <loc>${URL}/about</loc> {/* নিশ্চিত করুন /about পেজটি আছে */}
      <lastmod>${today}</lastmod> {/* আপনি চাইলে নির্দিষ্ট তারিখ দিতে পারেন */}
      <changefreq>monthly</changefreq>
      <priority>0.8</priority>
    </url>
  `;

  // ২. ক্যাটাগরি পেজ
  categories.forEach(category => {
    // ক্যাটাগরি এবং স্লাগ ভ্যালিড কিনা চেক করা হচ্ছে
    if (category && category.slug) {
        xml += `
        <url>
            <loc>${URL}/category/${category.slug}</loc>
            <lastmod>${today}</lastmod>
            <changefreq>daily</changefreq>
            <priority>0.9</priority>
        </url>
        `;
    } else {
        // যদি কোনো ক্যাটাগরির স্লাগ না থাকে, তাহলে কনসোলে ওয়ার্নিং দেখানো যেতে পারে
        console.warn("Sitemap: Skipping category due to missing slug:", category);
    }
  });

  // ৩. প্রতিটি জব পেজ
  jobs.forEach(job => {
    // জব এবং জব টাইটেল আছে কিনা নিশ্চিত করা
    if (job && job.job_title) {
      const jobTitleStr = String(job.job_title).trim(); // টাইটেল স্ট্রিং এবং ট্রিম করা
      // টাইটেল খালি কিনা চেক করা
      if(jobTitleStr === '') {
          console.warn("Sitemap: Skipping job with empty title:", job.id);
          return; // এই জবটি বাদ দিয়ে পরেরটিতে যাও
      }

      const jobSlug = generateSlug(jobTitleStr); // স্লাগ তৈরি করা
      // স্লাগ তৈরি সফল হয়েছে কিনা বা ডিফল্ট 'job' স্লাগ আসেনি তো?
      if (!jobSlug || jobSlug === 'job') {
          console.warn('Sitemap: Skipping job with problematic slug generation:', job.id, job.job_title);
          return; // এই জবটি বাদ দিয়ে পরেরটিতে যাও
      }

      let lastMod = today; // ডিফল্ট লাস্ট মডিফিকেশন তারিখ = আজকের তারিখ
      if (job.publishDate) {
        const pubDate = new Date(job.publishDate); // publishDate থেকে Date অবজেক্ট তৈরি
        // **পরিবর্তন:** তৈরি হওয়া Date অবজেক্টটি ভ্যালিড কিনা চেক করা হচ্ছে
        if (isValidDate(pubDate)) {
          lastMod = pubDate.toISOString().split('T')[0]; // ভ্যালিড হলে ISO স্ট্রিং ব্যবহার করা হচ্ছে
        } else {
          // যদি ভ্যালিড না হয়, কনসোলে ওয়ার্নিং দেখানো হচ্ছে এবং আজকের তারিখ ব্যবহার করা হচ্ছে
          console.warn(`Sitemap: Invalid publishDate ('${job.publishDate}') for job ID ${job.id}. Using today's date.`);
        }
      }

      // URL তৈরি করা হচ্ছে
      xml += `
        <url>
          <loc>${URL}/job/${jobSlug}</loc>
          <lastmod>${lastMod}</lastmod>
          <changefreq>weekly</changefreq>
          <priority>0.7</priority>
        </url>
      `;
    } else {
        // যদি জব টাইটেল না থাকে, তাহলে কনসোলে ওয়ার্নিং
        console.warn('Sitemap: Skipping job with missing title:', job.id);
    }
  });

  xml += `</urlset>`;
  return xml;
}

// এই পেজ কম্পোনেন্টটি খালি থাকবে কারণ রেসপন্স getServerSideProps থেকে পাঠানো হবে
function SiteMapPage() {
  // Nothing to render here...
}

export async function getServerSideProps({ res }) {
  console.log("[sitemap.xml] Starting generation...");
  let jobs = [];
  let categories = [];

  try {
    console.log("[sitemap.xml] Fetching categories...");
    categories = getAllCategoriesForDisplay();
    console.log(`[sitemap.xml] Fetched ${categories.length} categories.`);

    console.log("[sitemap.xml] Fetching jobs from API...");
    const response = await axios.get('https://adminjobs.kaziitstudio.com/job_post_api.php');
    jobs = response.data && Array.isArray(response.data.jobs) ? response.data.jobs : [];
    console.log(`[sitemap.xml] Fetched ${jobs.length} jobs.`);

    console.log("[sitemap.xml] Generating XML...");
    const sitemap = generateSiteMap(jobs, categories);
    console.log("[sitemap.xml] XML generation complete.");

    // Vercel এ ক্যাশিং এর জন্য হেডার যোগ করা (যেমন, ১ দিনের জন্য ক্যাশ)
    res.setHeader('Cache-Control', 's-maxage=86400, stale-while-revalidate'); // 86400 seconds = 1 day
    // কনটেন্ট টাইপ XML সেট করা হচ্ছে
    res.setHeader('Content-Type', 'application/xml');
    // XML রেসপন্স পাঠানো হচ্ছে
    res.write(sitemap);
    res.end();
    console.log("[sitemap.xml] Sitemap response sent.");

  } catch (error) {
    console.error("[sitemap.xml] Error in getServerSideProps:", error);
    res.statusCode = 500;
    res.write("Internal Server Error generating sitemap."); // একটি সাধারণ এরর মেসেজ পাঠানো হচ্ছে
    res.end();
  }

  // props রিটার্ন করা আবশ্যক, যদিও আমরা রেসপন্স আগেই পাঠিয়ে দিয়েছি
  return {
    props: {},
  };
}

export default SiteMapPage;
