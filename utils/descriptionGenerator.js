// utils/descriptionGenerator.js
import { getCategoryName } from './categories'; // ক্যাটাগরির নাম পাওয়ার জন্য

export function generateAutoDescription(job, maxLength = 160) {
  if (!job) return 'Job Box BD তে সর্বশেষ চাকরির খবর দেখুন।';

  const title = job.job_title || 'একটি নতুন চাকরি';
  const publishDate = job.publishDate ? `প্রকাশিত হয়েছে ${job.publishDate}` : '';
  const source = job.jobSource ? `সূত্র: ${job.jobSource}` : '';

  let categoryNames = '';
  if (job.category_id && Array.isArray(job.category_id)) {
    categoryNames = job.category_id
      .map(id => getCategoryName(id))
      .filter(name => name && !name.startsWith('ক্যাটাগরি ')) // "ক্যাটাগরি X" বাদ দেওয়া
      .join(', ');
  } else if (job.category_id) {
    const catName = getCategoryName(Number(job.category_id));
    if (catName && !catName.startsWith('ক্যাটাগরি ')) {
        categoryNames = catName;
    }
  }
  const categoriesText = categoryNames ? `ক্যাটাগরি: ${categoryNames}` : '';

  const lastDateText = job.lastDate ? `আবেদনের শেষ তারিখ ${job.lastDate}` : '';

  // বিভিন্ন অংশ একত্রিত করে একটি বর্ণনা তৈরি করুন
  let descriptionParts = [
    `${title} সার্কুলার।`,
    categoriesText,
    publishDate,
    lastDateText,
    source,
    `বিস্তারিত জানতে এবং আবেদন করতে Job Box BD ভিজিট করুন।`
  ];

  // খালি অংশগুলো বাদ দিন
  descriptionParts = descriptionParts.filter(part => part && part.trim() !== '');

  let fullDescription = descriptionParts.join(' ');

  // নির্দিষ্ট দৈর্ঘ্যের মধ্যে বর্ণনা রাখার চেষ্টা করুন
  if (fullDescription.length > maxLength) {
    // যদি job.details থাকে, তাহলে সেটিকে সংক্ষিপ্ত করে ব্যবহার করা যেতে পারে
    if (job.details && typeof job.details === 'string' && job.details.trim() !== '') {
        const truncatedDetails = job.details.substring(0, maxLength - title.length - 20).replace(/\s+\S*$/, '').trim() + '...';
        return `${title}. ${truncatedDetails} Job Box BD তে আরও দেখুন।`;
    }
    // না হলে, তৈরি করা বর্ণনাটি সংক্ষিপ্ত করুন
    fullDescription = fullDescription.substring(0, maxLength - 3) + '...';
  }

  // যদি কোনো কারণে খালি হয়ে যায়, তাহলে একটি ডিফল্ট বর্ণনা দিন
  if (!fullDescription.trim()) {
    return `Job Box BD তে ${title} পদের জন্য আবেদন করুন। সর্বশেষ চাকরির খবর।`;
  }

  return fullDescription;
}

// পুরনো truncateDetails ফাংশনটিও এখানে রাখতে পারেন যদি অন্য কোথাও সরাসরি ডিটেইলস ছোট করার প্রয়োজন হয়।
export const truncateDetails = (details, maxLength) => {
    if (!details || typeof details !== 'string') return '';
    if (details.length <= maxLength) return details;
    return details.substring(0, maxLength).replace(/\s+\S*$/, '').trim() + '...';
};
