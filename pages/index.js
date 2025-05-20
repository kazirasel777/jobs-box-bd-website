// pages/index.js

import Head from 'next/head';
import Header from '../components/Header';
import axios from 'axios';
import { FaExternalLinkAlt, FaSearch } from 'react-icons/fa';
import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { getAllCategoriesForDisplay, getCategoryName } from '../utils/categories';
import { generateSlug } from '../utils/slugify';
import { generateHomepageJobSummary } from '../utils/jobDescriptionUtils';

const ITEMS_PER_PAGE = 10;

const Home = ({ initialJobs, totalJobs, allCategoriesFromSSR }) => {
  const safeInitialJobs = Array.isArray(initialJobs) ? initialJobs : [];
  const safeAllCategories = Array.isArray(allCategoriesFromSSR) ? allCategoriesFromSSR : [];

  const [currentPage, setCurrentPage] = useState(1);
  const [jobs, setJobs] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const getFilteredJobs = useCallback(() => {
    let filtered = safeInitialJobs;
    if (selectedCategory) {
      filtered = filtered.filter(job => {
        const jobCatIds = Array.isArray(job.category_id) ? job.category_id.map(Number) : (job.category_id ? [Number(job.category_id)] : []);
        return jobCatIds.includes(Number(selectedCategory));
      });
    }
    if (searchTerm) {
      filtered = filtered.filter(job => job.job_title && job.job_title.toLowerCase().includes(searchTerm.toLowerCase()));
    }
    return filtered;
  }, [safeInitialJobs, selectedCategory, searchTerm]);

  const calculateTotalPages = useCallback(() => {
    const filteredCount = getFilteredJobs().length;
    return Math.ceil(filteredCount / ITEMS_PER_PAGE);
  }, [getFilteredJobs]);

  useEffect(() => {
    const filteredAndSearchedJobs = getFilteredJobs();
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    setJobs(filteredAndSearchedJobs.slice(startIndex, endIndex));
  }, [currentPage, getFilteredJobs]); // ITEMS_PER_PAGE যদি পরিবর্তিত না হয়, তাহলে dependency হিসেবে না দিলেও চলে

  const filterJobsByCategory = (categoryId) => {
    setSelectedCategory(categoryId);
    setCurrentPage(1);
    setSearchTerm('');
  };

  const handleSelectAllJobs = () => {
    setSelectedCategory(null);
    setCurrentPage(1);
    setSearchTerm('');
  };

  const handlePageChange = (pageNumber) => {
    const currentTotalPages = calculateTotalPages();
    if (pageNumber < 1 || pageNumber > currentTotalPages) return;
    setCurrentPage(pageNumber);
  };

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
    setCurrentPage(1);
    setSelectedCategory(null);
  };

  const renderPagination = () => {
    const currentTotalPages = calculateTotalPages();
    if (currentTotalPages <= 1) return null;
    const pageNumbers = [];
    const maxPagesToShow = 5;
    let startPage, endPage;

    if (currentTotalPages <= maxPagesToShow) {
      startPage = 1;
      endPage = currentTotalPages;
    } else {
      const maxPagesBeforeCurrentPage = Math.floor(maxPagesToShow / 2);
      const maxPagesAfterCurrentPage = Math.ceil(maxPagesToShow / 2) - 1;
      if (currentPage <= maxPagesBeforeCurrentPage) {
        startPage = 1;
        endPage = maxPagesToShow;
      } else if (currentPage + maxPagesAfterCurrentPage >= currentTotalPages) {
        startPage = currentTotalPages - maxPagesToShow + 1;
        endPage = currentTotalPages;
      } else {
        startPage = currentPage - maxPagesBeforeCurrentPage;
        endPage = currentPage + maxPagesAfterCurrentPage;
      }
    }

    if (startPage > 1) {
      pageNumbers.push(1);
      if (startPage > 2) {
        pageNumbers.push('...');
      }
    }
    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }
    if (endPage < currentTotalPages) {
      if (endPage < currentTotalPages - 1) {
        pageNumbers.push('...');
      }
      pageNumbers.push(currentTotalPages);
    }
    return (
      <div className="mt-8 flex justify-center items-center space-x-1">
        {currentPage > 1 && (
          <button
            className="px-3 py-1 rounded-md bg-gray-200 text-gray-700 hover:bg-blue-400 hover:text-white text-sm transition-colors duration-150"
            onClick={() => handlePageChange(currentPage - 1)}
            aria-label="পূর্ববর্তী পৃষ্ঠা"
          >
            পূর্ববর্তী
          </button>
        )}
        {pageNumbers.map((number, index) =>
          typeof number === 'number' ? (
            <button
              key={`page-${number}`}
              className={`px-3 py-1 rounded-md text-sm transition-colors duration-150 ${
                currentPage === number
                  ? 'bg-blue-500 text-white font-semibold'
                  : 'bg-gray-200 text-gray-700 hover:bg-blue-400 hover:text-white'
              }`}
              onClick={() => handlePageChange(number)}
              aria-label={`পৃষ্ঠা ${number}`}
              aria-current={currentPage === number ? 'page' : undefined}
            >
              {number}
            </button>
          ) : (
            <span key={`ellipsis-${index}`} className="px-3 py-1 text-gray-500">
              ...
            </span>
          )
        )}
        {currentPage < currentTotalPages && (
          <button
            className="px-3 py-1 rounded-md bg-gray-200 text-gray-700 hover:bg-blue-400 hover:text-white text-sm transition-colors duration-150"
            onClick={() => handlePageChange(currentPage + 1)}
            aria-label="পরবর্তী পৃষ্ঠা"
          >
            পরবর্তী
          </button>
        )}
      </div>
    );
  };

  const noJobsMessage = searchTerm
    ? `"${searchTerm}" এর জন্য কোনো ফলাফল পাওয়া যায়নি।`
    : (selectedCategory
        ? `${getCategoryName(selectedCategory)} ক্যাটাগরিতে কোনো চাকরি নেই।`
        : "এখন কোনো চাকরি উপলব্ধ নেই।");

  const currentYear = new Date().getFullYear(); // ২০২৫

  // --- SEO-বান্ধব টাইটেল এবং মেটা ডেসক্রিপশন ---
  let pageTitleText = '';
  let metaDescriptionText = '';

  if (selectedCategory) {
    const categoryName = getCategoryName(selectedCategory);
    pageTitleText = `${categoryName} পদে চাকরির খবর ${currentYear} - সর্বশেষ নিয়োগ বিজ্ঞপ্তি | Job Box BD`;
    metaDescriptionText = `${categoryName} পদে সর্বশেষ চাকরির বিজ্ঞপ্তি ${currentYear} (Job Circular) ও চাকরির খবর (Chakrir Khobor) খুঁজুন Job Box BD-তে। আপনার পছন্দের ${categoryName.toLowerCase()} চাকরি এখানে পাবেন।`;
  } else if (searchTerm) {
    pageTitleText = `"${searchTerm}" সম্পর্কিত চাকরির খবর ${currentYear} | Job Box BD`;
    metaDescriptionText = `"${searchTerm}" সম্পর্কিত সর্বশেষ চাকরির বিজ্ঞপ্তি (Latest Niyog Biggopti) ও চাকরির খবর ${currentYear} (Recent Chakrir Khobor) খুঁজুন Job Box BD-তে।`;
  }
  else {
    // সাধারণ হোমপেজের জন্য
    pageTitleText = `চাকরির খবর ${currentYear} - সর্বশেষ নিয়োগ বিজ্ঞপ্তি, সরকারি চাকরি, বেসরকারি, ব্যাংক জব | Job Box BD`;
    metaDescriptionText = `বাংলাদেশের সর্বশেষ চাকরির খবর ${currentYear} (Latest Job News BD) ও সকল প্রকার নিয়োগ বিজ্ঞপ্তি (All Job Circular ${currentYear}) পেতে Job Box BD ভিজিট করুন। সরকারি চাকরি (Sarkari Chakri), বেসরকারি চাকরি (Besarkari Chakri), ব্যাংক জব (Bank Job Circular), এনজিও ও কোম্পানির চাকরির বিজ্ঞপ্তি এখানে পাবেন।`;
  }
  // --- SEO-বান্ধব টাইটেল এবং মেটা ডেসক্রিপশন শেষ ---

  return (
    <div className="bg-gray-100 min-h-screen flex flex-col">
      <Head>
        <title>{pageTitleText}</title>
        <link rel="icon" href="/favicon.ico" />
        <meta name="description" content={metaDescriptionText} />
      </Head>

      <Header
        allCategories={safeAllCategories}
        currentSelectedCategory={selectedCategory}
        onSelectAllJobs={handleSelectAllJobs}
      />

      <main className="container mx-auto max-w-7xl py-8 flex flex-col lg:flex-row lg:gap-x-6 flex-grow">
        <div className="w-full lg:flex-1">
          <div className="space-y-6">
            {jobs && jobs.length > 0 ? (
              jobs.map((job) => {
                if (!job || !job.id || !job.job_title) {
                  console.warn("Skipping invalid job object:", job);
                  return null;
                }
                let jobLink = job.web_link || '';
                if (jobLink && typeof jobLink === 'string' && !jobLink.startsWith('http://') && !jobLink.startsWith('https://')) {
                  jobLink = `https://${jobLink}`;
                }

                const jobCatIds = Array.isArray(job.category_id)
                    ? job.category_id.map(Number)
                    : (job.category_id ? [Number(job.category_id)] : []);
                const currentJobCategoryNames = jobCatIds
                    .map(id => getCategoryName(id))
                    .filter(name => name && !name.startsWith('ক্যাটাগরি '));

                const homepageSummary = generateHomepageJobSummary(job.job_title, job.publishDate, currentJobCategoryNames);

                return (
                  <article key={job.id} className="bg-white shadow-lg rounded-lg overflow-hidden flex flex-col md:flex-row">
                    {job.headlineImage && (
                      <div className="w-full md:w-64 flex-shrink-0 p-3 self-center">
                        <div className="aspect-w-16 aspect-h-9 overflow-hidden rounded-md border border-gray-200 bg-gray-50">
                          <img
                            src={job.headlineImage}
                            alt={job.job_title || 'Job Image'}
                            className="w-full h-full object-cover"
                            onError={(e) => { e.target.style.display = 'none'; }}
                          />
                        </div>
                      </div>
                    )}
                    <div className="p-6 flex flex-col justify-between flex-grow">
                      <div>
                        <Link href={`/job/${generateSlug(job.job_title)}`} legacyBehavior>
                          <a className="text-lg md:text-xl font-semibold text-gray-900 hover:text-blue-600 block mb-2 leading-tight">
                            {job.job_title}
                          </a>
                        </Link>
                        <div className="flex items-center text-xs md:text-sm text-gray-500 mb-3 flex-wrap gap-x-3 gap-y-1">
                          {job.publishDate && <span>প্রকাশ: {job.publishDate}</span>}
                          {job.lastDate && <span>শেষ তারিখ: {job.lastDate}</span>}
                        </div>
                        {homepageSummary && (
                          <p className="text-gray-700 text-sm mb-4 leading-relaxed">{homepageSummary}</p>
                        )}
                      </div>
                      <div className="mt-auto pt-2">
                        <Link href={`/job/${generateSlug(job.job_title)}`} legacyBehavior>
                          <a className="text-blue-500 hover:text-blue-700 font-medium flex items-center text-sm">
                            বিস্তারিত দেখুন <FaExternalLinkAlt className="ml-1 w-3 h-3" />
                          </a>
                        </Link>
                      </div>
                    </div>
                  </article>
                );
              })
            ) : (
              <div className="text-center text-gray-500 py-10 bg-white rounded-md shadow min-h-[200px] flex items-center justify-center">
                <p>{noJobsMessage}</p>
              </div>
            )}
          </div>
          {jobs && jobs.length > 0 && calculateTotalPages() > 1 && renderPagination()}
        </div>

        <aside className="w-full lg:w-[20rem] mt-8 lg:mt-0">
          <div className="mb-6 relative">
            <input
              type="text"
              placeholder="চাকরি খুঁজুন..."
              className="w-full pl-4 pr-10 py-2 rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
              value={searchTerm}
              onChange={handleSearch}
              aria-label="চাকরি খোঁজার ইনপুট"
            />
            <FaSearch className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>

          <div className="bg-white shadow-lg rounded-lg p-4 sticky top-24 w-full">
            <h3 className="text-lg font-semibold mb-3 pb-2 border-b border-gray-200 text-gray-800">ক্যাটাগরি</h3>
            {(safeAllCategories && safeAllCategories.length > 0) ? (
              <ul className="space-y-1 max-h-96 overflow-y-auto py-1">
                {safeAllCategories.map(category => (
                  <li key={category.id}>
                    <button
                      className={`w-full text-left px-3 py-2 rounded text-sm transition duration-150 ease-in-out ${
                        selectedCategory === category.id ? 'font-semibold text-blue-700 bg-blue-100' : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                      }`}
                      onClick={() => filterJobsByCategory(category.id)}
                    >
                      {category.name}
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-500">কোনো ক্যাটাগরি পাওয়া যায়নি।</p>
            )}
          </div>
        </aside>
      </main>

      <footer className="bg-gray-800 text-gray-300 py-6 mt-auto">
        <div className="container mx-auto max-w-7xl text-center text-sm px-4">
          &copy; {new Date().getFullYear()} Job Box BD. সর্বস্বত্ব সংরক্ষিত।
        </div>
      </footer>
    </div>
  );
};

export async function getServerSideProps() {
  console.log("--- getServerSideProps START (pages/index.js) ---");
  let initialJobs = [];
  let totalJobs = 0;
  const allCategoriesFromSSR = getAllCategoriesForDisplay();

  try {
    console.log("Fetching API data (pages/index.js)...");
    const response = await axios.get('https://adminjobs.kaziitstudio.com/job_post_api.php');
    // console.log("API Fetch successful (pages/index.js). Status:", response.status); // অপ্রয়োজনীয় লগ বাদ দেওয়া হলো

    initialJobs = response.data && Array.isArray(response.data.jobs) ? response.data.jobs : [];
    totalJobs = initialJobs.length;
    // console.log("Fetched jobs count (pages/index.js):", totalJobs); // অপ্রয়োজনীয় লগ বাদ দেওয়া হলো

    initialJobs = initialJobs.map(job => ({
        ...job,
        category_id: job.category_id
            ? (Array.isArray(job.category_id) ? job.category_id.map(id => Number(id)) : [Number(job.category_id)])
            : []
    }));

  } catch (error) {
    console.error("Error in getServerSideProps fetching jobs (pages/index.js):", error.message);
  } finally {
    console.log("--- getServerSideProps END (pages/index.js) ---");
  }

  const serializableJobs = JSON.parse(JSON.stringify(initialJobs));
  const serializableCategories = JSON.parse(JSON.stringify(allCategoriesFromSSR));

  return {
    props: {
      initialJobs: serializableJobs,
      totalJobs: totalJobs,
      allCategoriesFromSSR: serializableCategories
    }
  };
}

export default Home;
