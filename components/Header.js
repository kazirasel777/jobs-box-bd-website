// components/Header.js
import Link from 'next/link';
import Image from 'next/image'; // next/image ইম্পোর্ট করা হয়েছে
import { FaBars } from 'react-icons/fa';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
// getAllCategoriesForDisplay ইম্পোর্ট করা হয়েছে ক্যাটাগরি ডেটা পাওয়ার জন্য
import { getAllCategoriesForDisplay } from '../utils/categories'; // সঠিক পাথ নিশ্চিত করুন

// Header কম্পোনেন্ট এখন এই props গুলো গ্রহণ করবে:
// - allCategories: সাধারণত আর প্রয়োজন নেই যদি getAllCategoriesForDisplay ব্যবহার করা হয়
// - currentSelectedCategory: হোমপেজ থেকে আসা state (null অথবা ক্যাটাগরি আইডি) অথবা ক্যাটাগরি পেজ থেকে আসা আইডি
// - onSelectAllJobs: হোমপেজ থেকে আসা ফাংশন যা ক্যাটাগরি রিসেট করে
const Header = ({ currentSelectedCategory, onSelectAllJobs }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const router = useRouter();

  // অ্যাকটিভ এবং ইনঅ্যাকটিভ লিংকের জন্য স্টাইল
  const activeLinkStyle = "text-blue-600 font-semibold border-b-2 border-blue-600";
  const inactiveLinkStyle = "text-gray-700 hover:text-blue-500";

  // utils/categories.js থেকে সব ক্যাটাগরি (id, name, slug সহ) লোড করা হচ্ছে
  const navCategories = getAllCategoriesForDisplay();

  // নির্দিষ্ট ক্যাটাগরি খুঁজে বের করা (যদি প্রয়োজন হয়)
  const govtCategory = navCategories.find(cat => cat.id === 1);
  const privateCategory = navCategories.find(cat => cat.id === 2);

  // রাউট পরিবর্তনের সময় মোবাইল মেনু বন্ধ করার ইফেক্ট
  useEffect(() => {
    const handleRouteChangeComplete = () => {
      setIsMobileMenuOpen(false);
    };
    router.events.on('routeChangeComplete', handleRouteChangeComplete);
    return () => {
      router.events.off('routeChangeComplete', handleRouteChangeComplete);
    };
  }, [router.events]);

  // "সকল চাকরি" লিংক কখন অ্যাকটিভ হবে তার কন্ডিশন
  const isAllJobsActive = router.pathname === '/' && currentSelectedCategory === null;

  // "সকল চাকরি" বা লোগোতে ক্লিক করলে এই হ্যান্ডলার কল হবে
  const handleAllJobsClick = (e) => {
    // Home পেজ থেকে পাঠানো ফাংশন কল করা (যদি থাকে)
    if (onSelectAllJobs) {
      onSelectAllJobs();
    }
    // মোবাইল মেনু বন্ধ করা (যদি খোলা থাকে)
    if (isMobileMenuOpen) setIsMobileMenuOpen(false);
    // Link কম্পোনেন্ট নেভিগেশন হ্যান্ডেল করবে
  };

  // ক্যাটাগরি লিংক কখন অ্যাকটিভ হবে তার কন্ডিশন (স্লাগ ভিত্তিক)
  const isCategoryLinkActive = (categorySlug) => {
    return router.pathname.startsWith('/category/') && router.query.slug === categorySlug;
    // দ্রষ্টব্য: হোমপেজে থাকা অবস্থায় হেডারের ক্যাটাগরি লিংক হাইলাইট করার জন্য
    // currentSelectedCategory এর আইডি কে স্লাগে রূপান্তর করে মেলানো যেতে পারে,
    // তবে সাধারণত ক্যাটাগরি পেজে গেলেই সেই ক্যাটাগরি লিংক হাইলাইট হয়।
  };

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto flex items-center justify-between py-3 px-4 max-w-7xl">
        {/* লোগো এবং হোমপেজের লিংক */}
        <Link href="/" passHref legacyBehavior>
          {/* লোগোতে ক্লিক করলে onSelectAllJobs কল হবে */}
          <a className="flex items-center" onClick={onSelectAllJobs ? handleAllJobsClick : undefined}>
            <Image
              src="/images/logo.png" // **আপনার লোগোর সঠিক পাথ দিন**
              alt="Job Box BD লোগো"   // **সঠিক alt টেক্সট দিন**
              width={120}              // **আপনার লোগোর প্রস্থ দিন**
              height={32}             // **আপনার লোগোর উচ্চতা দিন**
              priority
            />
          </a>
        </Link>

        {/* ডেস্কটপ নেভিগেশন */}
        <nav className="hidden md:flex items-center space-x-6">
          <Link
            href="/"
            className={`px-3 py-2 rounded-md text-sm font-medium ${isAllJobsActive ? activeLinkStyle : inactiveLinkStyle}`}
            onClick={handleAllJobsClick} // স্টেট রিসেট করার জন্য onClick
          >
            সকল চাকরি
          </Link>
          {/* ক্যাটাগরি লিংকগুলো স্লাগ ব্যবহার করে তৈরি হচ্ছে */}
          {govtCategory && (
            <Link
              href={`/category/${govtCategory.slug}`}
              className={`px-3 py-2 rounded-md text-sm font-medium ${isCategoryLinkActive(govtCategory.slug) ? activeLinkStyle : inactiveLinkStyle}`}
            >
              {govtCategory.name}
            </Link>
          )}
          {privateCategory && (
            <Link
              href={`/category/${privateCategory.slug}`}
              className={`px-3 py-2 rounded-md text-sm font-medium ${isCategoryLinkActive(privateCategory.slug) ? activeLinkStyle : inactiveLinkStyle}`}
            >
              {privateCategory.name}
            </Link>
          )}
          <Link
            href="/about" // নিশ্চিত করুন /about নামে পেজ আছে
            className={`px-3 py-2 rounded-md text-sm font-medium ${router.pathname === '/about' ? activeLinkStyle : inactiveLinkStyle}`}
          >
            About
          </Link>
        </nav>

        {/* মোবাইল মেনু বাটন */}
        <div className="md:hidden">
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="text-gray-700 hover:text-blue-500 focus:outline-none p-2"
            aria-label="Toggle menu"
          >
            <FaBars className="h-6 w-6" />
          </button>
        </div>
      </div>

      {/* মোবাইল মেনু (ড্রপডাউন) */}
      {isMobileMenuOpen && (
        <nav className="md:hidden bg-white shadow-lg absolute w-full left-0 right-0 z-40">
          <div className="container mx-auto max-w-7xl px-4">
            {/* মোবাইল মেনুর লিংকগুলো */}
            <Link href="/" className={`block py-3 text-gray-700 hover:bg-gray-100 ${isAllJobsActive ? 'text-blue-600 font-semibold' : ''}`} onClick={handleAllJobsClick}>
              সকল চাকরি
            </Link>
            {govtCategory && (
                <Link href={`/category/${govtCategory.slug}`} className={`block py-3 text-gray-700 hover:bg-gray-100 ${isCategoryLinkActive(govtCategory.slug) ? 'text-blue-600 font-semibold' : ''}`} onClick={() => setIsMobileMenuOpen(false)}>
                {govtCategory.name}
                </Link>
            )}
            {privateCategory && (
                <Link href={`/category/${privateCategory.slug}`} className={`block py-3 text-gray-700 hover:bg-gray-100 ${isCategoryLinkActive(privateCategory.slug) ? 'text-blue-600 font-semibold' : ''}`} onClick={() => setIsMobileMenuOpen(false)}>
                {privateCategory.name}
                </Link>
            )}
            <Link href="/about" className={`block py-3 text-gray-700 hover:bg-gray-100 ${router.pathname === '/about' ? 'text-blue-600 font-semibold' : ''}`} onClick={() => setIsMobileMenuOpen(false)}>
              About
            </Link>
          </div>
        </nav>
      )}
    </header>
  );
};

export default Header;
