// pages/job/[slug].js

import Head from 'next/head';
import axios from 'axios';
import Link from 'next/link';
import Header from '../../components/Header';
import { generateSlug } from '../../utils/slugify';
import { getCategoryName, getAllCategoriesForDisplay } from '../../utils/categories';
// jobDescriptionUtils থেকে ফাংশন ইম্পোর্ট
import { generateFullJobDescription, generateMetaDescription } from '../../utils/jobDescriptionUtils';
import { FaExternalLinkAlt, FaRegClock, FaRegCalendarAlt, FaRegNewspaper, FaUsers, FaThList } from 'react-icons/fa';
import { useRouter } from 'next/router';

const JobDetailsPage = ({ job, allCategories, error }) => {
    // ... (router, safeAllCategories, isFallback, error handling আগের মতোই থাকবে) ...
    const router = useRouter();
    const safeAllCategories = Array.isArray(allCategories) ? allCategories : [];

    if (router.isFallback) {
        return <div className="bg-gray-50 min-h-screen flex flex-col justify-center items-center"><div>লোড হচ্ছে...</div></div>;
    }

    if (error || !job) {
        const pageTitle = error ? "ত্রুটি - Job Box BD" : "চাকরি পাওয়া যায়নি - Job Box BD";
        const message = error || "আপনি যে চাকরিটি খুঁজছেন তা পাওয়া যায়নি অথবা লিংকটি সঠিক নয়।";
        return (
             <div className="bg-gray-50 min-h-screen flex flex-col">
                <Head><title>{pageTitle}</title></Head>
                <Header allCategories={safeAllCategories} currentSelectedCategory={null} onSelectAllJobs={null} />
                <main className="container mx-auto max-w-7xl py-20 text-center px-4 flex-grow flex flex-col justify-center">
                    <div>
                        <h1 className="text-3xl text-red-600 font-semibold">দুঃখিত!</h1>
                        <p className="text-gray-600 mt-2">{message}</p>
                        <Link href="/" legacyBehavior><a className="mt-6 inline-block px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition duration-150">হোমপেজে ফিরে যান</a></Link>
                    </div>
                </main>
                 <footer className="bg-gray-800 text-gray-300 py-6 mt-auto"><div className="container mx-auto max-w-7xl text-center text-sm px-4">&copy; {new Date().getFullYear()} Job Box BD. সর্বস্বত্ব সংরক্ষিত।</div></footer>
            </div>
        );
    }


    let applicationLink = job.web_link || '';
    if (applicationLink && typeof applicationLink === 'string' && !applicationLink.startsWith('http://') && !applicationLink.startsWith('https://')) {
        applicationLink = `https://${applicationLink}`;
    }

    const jobCategoryNames = (job.category_id || []).map(id => getCategoryName(id)).filter(name => name && !name.startsWith('ক্যাটাগরি '));
    const currentJobPrimaryCategoryId = (job.category_id && job.category_id.length > 0) ? job.category_id[0] : null;

    // ইউটিলিটি ফাংশন ব্যবহার করে ডাইনামিক বিবরণী তৈরি (jobSource ও jobCategoryNames পাস করা হচ্ছে)
    const metaDescriptionText = generateMetaDescription(job.job_title, job.publishDate, jobCategoryNames, job.jobSource);
    const jobFullDescription = generateFullJobDescription(job.job_title, job.publishDate, job.jobSource, jobCategoryNames);


    return (
        <div className="bg-gray-50 min-h-screen flex flex-col">
            <Head>
                <title>{`${job.job_title || 'চাকরির বিবরণ'} | Job Box BD - ${new Date().getFullYear()} সার্কুলার`}</title>
                <meta name="description" content={metaDescriptionText} />
                <link rel="icon" href="/favicon.ico" />
            </Head>

            <Header
                allCategories={safeAllCategories}
                currentSelectedCategory={currentJobPrimaryCategoryId}
                onSelectAllJobs={null}
            />

            <main className="container mx-auto max-w-7xl py-8 px-4 flex-grow">
                <div className="lg:flex lg:gap-x-8">
                     <article className="w-full lg:flex-1 bg-white p-6 md:p-8 rounded-lg shadow-xl mb-6 lg:mb-0">
                        <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6 border-b pb-4">{job.job_title}</h1>

                        {/* --- একনজরে গুরুত্বপূর্ণ তথ্য (আগের মতোই) --- */}
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


                        {/* --- অফিসিয়াল বিজ্ঞপ্তি / ছবি (আগের মতোই) --- */}
                        {(job.circularImage1 || job.circularImage2 || job.circularImage3 || job.circularImage4) && (
                             <div className="mb-8">
                                <h2 className="text-xl font-semibold mb-4 text-gray-700 border-t pt-6">অফিসিয়াল বিজ্ঞপ্তি / ছবি</h2>
                                <div className="space-y-4">
                                    {job.circularImage1 && <img loading="lazy" src={job.circularImage1} alt={`${job.job_title} - সার্কুলার ১`} className="rounded border border-gray-200 w-full shadow-sm block"/>}
                                    {job.circularImage2 && <img loading="lazy" src={job.circularImage2} alt={`${job.job_title} - সার্কুলার ২`} className="rounded border border-gray-200 w-full shadow-sm block"/>}
                                    {job.circularImage3 && <img loading="lazy" src={job.circularImage3} alt={`${job.job_title} - সার্কুলার ৩`} className="rounded border border-gray-200 w-full shadow-sm block"/>}
                                    {job.circularImage4 && <img loading="lazy" src={job.circularImage4} alt={`${job.job_title} - সার্কুলার ৪`} className="rounded border border-gray-200 w-full shadow-sm block"/>}
                                </div>
                             </div>
                         )}

                        {/* --- ডাইনামিক বিবরণী --- */}
                        <div className="prose prose-sm sm:prose lg:prose-lg max-w-none text-gray-800 mb-6 border-t pt-6">
                            <h2 className="text-xl font-semibold mb-4 text-gray-700">বিস্তারিত তথ্য</h2>
                            <div className="space-y-3 text-justify">
                                {jobFullDescription} {/* এখানে jobFullDescription ব্যবহার করা হয়েছে */}
                            </div>
                        </div>

                        {!job.circularImage1 && !job.circularImage2 && !job.circularImage3 && !job.circularImage4 && (
                            <p className="text-gray-500 mb-6 border-t pt-6">এই চাকরির বিজ্ঞপ্তির কোনো ছবি পাওয়া যায়নি। অনুগ্রহ করে আবেদন লিংক অথবা অফিসিয়াল ওয়েবসাইটে বিস্তারিত দেখুন।</p>
                        )}

                        {/* --- বিশেষ নোটিশ (আগের মতোই) --- */}
                        {job.notice && (
                            <div className="mb-6 p-4 bg-yellow-100 border-l-4 border-yellow-500 rounded shadow-sm">
                                <h3 className="font-semibold text-yellow-800 mb-1">বিশেষ নোটিশ</h3>
                                <p className="text-sm text-yellow-700">{job.notice}</p>
                            </div>
                        )}
                     </article>

                     {/* ... সাইডবার (আগের মতোই) ... */}
                </div>
            </main>
           {/* ... ফুটার (আগের মতোই) ... */}
        </div>
    );
}

