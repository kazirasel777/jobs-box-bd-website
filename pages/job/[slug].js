// pages/job/[slug].js

import Head from 'next/head';
import axios from 'axios';
import Link from 'next/link';
import Header from '../../components/Header'; // সঠিক পাথ নিশ্চিত করুন
import { generateSlug } from '../../utils/slugify'; // সঠিক পাথ
// getCategoryName (আইডি থেকে নাম পাওয়ার জন্য) এবং getAllCategoriesForDisplay (হেডারের জন্য সব ক্যাটাগরি পেতে) ইম্পোর্ট করা হচ্ছে
import { getCategoryName, getAllCategoriesForDisplay } from '../../utils/categories'; // সঠিক পাথ
import { FaExternalLinkAlt, FaRegClock, FaRegCalendarAlt, FaRegNewspaper, FaUsers, FaThList } from 'react-icons/fa';
import { useRouter } from 'next/router'; // যদি fallback ব্যবহার করা হয়

const JobDetailsPage = ({ job, allCategories, error }) => {
    const router = useRouter();
    // allCategories এখন getAllCategoriesForDisplay থেকে আসা id, name, slug সহ অবজেক্ট এর অ্যারে
    const safeAllCategories = Array.isArray(allCategories) ? allCategories : [];

    // যদি getStaticPaths এ fallback: true ব্যবহার করা হয়, তাহলে লোডিং স্টেট দেখানো যেতে পারে
    if (router.isFallback) {
        return (
            <div className="bg-gray-50 min-h-screen flex flex-col justify-center items-center">
                <div>লোড হচ্ছে...</div>
            </div>
        );
    }

    if (error || !job) {
        const pageTitle = error ? "ত্রুটি - Job Box BD" : "চাকরি পাওয়া যায়নি - Job Box BD";
        const message = error || "আপনি যে চাকরিটি খুঁজছেন তা পাওয়া যায়নি অথবা লিংকটি সঠিক নয়।";

        return (
             <div className="bg-gray-50 min-h-screen flex flex-col">
                <Head><title>{pageTitle}</title></Head>
                {/* Header এ currentSelectedCategory হিসেবে null পাঠানো হচ্ছে, কারণ এটি কোনো নির্দিষ্ট ক্যাটাগরি পেজ নয় */}
                <Header allCategories={safeAllCategories} currentSelectedCategory={null} onSelectAllJobs={null} />
                <main className="container mx-auto max-w-7xl py-20 text-center px-4 flex-grow flex flex-col justify-center">
                    <div>
                        <h1 className="text-3xl text-red-600 font-semibold">দুঃখিত!</h1>
                        <p className="text-gray-600 mt-2">{message}</p>
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

    let applicationLink = job.web_link || '';
    if (applicationLink && typeof applicationLink === 'string' && !applicationLink.startsWith('http://') && !applicationLink.startsWith('https://')) {
        applicationLink = `https://${applicationLink}`;
    }

    const formattedDetails = job.details
        ? job.details.split('\n').map((line, index) => line.trim() ? <p key={index} className="mb-2 last:mb-0">{line}</p> : null).filter(Boolean)
        : null;

    // job.category_id এখন একটি নাম্বার অ্যারে হবে (getServerSideProps থেকে)
    const jobCategoryNames = (job.category_id || [])
                             .map(id => getCategoryName(id)) // আইডি থেকে সরাসরি নাম
                             .filter(name => name && !name.startsWith('ক্যাটাগরি ')); // "ক্যাটাগরি X" বাদ দেওয়া


    // হেডার এ দেখানোর জন্য বর্তমান চাকরির প্রথম ক্যাটাগরি আইডি (যদি থাকে)
    const currentJobPrimaryCategoryId = (job.category_id && job.category_id.length > 0) ? job.category_id[0] : null;

    return (
        <div className="bg-gray-50 min-h-screen flex flex-col">
            <Head>
                <title>{`${job.job_title} | Job Box BD`}</title>
                <meta name="description" content={truncateDetails(job.details, 160) || `${job.job_title} সার্কুলার (${job.publishDate || ''})। উৎস: ${job.jobSource || ''}। বিস্তারিত দেখুন Job Box BD তে।`} />
                <link rel="icon" href="/favicon.ico" />
            </Head>

            <Header
                allCategories={safeAllCategories}
                currentSelectedCategory={currentJobPrimaryCategoryId} // চাকরির প্রথম ক্যাটাগরি আইডি পাঠানো হচ্ছে
                onSelectAllJobs={null} // জব ডিটেইলস পেজে onSelectAllJobs এর বিশেষ কোনো কাজ নেই, তাই null
            />

            <main className="container mx-auto max-w-7xl py-8 px-4 flex-grow">
                <div className="lg:flex lg:gap-x-8">
                     <article className="w-full lg:flex-1 bg-white p-6 md:p-8 rounded-lg shadow-xl mb-6 lg:mb-0">
                        <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6 border-b pb-4">{job.job_title}</h1>

                        <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 border border-indigo-100 rounded-lg p-6 mb-8 shadow-sm">
                            <h2 className="text-xl font-semibold text-gray-700 mb-5">একনজরে গুরুত্বপূর্ণ তথ্য</h2>
                            <div className="space-y-3 text-base">
                                {job.publishDate && <div className="flex items-center"><FaRegCalendarAlt className="mr-2 text-indigo-500 flex-shrink-0 w-4 h-4"/> <strong className="text-gray-600 mr-1">প্রকাশের তারিখ:</strong> <span className="text-gray-800">{job.publishDate}</span></div>}
                                {job.jobSource && <div className="flex items-center"><FaRegNewspaper className="mr-2 text-indigo-500 flex-shrink-0 w-4 h-4"/> <strong className="text-gray-600 mr-1">সূত্র:</strong> <span className="text-gray-800">{job.jobSource}</span></div>}
                                {job.applicationStartDate && <div className="flex items-center"><FaRegCalendarAlt className="mr-2 text-green-500 flex-shrink-0 w-4 h-4"/> <strong className="text-gray-600 mr-1">আবেদন শুরু:</strong> <span className="text-gray-800">{job.applicationStartDate}</span></div>}
                                {job.lastDate && <div className="flex items-center"><FaRegCalendarAlt className="mr-2 text-red-500 flex-shrink-0 w-4 h-4"/> <strong className="text-gray-600 mr-1">আবেদনের শেষ:</strong> <span className="text-gray-800">{job.lastDate}</span></div>}
                                {job.daysLeft && job.daysLeft !== "Expired" && job.daysLeft !== "Expiring Today" && <div className="flex items-center"><FaRegClock className="mr-2 text-indigo-500 flex-shrink-0 w-4 h-4"/> <strong className="text-gray-600 mr-1">আবেদনের বাকি:</strong> <span className="text-gray-800">{job.daysLeft} দিন</span></div>}
                                {job.daysLeft && job.daysLeft === "Expiring Today" && <div className="flex items-center"><FaRegClock className="mr-2 text-red-500 flex-shrink-0 w-4 h-4"/> <strong className="text-gray-600 mr-1">আবেদনের বাকি:</strong> <span className="text-red-600 font-semibold">{job.daysLeft}</span></div>}
                                {jobCategoryNames && jobCategoryNames.length > 0 &&
                                    <div className="flex items-start">
                                        <FaThList className="mr-2 text-indigo-500 flex-shrink-0 w-4 h-4 mt-1"/>
                                        <strong className="text-gray-600 mr-1 mt-0.5">ক্যাটাগরি:</strong>
                                        <div className="flex flex-wrap gap-1 ml-1">
                                            {jobCategoryNames.map(name => (
                                                <span key={name} className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full text-xs font-medium">{name}</span>
                                            ))}
                                        </div>
                                    </div>
                                }
                                {job.total_vacancy && <div className="flex items-center"><FaUsers className="mr-2 text-indigo-500 flex-shrink-0 w-4 h-4"/> <strong className="text-gray-600 mr-1">মোট পদ সংখ্যা:</strong> <span className="text-gray-800">{job.total_vacancy}</span></div>}
                                {applicationLink && !applicationLink.includes('jobsboxbd.com') &&
                                    <div className="flex items-start">
                                        <FaExternalLinkAlt className="mr-2 text-blue-500 mt-1 flex-shrink-0 w-4 h-4"/>
                                        <strong className="text-gray-600 mr-1 mt-0.5">আবেদন লিংক:</strong>
                                        <a href={applicationLink} target="_blank" rel="noopener noreferrer nofollow" className="text-blue-600 hover:underline break-all ml-1">
                                            {applicationLink.replace(/^https?:\/\//, '')}
                                        </a>
                                    </div>
                                }
                            </div>
                        </div>

                        {(job.circularImage1 || job.circularImage2 || job.circularImage3 || job.circularImage4) && (
                             <div className="mb-8">
                                <h2 className="text-xl font-semibold mb-4 text-gray-700 border-t pt-6">অফিসিয়াল বিজ্ঞপ্তি / ছবি</h2>
                                <div className="space-y-4">
                                    {job.circularImage1 && <img loading="lazy" src={job.circularImage1} alt={`${job.job_title} - সার্কুলার ১`} className="rounded border border-gray-200 w-full shadow-sm block"/>}
                                    {job.circularImage2 && <img loading="lazy" src={job.circularImage2} alt={`${job.job_title} - সার্কুলার ২`} className="rounded border border-gray-200 w-full shadow-sm block"/>}
                                    {job.circularImage3 && <img loading="lazy" src={job.circularImage3} alt={`${job.job_title} - সার্কুলার ৩`} className="rounded border border-gray-200 w-full shadow-sm block"/>}
                                    {job.circularImage4 && <img loading="lazy" src={job.circularImage4} alt={`${job.job_title} - সার্কুলার ৪`} className="rounded border border-gray-200 w-full shadow-sm block"/>}
                                </div>
                             </div>
                         )}

                        {formattedDetails && (
                            <div className="prose prose-sm sm:prose lg:prose-lg max-w-none text-gray-800 mb-6 border-t pt-6">
                                <h2 className="text-xl font-semibold mb-4 text-gray-700">বিস্তারিত তথ্য</h2>
                                <div className="space-y-4 text-justify">{formattedDetails}</div>
                            </div>
                        )}
                        {!job.circularImage1 && !formattedDetails && (
                            <p className="text-gray-500 mb-6 border-t pt-6">এই চাকরির বিস্তারিত তথ্য বা বিজ্ঞপ্তি পাওয়া যায়নি।</p>
                        )}
                        {job.notice && (
                            <div className="mb-6 p-4 bg-yellow-100 border-l-4 border-yellow-500 rounded shadow-sm">
                                <h3 className="font-semibold text-yellow-800 mb-1">বিশেষ নোটিশ</h3>
                                <p className="text-sm text-yellow-700">{job.notice}</p>
                            </div>
                        )}

                     </article>

                     <aside className="w-full lg:w-[20rem] mt-6 lg:mt-0">
                        <div className="bg-white p-4 rounded-lg shadow-lg sticky top-24 w-full">
                            <h3 className="text-lg font-semibold mb-3 text-gray-700">অন্যান্য চাকরি</h3>
                            <p className="text-sm text-gray-600">সম্পর্কিত চাকরির তালিকা শীঘ্রই আসছে...</p>
                        </div>
                     </aside>
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

export async function getServerSideProps(context) {
    const { slug } = context.params; // URL থেকে স্লাগ নেওয়া হচ্ছে
    let job = null;
    // getAllCategoriesForDisplay ব্যবহার করে হেডারের জন্য সব ক্যাটাগরি (id, name, slug সহ) নেওয়া হচ্ছে
    const allCategories = getAllCategoriesForDisplay();

    try {
        const response = await axios.get('https://adminjobs.kaziitstudio.com/job_post_api.php');
        const jobs = response.data && Array.isArray(response.data.jobs) ? response.data.jobs : [];

        job = jobs.find(j => {
            if (!j || !j.job_title) return false;
            const jobSlug = generateSlug(String(j.job_title)); // job_title কে স্ট্রিং এ কনভার্ট করা হচ্ছে
            return jobSlug === slug;
        });

        if (!job) {
            return { props: { job: null, allCategories: JSON.parse(JSON.stringify(allCategories)), error: "চাকরিটি খুঁজে পাওয়া যায়নি" } };
        }

        // category_id কে একটি নাম্বার অ্যারেতে রূপান্তর করা হচ্ছে
        if (job.category_id) {
            job.category_id = (Array.isArray(job.category_id) ? job.category_id.map(id => Number(id)) : [Number(job.category_id)]);
        } else {
            job.category_id = []; // যদি category_id না থাকে, খালি অ্যারে সেট করা হচ্ছে
        }

        return {
            props: {
                job: JSON.parse(JSON.stringify(job)),
                allCategories: JSON.parse(JSON.stringify(allCategories)),
                error: null, // কোনো এরর নেই
            },
        };
    } catch (error) {
        console.error(`[JobDetailsPage] Error fetching job details for slug "${slug}":`, error.message);
        return { props: { job: null, allCategories: JSON.parse(JSON.stringify(allCategories)), error: error.message || "একটি অপ্রত্যাশিত ত্রুটি ঘটেছে" } };
    }
}

const truncateDetails = (details, maxLength) => {
    if (!details || typeof details !== 'string') return '';
    if (details.length <= maxLength) return details;
    return details.substring(0, maxLength).replace(/\s+\S*$/, '').trim() + '...';
};

export default JobDetailsPage;
