// pages/about.js

import Head from 'next/head';
import Header from '../components/Header'; // নিশ্চিত করুন এই পাথটি সঠিক
import { getAllCategoriesForDisplay } from '../utils/categories'; // নিশ্চিত করুন এই পাথটি সঠিক
import Link from 'next/link';

// AboutPage কম্পোনেন্ট: 'allCategories' প্রপ হিসেবে গ্রহণ করে
const AboutPage = ({ allCategories }) => {
  // props থেকে পাওয়া allCategories কে সেফ করার জন্য (যদি undefined আসে)
  const safeAllCategories = Array.isArray(allCategories) ? allCategories : [];

  return (
    // মূল কন্টেইনার: স্টিকি ফুটারের জন্য min-h-screen এবং flex flex-col ব্যবহার করা হয়েছে
    <div className="bg-gray-100 min-h-screen flex flex-col">

      <Head>
        <title>আমাদের সম্পর্কে - Job Box BD</title>
        <link rel="icon" href="/favicon.ico" />
        <meta name="description" content="Job Box BD এবং কাজী আইটি স্টুডিও সম্পর্কে জানুন। আমরা বাংলাদেশের সর্বশেষ চাকরির খবর সরবরাহ করি।" />
      </Head>

      {/* Header কম্পোনেন্ট: প্রয়োজনীয় props পাস করা হচ্ছে */}
      <Header
        allCategories={safeAllCategories}
        currentSelectedCategory={null} // About পেজে কোনো ক্যাটাগরি ডিফল্ট সিলেক্টেড নয়
        onSelectAllJobs={null} // About পেজে এই ফাংশনের প্রয়োজন নেই
      />

      {/* মূল কন্টেন্ট এলাকা */}
      <main className="container mx-auto max-w-7xl py-12 px-4 flex-grow">
        {/* সাদা ব্যাকগ্রাউন্ড ও শ্যাডো সহ কন্টেন্ট বক্স */}
        <div className="bg-white p-6 md:p-8 rounded-lg shadow-lg">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6 border-b pb-3">
            আমাদের সম্পর্কে
          </h1>

          {/* টেক্সট কন্টেন্ট */}
          <div className="space-y-4 text-gray-700">
            <p>
              Job Box BD ওয়েবসাইটে আপনাকে স্বাগতম! আমরা বাংলাদেশের চাকরিপ্রার্থীদের জন্য একটি নির্ভরযোগ্য প্ল্যাটফর্ম তৈরি করার লক্ষ্যে কাজ করছি, যেখানে প্রতিদিন সর্বশেষ সরকারি, বেসরকারি, ব্যাংক, এনজিও এবং অন্যান্য চাকরির বিজ্ঞপ্তি প্রকাশ করা হয়।
            </p>
            <p>
              আমাদের লক্ষ্য হলো সঠিক সময়ে সঠিক চাকরির খবর আপনার কাছে পৌঁছে দেওয়া, যাতে আপনি আপনার কাঙ্ক্ষিত চাকরি খুঁজে পেতে পারেন।
            </p>

            {/* যোগাযোগ ও প্রতিষ্ঠান সেকশন */}
            <div className="pt-6 mt-6 border-t border-gray-200">
              <h2 className="text-xl md:text-2xl font-semibold text-gray-800 mb-4">
                যোগাযোগ ও প্রতিষ্ঠান
              </h2>
              <p className="text-lg font-medium text-gray-900">
                কাজী আইটি স্টুডিও (Kazi IT Studio)
              </p>
              <p className="mt-1">
                <strong>ঠিকানা:</strong> চাঁদপুর বাংলাদেশ ৩৬০২
              </p> {/* ঠিকানা প্যারাগ্রাফ শেষ */}
              <p className="mt-1">
                <strong>ইমেইল:</strong> <a href="mailto:kazirasel90@gmail.com" className="text-blue-600 hover:underline">kazirasel90@gmail.com</a>
              </p> {/* ইমেইল প্যারাগ্রাফ শেষ */}
              {/* আপনি চাইলে এখানে আরও তথ্য যোগ করতে পারেন */}
            </div> {/* যোগাযোগ সেকশন শেষ */}

          </div> {/* টেক্সট কন্টেন্ট div শেষ */}
        </div> {/* সাদা ব্যাকগ্রাউন্ড বক্স শেষ */}
      </main> {/* মূল কন্টেন্ট এলাকা শেষ */}

      {/* ফুটার */}
      <footer className="bg-gray-800 text-gray-300 py-6 mt-auto">
        <div className="container mx-auto max-w-7xl text-center text-sm px-4">
          &copy; {new Date().getFullYear()} Job Box BD. সর্বস্বত্ব সংরক্ষিত।
        </div>
      </footer> {/* ফুটার শেষ */}

    </div> // মূল কন্টেইনার div শেষ
  ); // রিটার্ন স্টেটমেন্ট শেষ
}; // AboutPage কম্পোনেন্ট ফাংশন শেষ

// getStaticProps ফাংশন: বিল্ড টাইমে ক্যাটাগরি ডেটা লোড করার জন্য
export async function getStaticProps() {
  console.log("Fetching categories for About page (getStaticProps)...");
  const allCategories = getAllCategoriesForDisplay(); // ক্যাটাগরি ডেটা লোড করা হচ্ছে
  console.log(`Workspaceed ${allCategories.length} categories.`);
  // props হিসেবে ডেটা রিটার্ন করা হচ্ছে (সিরিয়ালাইজড)
  return {
    props: {
      allCategories: JSON.parse(JSON.stringify(allCategories)),
    },
    // Optional: revalidate সময় (সেকেন্ডে) - কতক্ষণ পর পেজটি regenerate হবে
    // revalidate: 3600, // যেমন, প্রতি ঘন্টায়
  };
} // getStaticProps ফাংশন শেষ

export default AboutPage; // AboutPage কম্পোনেন্ট এক্সপোর্ট করা হচ্ছে
