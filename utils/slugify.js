// utils/slugify.js

export function generateSlug(input) {
  if (!input) return '';
  const text = String(input)
    .normalize('NFKD')
    .replace(/\u200D/g, '')      // ZWJ ইত্যাদি সরাও
    .replace(/[^\p{L}\p{N}]+/gu, '-') // অক্ষর/সংখ্যা ছাড়া সব কিছুর জায়গায় '-'
    .replace(/^-+|-+$/g, '');    // শুরু/শেষের '-' কেটে দাও
  return text.toLowerCase();
}

// পুরোনো কোডে { slugify } থাকলে যাতে না ভাঙে:
export const slugify = generateSlug;

// default import সাপোর্টের জন্য:
export default generateSlug;
