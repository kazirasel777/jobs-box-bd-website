// pages/index.js

import Head from 'next/head';
import Header from '../components/Header';
import axios from 'axios';
import { FaExternalLinkAlt, FaSearch } from 'react-icons/fa';
import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { getAllCategoriesForDisplay, getCategoryName } from '../utils/categories';
import { generateSlug } from '../utils/slugify';
// নতুন ইউটিলিটি ফাংশন ইম্পোর্ট করুন
import { generateHomepageJobSummary } from '../utils/jobDescriptionUtils'; // সঠিক পাথ নিশ্চিত করুন

const ITEMS_PER_PAGE = 10;

const Home = ({ initialJobs, totalJobs, allCategoriesFromSSR }) => {
    const safeInitialJobs = Array.isArray(initialJobs) ? initialJobs : [];
    const safeAllCategories = Array.isArray(allCategoriesFromSSR) ? allCategoriesFromSSR : [];

    const [currentPage, setCurrentPage] = useState(1);
    const [jobs, setJobs] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    // ... (getFilteredJobs, calculateTotalPages, useEffect, filterJobsByCategory, handleSelectAllJobs, handlePageChange, handleSearch অপরিবর্তিত থাকবে) ...
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
    }, [currentPage, getFilteredJobs]);

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


    // truncateDetails ফাংশনটি আর প্রয়োজন নেই, কারণ generateHomepageJobSummary নিজেই truncation হ্যান্ডেল করবে
    /*
    const truncateDetails = (details, maxLength) => {
        if (!details || typeof details !== 'string') return '';
        if (details.length <= maxLength) return details;
        return details.substring(0, maxLength) + '...';
    };
    */

    const renderPagination = () => {
        // ... (renderPagination অপরিবর্তিত) ...
        const currentTotalPages = calculateTotalPages();
        if (currentTotalPages <= 1) return null;
        const pageNumbers = [];
        const maxPagesToShow = 5;
        let startPage, endPage;
        if (currentTotalPages <= maxPagesToShow) { startPage = 1; endPage = currentTotalPages; }
        else { const maxPagesBeforeCurrentPage = Math.floor(maxPagesToShow / 2); const maxPagesAfterCurrentPage = Math.ceil(maxPagesToShow / 2) - 1; if (currentPage <= maxPagesBeforeCurrentPage) { startPage = 1; endPage = maxPagesToShow; } else if (currentPage + maxPagesAfterCurrentPage >= currentTotalPages) { startPage = currentTotalPages - maxPagesToShow + 1; endPage = currentTotalPages; } else { startPage = currentPage - maxPagesBeforeCurrentPage; endPage = currentPage + maxPagesAfterCurrentPage; } }
        if (startPage > 1) { pageNumbers.push(1); if (startPage > 2) { pageNumbers.push('...'); } }
        for (let i = startPage; i <= endPage; i++) { pageNumbers.push(i); }
        if (endPage < currentTotalPages) { if (endPage < currentTotalPages - 1) { pageNumbers.push('...'); } pageNumbers.push(currentTotalPages); }
        return ( <div className="mt-8 flex justify-center items-center space-x-1">{currentPage > 1 && (<button className="px-3 py-1 rounded-md bg-gray-200 text-gray-700 hover:bg-blue-400 hover:text-white text-sm transition-colors duration-150" onClick={() => handlePageChange(currentPage - 1)} aria-label="পূর্ববর্তী পৃষ্ঠা">পূর্ববর্তী</button>)}{pageNumbers.map((number, index) => typeof number === 'number' ? (<button key={`page-${number}`} className={`px-3 py-1 rounded-md text-sm transition-colors duration-150 ${currentPage === number ? 'bg-blue-500 text-white font-semibold' : 'bg-gray-200 text-gray-700 hover:bg-blue-400 hover:text-white'}`} onClick={() => handlePageChange(number)} aria-label={`পৃষ্ঠা ${number}`} aria-current={currentPage === number ? 'page' : undefined}>{number}</button>) : (<span key={`ellipsis-${index}`} className="px-3 py-1 text-gray-500">...</span>))}{currentPage < currentTotalPages && (<button className="px-3 py-1 rounded-md bg-gray-200 text-gray-700 hover:bg-blue-400 hover:text-white text-sm transition-colors duration-150" onClick={() => handlePageChange(currentPage + 1)} aria-label="পরবর্তী পৃষ্ঠা">পরবর্তী</button>)}</div> );
    };

    const noJobsMessage = searchTerm
        ? `"${searchTerm}" এর জন্য কোনো ফলাফল পাওয়া যায়নি।`
        : (selectedCategory
            ? `${getCategoryName(selectedCategory)} ক্যাটাগরিতে কোনো চাকরি নেই।`
            : "এখন কোনো চাকরি উপলব্ধ নেই।");

    return (
        <div className="bg-gray-100 min-h-screen flex flex-col">
            <Head>
                <title>Jobs Box BD - চাকরির খবর ({selectedCategory ? getCategoryName(selectedCategory) : 'সকল'})</title>
                <link rel="icon" href="/favicon.ico" />
                <meta name="description" content={`বাংলাদেশে ${selectedCategory ? getCategoryName(selectedCategory) : 'সকল প্রকার'} চাকরির সর্বশেষ খবর খুঁজুন। Job Box BD তে সরকারি, বেসরকারি, ব্যাংক, এনজিও এবং অন্যান্য চাকরির বিজ্ঞপ্তি পাওয়া যায়।`} />
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

                                // --- হোমপেজের জন্য ডাইনামিক সংক্ষিপ্ত বিবরণ ---
                                const homepageSummary = generateHomepageJobSummary(job.job_title, job.publishDate);
                                // --- শেষ ---

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
                                                {/* --- পরিবর্তিত বিবরণী অংশ --- */}
                                                {homepageSummary && (
                                                    <p className="text-gray-700 text-sm mb-4">{homepageSummary}</p>
                                                )}
                                                {/* --- শেষ --- */}
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

                {/* ... সাইডবার (অপরিবর্তিত) ... */}
                <aside className="w-full lg:w-[20rem] mt-8 lg:mt-0">
                    {/* ... */}
                </aside>
            </main>

            {/* ... ফুটার (অপরিবর্তিত) ... */}
             <footer className="bg-gray-800 text-gray-300 py-6 mt-auto">
                {/* ... */}
            </footer>
        </div>
    );
};

