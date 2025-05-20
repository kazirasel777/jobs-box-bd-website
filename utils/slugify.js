// utils/slugify.js

export function generateSlug(title) {
  if (!title) return 'untitled-job';

  const slug = title
    .toString()
    .toLowerCase()
    // Replace specific problematic characters first if needed
    .replace(/&/g, '-and-')
    .replace(/%/g, '-percent-')
    // Replace spaces, slashes, underscores with a hyphen
    .replace(/[\s\/_]+/g, '-')
    // Remove characters that are not Bengali letters (Unicode range), English letters, numbers, or hyphen
    .replace(/[^\u0980-\u09FFa-z0-9-]+/g, '')
    // Replace multiple hyphens with a single hyphen
    .replace(/--+/g, '-')
    // Trim hyphens from start and end
    .replace(/^-+/, '')
    .replace(/-+$/, '');

  // Limit slug length (optional)
  // const maxLength = 70;
  // if (slug.length > maxLength) {
  //   slug = slug.substring(0, maxLength).replace(/-+$/, '');
  // }

  return slug || 'job'; // Fallback if empty after replacements
}
