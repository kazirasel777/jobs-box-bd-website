import Head from 'next/head';
import Link from 'next/link';
import Header from '../../components/Header';
import slugify from '../../utils/slugify';

export default function CategoryPage({ jobs, category, categories }) {
  return (
    <div>
      <Head>
        <title>{category.name} - চাকরির খবর</title>
      </Head>

      <Header categories={categories} />

      <main className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">{category.name} ক্যাটাগরির চাকরি</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {jobs.length > 0 ? (
            jobs.map((job) => (
              <div key={job.id} className="border p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                <Link href={`/job/${slugify(job.title)}-${job.id}`}>
                    <h2 className="text-xl font-semibold text-blue-600 hover:underline">{job.title}</h2>
                </Link>
                <p className="text-gray-600">{job.company_name}</p>
                <p className="text-sm text-red-500">আবেদনের শেষ তারিখ: {new Date(job.application_deadline).toLocaleDateString('bn-BD')}</p>
              </div>
            ))
          ) : (
            <p>এই ক্যাটাগরিতে কোনো চাকরি পাওয়া যায়নি।</p>
          )}
        </div>
      </main>
    </div>
  );
}

export async function getStaticPaths() {
  const apiToken = process.env.API_TOKEN;
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

  const res = await fetch(`${baseUrl}/categories`, {
    headers: { 'Authorization': `Bearer ${apiToken}` }
  });
  const categoriesData = await res.json();
  const categories = categoriesData.data || [];

  const paths = categories.map((cat) => ({
    params: { slug: cat.slug },
  }));

  return { paths, fallback: 'blocking' };
}

export async function getStaticProps({ params }) {
  const apiToken = process.env.API_TOKEN;
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

  const headers = {
    'Authorization': `Bearer ${apiToken}`,
    'Accept': 'application/json',
  };

  const [categoryJobsRes, allCategoriesRes] = await Promise.all([
    fetch(`${baseUrl}/categories/${params.slug}/jobs`, { headers }),
    fetch(`${baseUrl}/categories`, { headers })
  ]);
  
  if (!categoryJobsRes.ok) {
      return { notFound: true };
  }

  const categoryJobsData = await categoryJobsRes.json();
  const allCategoriesData = await allCategoriesRes.json();

  return {
    props: {
      jobs: categoryJobsData.data.jobs || [],
      category: categoryJobsData.data.category || null,
      categories: allCategoriesData.data || [],
    },
    revalidate: 60,
  };
}
