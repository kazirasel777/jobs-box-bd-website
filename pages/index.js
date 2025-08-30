import Head from 'next/head';
import Link from 'next/link';
import Header from '../components/Header';
import { slugify } from '../utils/slugify';

export default function Home({ jobs, categories }) {
  return (
    <div>
      <Head>
        <title>JobsBox BD - সর্বশেষ চাকরির খবর</title>
        <meta name="description" content="সরকারি, বেসরকারি, ব্যাংক, এনজিও সকল চাকরির খবর" />
      </Head>

      <Header categories={categories} />

      <main className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">সকল চাকরির খবর</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {jobs.length > 0 ? (
            jobs.map((job) => (
              <div key={job.id} className="border p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                <Link href={`/job/${slugify(job.title)}-${job.id}`}>
                  <h2 className="text-xl font-semibold text-blue-600 hover:underline">{job.title}</h2>
                </Link>
                <p className="text-gray-600">{job.company_name}</p>
                <p className="text-sm text-gray-500 mt-2">প্রকাশের তারিখ: {new Date(job.created_at).toLocaleDateString('bn-BD')}</p>
                <p className="text-sm text-red-500">আবেদনের শেষ তারিখ: {new Date(job.application_deadline).toLocaleDateString('bn-BD')}</p>
              </div>
            ))
          ) : (
            <p>বর্তমানে কোনো চাকরি পাওয়া যায়নি।</p>
          )}
        </div>
      </main>
    </div>
  );
}

export async function getStaticProps() {
  const apiToken = process.env.API_TOKEN;
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

  const headers = {
    'Authorization': `Bearer ${apiToken}`,
    'Accept': 'application/json',
  };

  // Fetch jobs and categories in parallel
  const [jobsRes, categoriesRes] = await Promise.all([
    fetch(`${baseUrl}/jobs`, { headers }),
    fetch(`${baseUrl}/categories`, { headers })
  ]);

  if (!jobsRes.ok || !categoriesRes.ok) {
    console.error('API Error:', { 
        jobsStatus: jobsRes.status, 
        categoriesStatus: categoriesRes.status 
    });
    return { props: { jobs: [], categories: [] } };
  }

  const jobsData = await jobsRes.json();
  const categoriesData = await categoriesRes.json();

  return {
    props: {
      jobs: jobsData.data || [],
      categories: categoriesData.data || [],
    },
    revalidate: 60, // প্রতি মিনিটে ডেটা অটো রিফ্রেশ হবে
  };
}
