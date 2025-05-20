// utils/jobDescriptionUtils.js

const CURRENT_YEAR = new Date().getFullYear();

function getCategoryKeywordsText(categoryNames = []) {
    if (!categoryNames || categoryNames.length === 0) return 'বিভিন্ন';
    return categoryNames.slice(0, 2).join(', ') + ' সহ অন্যান্য';
}

/**
 * চাকরির বিস্তারিত পেজের জন্য সম্পূর্ণ ডাইনামিক বিবরণ তৈরি করে।
 * @param {string} jobTitle - চাকরির শিরোনাম
 * @param {string} publishDate - প্রকাশের তারিখ
 * @param {string} [jobSource] - চাকরির উৎস (اختیاری)
 * @param {string[]} [categoryNames=[]] - ক্যাটাগরির নামের অ্যারে
 * @param {string} [companyName=''] - কোম্পানির নাম (اختیاری)
 * @returns {JSX.Element} - বিবরণী JSX হিসেবে
 */
export function generateFullJobDescription(jobTitle, publishDate, jobSource, categoryNames = [], companyName = '') {
    const title = jobTitle || "এই পদে";
    const dateText = publishDate ? `${publishDate} তারিখে` : "সম্প্রতি";
    const sourceText = jobSource ? ` (সূত্র: ${jobSource})` : '';
    const categoriesText = getCategoryKeywordsText(categoryNames);

    // কোম্পানির নামের জন্য একটি টেক্সট তৈরি করা হচ্ছে
    const companyDisplayText = companyName || (categoryNames.length > 0 && !categoryNames[0].toLowerCase().includes('সরকারি') && !categoryNames[0].toLowerCase().includes('ব্যাংক') ? categoryNames[0] : 'এই স্বনামধন্য প্রতিষ্ঠানে');

    return (
        <>
            <p>
                <strong>{title}</strong> পদে একটি নতুন ও আকর্ষণীয় নিয়োগ বিজ্ঞপ্তি {CURRENT_YEAR} প্রকাশিত হয়েছে। বাংলাদেশের চাকরি প্রার্থীদের জন্য এটি একটি দারুণ সুযোগ। এই চাকরির খবরটি <strong>{dateText}</strong> সর্বসাধারণের জন্য প্রকাশ করা হয়েছে{sourceText}।
                আপনি যদি {categoriesText} পদে {CURRENT_YEAR} সালের নতুন সরকারি চাকরি, বেসরকারি চাকরি, ব্যাংক জব বা কোম্পানির চাকরি খুঁজে থাকেন, তবে এই বিজ্ঞপ্তিটি আপনার জন্য গুরুত্বপূর্ণ হতে পারে।
            </p>
            <p>
                {companyDisplayText} {title} পদের জন্য যোগ্য ও আগ্রহী বাংলাদেশী নাগরিকদের কাছ থেকে আবেদন আহ্বান করা হচ্ছে।
                jobsboxbd.com ওয়েবসাইটে আমরা প্রতিদিন আজকের চাকরির খবর এবং সাপ্তাহিক চাকরির পত্রিকা থেকে সর্বশেষ আপডেট প্রকাশ করি।
            </p>
            <p>
                আগ্রহী প্রার্থীদের নির্ধারিত সময়ের মধ্যে আবেদন প্রক্রিয়া সম্পন্ন করার জন্য অনুরোধ করা হচ্ছে। আবেদনের যোগ্যতা, আবেদন পদ্ধতি, পরীক্ষার সময়সূচী, বেতন কাঠামো এবং অন্যান্য প্রয়োজনীয় তথ্যাবলী নিচে (যদি থাকে) এবং অফিসিয়াল নিয়োগ বিজ্ঞপ্তিতে বিস্তারিতভাবে উল্লেখ করা হয়েছে। এই {title} চাকরির বিজ্ঞপ্তি {CURRENT_YEAR} সংক্রান্ত সকল তথ্য মনোযোগ সহকারে পড়ুন।
            </p>
            <p>
                মনে রাখবেন, সঠিক তথ্যের জন্য সর্বদা মূল বিজ্ঞপ্তি অনুসরণ করুন। jobsboxbd.com বাংলাদেশের সকল প্রকার চাকরির নতুন নিয়োগ বিজ্ঞপ্তি {CURRENT_YEAR} সবার আগে আপনার কাছে পৌঁছে দিতে সচেষ্ট।
            </p>
        </>
    );
}

// generateHomepageJobSummary এবং generateMetaDescription ফাংশন দুটি অপরিবর্তিত থাকবে
// (যদি না সেগুলোতেও job.company_name ব্যবহারের প্রয়োজন পড়ে)

export function generateHomepageJobSummary(jobTitle, publishDate, categoryNames = [], maxLength = 140) {
    const title = jobTitle || "একটি নতুন পদে";
    const dateText = publishDate ? `${publishDate}` : "সাম্প্রতিক";
    let categoriesText = '';
    if (categoryNames.length > 0) {
        categoriesText = categoryNames[0];
    }

    let summary = `${categoriesText ? categoriesText + ' - ' : ''}${title} পদে নতুন নিয়োগ বিজ্ঞপ্তি ${CURRENT_YEAR}। এই চাকরিটি ${dateText} প্রকাশিত। বিস্তারিত জানতে ও আবেদন করতে ক্লিক করুন।`;

    if (summary.length > maxLength) {
        const truncated = summary.substring(0, maxLength);
        const lastSpaceIndex = truncated.lastIndexOf(" ");
        if (lastSpaceIndex > 0) {
            summary = truncated.substring(0, lastSpaceIndex) + "...";
        } else {
            summary = truncated + "...";
        }
    }
    return summary;
}

export function generateMetaDescription(jobTitle, publishDate, categoryNames = [], jobSource) {
    const title = jobTitle || "বিভিন্ন পদে";
    const dateText = publishDate ? `${publishDate}` : "সাম্প্রতিক";
    const sourceInfo = jobSource ? ` (সূত্র: ${jobSource})` : "";
    let categoriesInfo = '';
    if (categoryNames.length > 0) {
        categoriesInfo = categoryNames.join(', ') + ' সহ ';
    }

    return `${title} পদে নতুন নিয়োগ বিজ্ঞপ্তি ${CURRENT_YEAR}। ${categoriesInfo}এই চাকরিটি ${dateText} প্রকাশিত হয়েছে${sourceInfo}। Job Box BD-তে ${CURRENT_YEAR} সালের সর্বশেষ সরকারি চাকরি, বেসরকারি চাকরি, ব্যাংক জব ও কোম্পানির চাকরির খবর (Chakrir Khobor) দেখুন ও আবেদন করুন।`;
}
