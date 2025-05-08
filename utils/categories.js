// utils/categories.js
import { generateSlug } from './slugify'; // generateSlug ফাংশন slugify.js থেকে আসবে

// categoryMap এর পরিবর্তে categoryData ব্যবহার করা হচ্ছে যেখানে প্রতিটি ক্যাটাগরির নাম ও স্লাগ থাকবে
export const categoryData = {
  1: { name: 'সরকারি চাকরি', slug: generateSlug('সরকারি চাকরি') },
  2: { name: 'বেসরকারি চাকরি', slug: generateSlug('বেসরকারি চাকরি') },
  3: { name: 'শিক্ষাপ্রতিষ্ঠানে চাকরি', slug: generateSlug('শিক্ষাপ্রতিষ্ঠানে চাকরি') },
  4: { name: 'ব্যাংক চাকরি', slug: generateSlug('ব্যাংক চাকরি') },
  5: { name: 'সশস্ত্র চাকরি', slug: generateSlug('সশস্ত্র চাকরি') },
  6: { name: 'চাকরির পত্রিকা', slug: generateSlug('চাকরির পত্রিকা') },
  7: { name: 'সময়সীমা শেষের দিকে', slug: generateSlug('সময়সীমা শেষের দিকে') },
  8: { name: 'নোটিশ', slug: generateSlug('নোটিশ') },
};

// আইডি অথবা স্লাগ দিয়ে ক্যাটাগরির বিস্তারিত তথ্য (id, name, slug) খুঁজে বের করার ফাংশন
export const getCategoryDetails = (identifier) => {
  if (typeof identifier === 'number' || !isNaN(Number(identifier))) {
    const numId = Number(identifier);
    if (categoryData[numId]) {
      return { id: numId, ...categoryData[numId] };
    }
  } else if (typeof identifier === 'string') {
    for (const id in categoryData) {
      if (categoryData[id].slug === identifier) {
        return { id: Number(id), ...categoryData[id] };
      }
    }
  }
  return null; // খুঁজে না পাওয়া গেলে null রিটার্ন করবে
};

// আইডি থেকে ক্যাটাগরির নাম পাওয়ার ফাংশন
export const getCategoryName = (id) => {
  const details = getCategoryDetails(Number(id));
  return details ? details.name : `ক্যাটাগরি ${Number(id)}`;
};

// আইডি থেকে ক্যাটাগরির স্লাগ পাওয়ার ফাংশন
export const getCategorySlugById = (id) => {
  const details = getCategoryDetails(Number(id));
  return details ? details.slug : null;
};

// নেভিগেশন এবং সাইডবারের জন্য সব ক্যাটাগরির তালিকা (id, name, slug সহ)
export const getAllCategoriesForDisplay = () => {
  return Object.entries(categoryData).map(([id, data]) => ({
    id: Number(id),
    name: data.name,
    slug: data.slug,
  })).sort((a, b) => a.id - b.id); // আইডি অনুযায়ী সাজানো
};

// এই ফাংশনটি আপনার আগের মতোই জব ডেটা থেকে ক্যাটাগরি তৈরি করতে পারে, যদি প্রয়োজন হয়
// তবে হেডার এবং ক্যাটাগরি পেজের জন্য আমরা getAllCategoriesForDisplay ব্যবহার করব
export const getAllCategoriesFromJobs = (jobs) => {
  if (!jobs || !Array.isArray(jobs)) return [];
  try {
    const categoryIds = jobs.flatMap(job => {
      const catId = job?.category_id;
      // Ensure catId is processed as an array of numbers
      if (Array.isArray(catId)) {
        return catId.map(Number);
      }
      return catId ? [Number(catId)] : [];
    });
    const uniqueIds = [...new Set(categoryIds)];

    return uniqueIds
      .map(id => {
        const details = getCategoryDetails(id);
        return details ? { id: details.id, name: details.name, slug: details.slug } : null;
      })
      .filter(cat => cat !== null && categoryData.hasOwnProperty(cat.id)) // categoryData তে থাকলে তবেই
      .sort((a, b) => a.id - b.id);
  } catch (error) {
    console.error("Error in getAllCategoriesFromJobs:", error);
    return [];
  }
};
