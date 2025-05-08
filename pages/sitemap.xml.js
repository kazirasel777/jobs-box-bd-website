// pages/sitemap.xml.js

import axios from 'axios';
import { getAllCategoriesForDisplay } from '../utils/categories'; // ক্যাটাগরি ডেটা পাওয়ার ফাংশন
import { generateSlug } from '../utils/slugify'; // স্লাগ তৈরির ফাংশন

const URL = "https://jobsboxbd.com"; // আপনার ওয়েবসাইটের মূল URL

function generateSiteMap(jobs, categories) {
  let xml = `<?xml version="1.0" encoding="UTF-8"?>`;
  xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;

  // 1. Static Pages (Home, About)
  xml += `
    <url>
      <loc>${URL}</loc>
      <lastmod>${new Date().toISOString().split('T')[0]}</lastmod> {/* আজকের তারিখ */}
      <changefreq>daily</changefreq>
      <priority>1.0</priority>
    </url>
  `;
  xml += `
    <url>
      <loc>${URL}/about</loc>
      <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
      <changefreq>monthly</changefreq>
      <priority>0.8</priority>
    </url>
  `;

  // 2. Category Pages
  categories.forEach(category => {
    xml += `
      <url>
        <loc>${URL}/category/${category.slug}</loc>
        <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
        <changefreq>daily</changefreq> {/* ক্যাটাগরিতে প্রায়ই নতুন জব আসতে পারে */}
        <priority>0.9</priority>
      </url>
    `;
  });

  // 3. Individual Job Pages
  jobs.forEach(job => {
    // নিশ্চিত করুন যে job.job_title আছে এবং generateSlug কাজ করছে
    if (job && job.job_title) {
      const jobSlug = generateSlug(String(job.job_title));
      // শেষ আপডেটের তারিখ থাকলে ব্যবহার করা ভালো, না হলে আজকের তারিখ
      const lastMod = job.publishDate ? new Date(job.publishDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0];
      xml += `
        <url>
          <loc>${URL}/job/${jobSlug}</loc>
          <lastmod>${lastMod}</lastmod>
          <changefreq>weekly</changefreq> {/* জব পেজ সাধারণত পরিবর্তন হয় না */}
          <priority>0.7</priority>
        </url>
      `;
    }
  });

  xml += `</urlset>`;
  return xml;
}

// এই কম্পোনেন্টটি আসলে কিছু রেন্ডার করবে না
function SiteMapPage() {
  // getServerSideProps হ্যান্ডেল করবে রেসপন্স
}

export async function getServerSideProps({ res }) {
  let jobs = [];
  let categories = [];

  try {
    // সব ক্যাটাগরি লোড করুন
    categories = getAllCategoriesForDisplay();

    // সব জব পোস্ট লোড করুন (আপনার API থেকে)
    const response = await axios.get('https://adminjobs.kaziitstudio.com/job_post_api.php');
    jobs = response.data && Array.isArray(response.data.jobs) ? response.data.jobs : [];

  } catch (error) {
    console.error("Error fetching data for sitemap:", error.message);
    // এরর হলেও খালি সাইটম্যাপ জেনারেট করার চেষ্টা করা যেতে পারে শুধু স্ট্যাটিক পেজ দিয়ে
    // অথবা একটি এরর স্ট্যাটাস রিটার্ন করা যেতে পারে
  }

  // সাইটম্যাপ XML তৈরি করুন
  const sitemap = generateSiteMap(jobs, categories);

  res.setHeader('Content-Type', 'application/xml');
  // XML রেসপন্স হিসেবে পাঠানো হচ্ছে
  res.write(sitemap);
  res.end();

  // যেহেতু রেসপন্স সরাসরি হ্যান্ডেল করা হয়েছে, খালি props রিটার্ন করুন
  return {
    props: {},
  };
}

export default SiteMapPage;
