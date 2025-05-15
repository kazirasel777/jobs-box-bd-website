// pages/job/[slug].js

import Head from 'next/head';
import axios from 'axios';
import Link from 'next/link';
import Header from '../../components/Header'; // সঠিক পাথ নিশ্চিত করুন
import { generateSlug } from '../../utils/slugify'; // সঠিক পাথ
import { getCategoryName, getAllCategoriesForDisplay } from '../../utils/categories'; // সঠিক পাথ
// descriptionGenerator.js থেকে ফাংশনগুলো ইম্পোর্ট করা হচ্ছে
import { generateAutoDescription, truncateDetails } from '../../utils/descriptionGenerator'; // সঠিক পাথ দিন
import { FaExternalLinkAlt, FaRegClock, FaRegCalendarAlt, FaRegNewspaper, FaUsers, FaThList } from 'react-icons/fa';
import { useRouter } from 'next/router'; // যদি fallback ব্যবহার করা হয়

const JobDetailsPage = ({ job, allCategories, error }) => {
    const router = useRouter();
    const safeAllCategories = Array.isArray(allCategories) ? allCategories : [];

    if (router.isFallback) {
        return (
            <div className="bg-gray-50 min-h-screen flex flex-col justify-center items-center">
                <div>লোড হচ্ছে...</div>
            </div>
        );
    }

    if (error || !job) {
        const pageTitle = error ? "ত্রুটি - Job Box BD" : "চাকরি পাওয়া যায়নি - Job Box BD";
        const message = error || "আপনি যে চাকরিটি খুঁজছেন তা পাওয়া যায়নি অথবা লিংকটি সঠিক নয়।";

        return (
             <div className="bg-gray-50 min-h-screen flex flex-col">
                <Head>
                    <title>{pageTitle}</title>
                    <meta name="description" content="Job Box BD - সর্বশেষ চাকরির খবর খুঁজুন।" />
                </Head>
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

    const jobCategoryNames = (job.category_id || [])
                             .map(id => getCategoryName(id))
                             .filter(name => name && !name.startsWith('ক্যাটাগরি '));

    const currentJobPrimaryCategoryId = (job.category_id && job.category_id.length > 0) ? job.category_id[0] : null;

    // মেটা ডেসক্রিপশন তৈরি
    // অপশন ১: যদি job.details থাকে এবং যথেষ্ট লম্বা হয়, তবে সেটি ব্যবহার করুন, অন্যথায় অটো-জেনারেট করুন
    const metaDescription = (job.details && job.details.length > 20) ? truncateDetails(job.details, 160) : generateAutoDescription(job, 160);
    
    // অপশন ২: সবসময় অটো-জেনারেটেড ডেসক্রিপশন ব্যবহার করতে চাইলে নিচের লাইনটি আনকমেন্ট করুন এবং উপরেরটি কমেন্ট করুন
    // const metaDescription = generateAutoDescription(job, 160);

    return (
        <div className="bg-gray-50 min-h-screen flex flex-col">
            <Head>
                <title>{`${job.job_title || 'চাকরির বিস্তারিত'} | Job Box BD`}</title>
                <meta name="description" content={metaDescription} />
                <link rel="icon" href="/favicon.ico" />

                {/* Open Graph ট্যাগ */}
                <meta property="og:title" content={`${job.job_title || 'চাকরির বিস্তারিত'} | Job Box BD`} />
                <meta property="og:description" content={metaDescription} />
                <meta property="og:type" content="article" />
                {/* নিশ্চিত করুন আপনার সাইটের URL সঠিকভাবে দেওয়া হয়েছে */}
                <meta property="og:url" content={`https://jobsboxbd.com/job/${generateSlug(job.job_title || 'untitled-job')}`} />
                {/* যদি চাকরির সাথে ছবি থাকে, সেটি OG image হিসেবে ব্যবহার করুন */}
                {job.headlineImage && <meta property="og:image" content={job.headlineImage} />}
                {/* অথবা একটি ডিফল্ট OG ইমেজ দিন যদি চাকরির ছবি না থাকে */}
                {/* {!job.headlineImage && <meta property="og:image" content="https://jobsboxbd.com/images/default-og-image.png" />} */}
                <meta property="og:site_name" content="Job Box BD" />

                 {/* Twitter Card ট্যাগ (অপশনাল কিন্তু ভালো) */}
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:title" content={`${job.job_title || 'চাকরির বিস্তারিত'} | Job Box BD`} />
                <meta name="twitter:description" content={metaDescription} />
                {job.headlineImage && <meta name="twitter:image" content={job.headlineImage} />}
                {/* <meta name="twitter:site" content="@YourTwitterHandle" /> */}

                {/* JobPosting Schema Markup (JSON-LD) */}
                <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
                    "@context": "https://schema.org/",
                    "@type": "JobPosting",
                    "title": job.job_title,
                    "description": job.details || metaDescription,
                    "datePosted": job.publishDate ? new Date(job.publishDate).toISOString() : new Date().toISOString(),
                    "validThrough": job.lastDate ? new Date(job.lastDate).toISOString() : undefined,
                    "employmentType": "FULL_TIME", // এটি আপনার জব ডেটা থেকে পরিবর্তনশীল হতে পারে
                    "hiringOrganization": {
                        "@type": "Organization",
                        "name": job.jobSource || "A Reputed Company", // উৎস বা কোম্পানির নাম
                        "sameAs": "https://jobsboxbd.com" // আপনার ওয়েবসাইটের URL
                    },
                    "jobLocation": {
                        "@type": "Place",
                        "address": {
                            "@type": "PostalAddress",
                            "addressLocality": "বিভিন্ন জেলা", // এটি পরিবর্তনশীল হতে পারে
                            "addressCountry": "BD"
                        }
                    },
                    "baseSalary": { // যদি বেতন সম্পর্কিত তথ্য থাকে
                        "@type": "MonetaryAmount",
                        "currency": "BDT",
                        "value": {
                          "@type": "QuantitativeValue",
                          "value": job.salary || "আলোচনা সাপেক্ষ", // উদাহরণ
                          "unitText": "MONTH" // অথবা "YEAR"
                        }
                    },
                    // "jobBenefits": job.benefits, // যদি থাকে
                    // "experienceRequirements": job.experience, // যদি থাকে
                    // "educationRequirements": job.education, // যদি থাকে
                    "identifier": {
                        "@type": "PropertyValue",
                        "name": job.job_title,
                        "value": job.id ? String(job.id) : generateSlug(job.job_title || 'untitled-job')
                      }
                  }) }} />

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
                                <h2 className="text-xl font-semibold mb-4 text-gray-700 border-t pt-6">অফিসিয়াল বিজ্ঞপ্তি / ছবি</h2>
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
                            <p className="text-gray-500 mb-6 border-t pt-6">এই চাকরির বিস্তারিত তথ্য বা বিজ্ঞপ্তি পাওয়া যায়নি।</p>
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
                            {/* এখানে সম্পর্কিত চাকরি দেখানোর জন্য কোড যোগ করতে পারেন */}
                            {/* নিচে একটি উদাহরণ */}
                            {/* <ul>
                                {relatedJobs.slice(0, 5).map(relatedJob => (
                                    <li key={relatedJob.id} className="mb-2">
                                        <Link href={`/job/${generateSlug(relatedJob.job_title)}`} legacyBehavior>
                                            <a className="text-sm text-blue-600 hover:underline">{relatedJob.job_title}</a>
                                        </Link>
                                    </li>
                                ))}
                            </ul> */}
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
    const { slug } = context.params;
    let job = null;
    const allCategories = getAllCategoriesForDisplay();
    // let relatedJobs = []; // সম্পর্কিত চাকরির জন্য

    try {
        const response = await axios.get('https://adminjobs.kaziitstudio.com/job_post_api.php');
        const jobs = response.data && Array.isArray(response.data.jobs) ? response.data.jobs : [];

        job = jobs.find(j => {
            if (!j || !j.job_title) return false;
            const jobSlug = generateSlug(String(j.job_title));
            return jobSlug === slug;
        });

        if (!job) {
            // context.res.statusCode = 404; // পেজ নট ফাউন্ড স্ট্যাটাস সেট করা যেতে পারে
            return { 
                // notFound: true, // অথবা এই প্রপার্টি ব্যবহার করা যেতে পারে ৪৪ পেজ দেখানোর জন্য
                props: { 
                    job: null, 
                    allCategories: JSON.parse(JSON.stringify(allCategories)), 
                    error: "চাকরিটি খুঁজে পাওয়া যায়নি" 
                } 
            };
        }

        if (job.category_id) {
            job.category_id = (Array.isArray(job.category_id) ? job.category_id.map(id => Number(id)) : [Number(job.category_id)]);
        } else {
            job.category_id = [];
        }

        // সম্পর্কিত চাকরির তালিকা (উদাহরণস্বরূপ, একই ক্যাটাগরির অন্যান্য চাকরি)
        // if (job && job.category_id && job.category_id.length > 0) {
        //     const primaryCatId = job.category_id[0];
        //     relatedJobs = jobs.filter(
        //         otherJob => otherJob.id !== job.id &&
        //                     Array.isArray(otherJob.category_id) &&
        //                     otherJob.category_id.includes(primaryCatId)
        //     ).slice(0, 10); // প্রথম ১০টি সম্পর্কিত চাকরি
        // }


        return {
            props: {
                job: JSON.parse(JSON.stringify(job)),
                allCategories: JSON.parse(JSON.stringify(allCategories)),
                // relatedJobs: JSON.parse(JSON.stringify(relatedJobs)),
                error: null,
            },
        };
    } catch (error) {
        console.error(`[JobDetailsPage] Error fetching job details for slug "${slug}":`, error.message);
        // context.res.statusCode = 500; // ইন্টারনাল সার্ভার এরর
        return { 
            props: { 
                job: null, 
                allCategories: JSON.parse(JSON.stringify(allCategories)), 
                // relatedJobs: [],
                error: error.message || "একটি অপ্রত্যাশিত ত্রুটি ঘটেছে" 
            } 
        };
    }
}

// truncateDetails ফাংশনটি descriptionGenerator.js এ সরানো হয়েছে,
// তাই যদি utils/descriptionGenerator.js থেকে ইম্পোর্ট করা হয়, তাহলে এখানে আর প্রয়োজন নেই।
// const truncateDetails = (details, maxLength) => { ... }

export default JobDetailsPage;