// ... (getServerSideProps অপরিবর্তিত থাকবে) ...
export async function getServerSideProps() {
  console.log("--- getServerSideProps START ---");
  let initialJobs = [];
  let totalJobs = 0;
  const allCategoriesForSSR = getAllCategoriesForDisplay();

  try {
    console.log("Fetching API data...");
    const response = await axios.get('https://adminjobs.kaziitstudio.com/job_post_api.php');
    console.log("API Fetch successful. Status:", response.status);

    initialJobs = response.data && Array.isArray(response.data.jobs) ? response.data.jobs : [];
    totalJobs = initialJobs.length;
    console.log("Fetched jobs count:", totalJobs);

    initialJobs = initialJobs.map(job => ({
        ...job,
        category_id: Array.isArray(job.category_id)
            ? job.category_id.map(id => Number(id))
            : (job.category_id ? Number(job.category_id) : null)
    }));

  } catch (error) {
    console.error("Error in getServerSideProps fetching jobs:", error.message);
  } finally {
    console.log("--- getServerSideProps END ---");
  }

  const serializableJobs = JSON.parse(JSON.stringify(initialJobs));
  const serializableCategories = JSON.parse(JSON.stringify(allCategoriesForSSR));

  return {
    props: {
      initialJobs: serializableJobs,
      totalJobs: totalJobs,
      allCategoriesFromSSR: serializableCategories
    }
  };
}


export default Home;
