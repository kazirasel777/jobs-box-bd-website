// pages/category/[slug].js

import Head from 'next/head';
import { useRouter } from 'next/router';
import axios from 'axios';
import Header from '../../components/Header';
import Link from 'next/link';
import { getCategoryDetails, getAllCategoriesForDisplay } from '../../utils/categories';
import { generateSlug } from '../../utils/slugify';
import { FaExternalLinkAlt } from 'react-icons/fa';
import { useEffect, useState, useCallback } from 'react';

const ITEMS_PER_PAGE = 10;

const CategoryPage = ({ jobsForCategory, category, allCategoriesForDisplay, totalJobsInCategory, error }) => {
  const router = useRouter();
  // allCategoriesForDisplay এখন থেকে Header এ পাস করা হবে
  const safeAllCategories = Array.isArray(allCategoriesForDisplay) ? allCategoriesForDisplay : [];


  const [currentPage, setCurrentPage] = useState(1);
  const [displayedJobs, setDisplayedJobs] = useState(jobsForCategory ? jobsForCategory.slice(0, ITEMS_PER_PAGE) : []);

  const totalPages = Math.ceil(totalJobsInCategory / ITEMS_PER_PAGE);

  useEffect(() => {
    if (jobsForCategory) {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        const endIndex = startIndex + ITEMS_PER_PAGE;
        setDisplayedJobs(jobsForCategory.slice(startIndex, endIndex));
    }
  }, [currentPage, jobsForCategory]);

  if (router.isFallback) { // যদি getStaticPaths এ fallback: true ব্যবহার করা হয়
    return <div>Loading category...</div>;
  }

  if (error || !category) {
    return (
      <div className="bg-gray-100 min-h-screen flex flex-col">
        <Head><title>ক্যাটাগরি পাওয়া যায়নি - Job Box BD</title></Head>
        <Header allCategories={safeAllCategories} currentSelectedCategory={null} /> {/* কোনো ক্যাটাগরি সিলেক্টেড নয় */}
        <main className="container mx-auto max-w-7xl py-20 text-center px-4 flex-grow flex flex-col justify-center">
          <div>
            <h1 className="text-3xl text-red-600 font-semibold">দুঃখিত!</h1>
            <p className="text-gray-600 mt-2">{error || "এই ক্যাটাগরি পাওয়া যায়নি।"}</p>
            <Link href="/" legacyBehavior>
              <a className="mt-6 inline-block px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition duration-150">
                হোমপেজে ফিরে যান
              </a>
            </Link>
          </div>
        </main>
        <footer className="bg-gray-800 text-gray-300 py-6 mt-auto">
          <div className="container mx-auto max-w-7xl text-center text-sm px-4">
            &copy; {new Date().getFullYear()} Job Box BD. সর্বস্বত্ব সংরক্ষিত।
          </div>
        </footer>
      </div>
    );
  }

  const handlePageChange = (pageNumber) => {
    if (pageNumber < 1 || pageNumber > totalPages) return;
    setCurrentPage(pageNumber);
  };

  const renderPagination = () => {
    if (totalPages <= 1) return null;
    const pageNumbers = [];
    const maxPagesToShow = 5;
    let startPage, endPage;
    if (totalPages <= maxPagesToShow) { startPage = 1; endPage = totalPages; }
    else { const maxPagesBeforeCurrentPage = Math.floor(maxPagesToShow / 2); const maxPagesAfterCurrentPage = Math.ceil(maxPagesToShow / 2) - 1; if (currentPage <= maxPagesBeforeCurrentPage) { startPage = 1; endPage = maxPagesToShow; } else if (currentPage + maxPagesAfterCurrentPage >= totalPages) { startPage = totalPages - maxPagesToShow + 1; endPage = totalPages; } else { startPage = currentPage - maxPagesBeforeCurrentPage; endPage = currentPage + maxPagesAfterCurrentPage; } }
    if (startPage > 1) { pageNumbers.push(1); if (startPage > 2) { pageNumbers.push('...'); } }
    for (let i = startPage; i <= endPage; i++) { pageNumbers.push(i); }
    if (endPage < totalPages) { if (endPage < totalPages - 1) { pageNumbers.push('...'); } pageNumbers.push(totalPages); }
    return ( <div className="mt-8 flex justify-center items-center space-x-1">{currentPage > 1 && (<button className="px-3 py-1 rounded-md bg-gray-200 text-gray-700 hover:bg-blue-400 hover:text-white text-sm transition-colors duration-150" onClick={() => handlePageChange(currentPage - 1)} aria-label="পূর্ববর্তী পৃষ্ঠা">পূর্ববর্তী</button>)}{pageNumbers.map((number, index) => typeof number === 'number' ? (<button key={`page-${number}`} className={`px-3 py-1 rounded-md text-sm transition-colors duration-150 ${currentPage === number ? 'bg-blue-500 text-white font-semibold' : 'bg-gray-200 text-gray-700 hover:bg-blue-400 hover:text-white'}`} onClick={() => handlePageChange(number)} aria-label={`পৃষ্ঠা ${number}`} aria-current={currentPage === number ? 'page' : undefined}>{number}</button>) : (<span key={`ellipsis-${index}`} className="px-3 py-1 text-gray-500">...</span>))}{currentPage < totalPages && (<button className="px-3 py-1 rounded-md bg-gray-200 text-gray-700 hover:bg-blue-400 hover:text-white text-sm transition-colors duration-150" onClick={() => handlePageChange(currentPage + 1)} aria-label="পরবর্তী পৃষ্ঠা">পরবর্তী</button>)}</div> );
  };

  const truncateDetails = (details, maxLength) => {
    if (!details || typeof details !== 'string') return '';
    if (details.length <= maxLength) return details;
    return details.substring(0, maxLength) + '...';
  };

  return (
    <div className="bg-gray-100 min-h-screen flex flex-col">
      <Head>
        <title>{category.name} - চাকরির খবর | Job Box BD</title>
        <link rel="icon" href="/favicon.ico" />
        <meta name="description" content={`${category.name} ক্যাটাগরিতে সর্বশেষ চাকরির খবর খুঁজুন Job Box BD তে।`} />
      </Head>

      <Header allCategories={safeAllCategories} currentSelectedCategory={category.id} /> {/* এখানে category.id পাস করা হচ্ছে */}

      <main className="container mx-auto max-w-7xl py-8 flex flex-col lg:flex-row lg:gap-x-6 flex-grow">
        <div className="w-full lg:flex-1">
          <h1 className="text-2xl md:text-3xl font-semibold text-gray-800 mb-6 px-4 lg:px-0">
            {category.name}
          </h1>
          <div className="space-y-6">
            {displayedJobs && displayedJobs.length > 0 ? (
              displayedJobs.map((job) => {
                if (!job || !job.id || !job.job_title) return null;
                 let jobLink = job.web_link || '';
                 if (jobLink && typeof jobLink === 'string' && !jobLink.startsWith('http://') && !jobLink.startsWith('https://')) {
                   jobLink = `https://${jobLink}`;
                 }
                return (
                  <article key={job.id} className="bg-white shadow-lg rounded-lg overflow-hidden flex flex-col md:flex-row">
                    {job.headlineImage && (
                      <div className="w-full md:w-64 flex-shrink-0 p-3 self-center">
                        <div className="aspect-w-16 aspect-h-9 overflow-hidden rounded-md border border-gray-200 bg-gray-50">
                          <img src={job.headlineImage} alt={job.job_title || 'Job Image'} className="w-full h-full object-cover" onError={(e) => { e.target.style.display = 'none'; }} />
                        </div>
                      </div>
                    )}
                    <div className="p-6 flex flex-col justify-between flex-grow">
                      <div>
                        <Link href={`/job/${generateSlug(job.job_title)}`} legacyBehavior>
                          <a className="text-lg md:text-xl font-semibold text-gray-900 hover:text-blue-600 block mb-2 leading-tight">{job.job_title}</a>
                        </Link>
                        <div className="flex items-center text-xs md:text-sm text-gray-500 mb-3 flex-wrap gap-x-3 gap-y-1">
                          {job.publishDate && <span>প্রকাশ: {job.publishDate}</span>}
                          {job.lastDate && <span>শেষ তারিখ: {job.lastDate}</span>}
                        </div>
                        {job.details && (<p className="text-gray-700 text-sm mb-4">{truncateDetails(job.details, 120)}</p>)}
                      </div>
                      <div className="mt-auto pt-2">
                        <Link href={`/job/${generateSlug(job.job_title)}`} legacyBehavior>
                          <a className="text-blue-500 hover:text-blue-700 font-medium flex items-center text-sm">বিস্তারিত দেখুন <FaExternalLinkAlt className="ml-1 w-3 h-3" /></a>
                        </Link>
                      </div>
                    </div>
                  </article>
                );
              })
            ) : (
              <div className="text-center text-gray-500 py-10 bg-white rounded-md shadow min-h-[200px] flex items-center justify-center">
                <p>এই ক্যাটাগরিতে বর্তমানে কোনো চাকরি নেই।</p>
              </div>
            )}
          </div>
          {displayedJobs && displayedJobs.length > 0 && totalPages > 1 && renderPagination()}
        </div>

        {/* আপনি চাইলে এখানেও একটি সাইডবার (অন্যান্য ক্যাটাগরি দেখানোর জন্য) রাখতে পারেন */}
        {/* <aside className="w-full lg:w-[20rem] mt-8 lg:mt-0"> ... </aside> */}

      </main>

      <footer className="bg-gray-800 text-gray-300 py-6 mt-auto">
        <div className="container mx-auto max-w-7xl text-center text-sm px-4">
          &copy; {new Date().getFullYear()} Job Box BD. সর্বস্বত্ব সংরক্ষিত।
        </div>
      </footer>
    </div>
  );
};