// ... (getServerSideProps অপরিবর্তিত) ...
export async function getServerSideProps(context) {
    const { slug } = context.params;
    let job = null;
    const allCategories = getAllCategoriesForDisplay();

    try {
        const response = await axios.get('https://adminjobs.kaziitstudio.com/job_post_api.php');
        const jobs = response.data && Array.isArray(response.data.jobs) ? response.data.jobs : [];

        job = jobs.find(j => {
            if (!j || !j.job_title) return false;
            const jobSlug = generateSlug(String(j.job_title));
            return jobSlug === slug;
        });

        if (!job) {
            return { props: { job: null, allCategories: JSON.parse(JSON.stringify(allCategories)), error: "চাকরিটি খুঁজে পাওয়া যায়নি" } };
        }

        if (job.category_id) {
            job.category_id = (Array.isArray(job.category_id) ? job.category_id.map(id => Number(id)) : [Number(job.category_id)]);
        } else {
            job.category_id = [];
        }

        return {
            props: {
                job: JSON.parse(JSON.stringify(job)),
                allCategories: JSON.parse(JSON.stringify(allCategories)),
                error: null,
            },
        };
    } catch (error) {
        console.error(`[JobDetailsPage] Error fetching job details for slug "${slug}":`, error.message);
        return { props: { job: null, allCategories: JSON.parse(JSON.stringify(allCategories)), error: error.message || "একটি অপ্রত্যাশিত ত্রুটি ঘটেছে" } };
    }
}


export default JobDetailsPage;