export async function getServerSideProps(context) {
  const { slug } = context.params;
  const category = getCategoryDetails(slug); // স্লাগ থেকে ক্যাটাগরির তথ্য (id, name, slug) পাওয়া
  const allCategoriesForDisplay = getAllCategoriesForDisplay(); // সব ক্যাটাগরির তালিকা

  if (!category) {
    return {
      props: {
        jobsForCategory: [],
        category: null,
        allCategoriesForDisplay: JSON.parse(JSON.stringify(allCategoriesForDisplay)),
        totalJobsInCategory: 0,
        error: "ক্যাটাগরি পাওয়া যায়নি",
      },
    };
  }

  let allJobs = [];
  try {
    const response = await axios.get('https://adminjobs.kaziitstudio.com/job_post_api.php');
    allJobs = response.data && Array.isArray(response.data.jobs) ? response.data.jobs : [];
    allJobs = allJobs.map(job => ({
        ...job,
        category_id: Array.isArray(job.category_id) ? job.category_id.map(id => Number(id)) : (job.category_id ? [Number(job.category_id)] : [])
    }));
  } catch (error) {
    console.error("Error fetching jobs in category page getServerSideProps:", error.message);
    // API থেকে ডেটা না পেলেও যেন পেজ রেন্ডার হয়, খালি জব লিস্ট নিয়ে
  }

  const jobsForCategory = allJobs.filter(job => {
    const jobCatIds = Array.isArray(job.category_id) ? job.category_id : [];
    return jobCatIds.includes(category.id);
  });

  return {
    props: {
      jobsForCategory: JSON.parse(JSON.stringify(jobsForCategory)),
      category: JSON.parse(JSON.stringify(category)), // পুরো category অবজেক্ট পাস করা হচ্ছে
      allCategoriesForDisplay: JSON.parse(JSON.stringify(allCategoriesForDisplay)),
      totalJobsInCategory: jobsForCategory.length,
    },
  };
}

export default CategoryPage;
