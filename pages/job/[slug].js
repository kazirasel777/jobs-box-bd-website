import Head from 'next/head';
import Header from '../../components/Header';
import { useEffect } from 'react';

export default function JobDetails({ job, categories }) {
  
  // Job view count বাড়ানোর জন্য
  useEffect(() => {
    if (job?.id) {
      fetch(`/api/increment-view`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: job.id }),
      });
    }
  }, [job?.id]);

  if (!job) {
    return <div>চাকরিটি খুঁজে পাওয়া যায়নি।</div>;
  }

  return (
    <div>
      <Head>
        <title>{job.title} - JobsBox BD</title>
        <meta name="description" content={job.description.substring(0, 160)} />
      </Head>

      <Header categories={categories} />

      <main className="container mx-auto p-4">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h1 className="text-3xl font-bold mb-2">{job.title}</h1>
          <p className="text-lg text-gray-700 mb-4">{job.company_name}</p>
          <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: job.description }}></div>
          <p className="mt-6 text-red-600 font-semibold">আবেদনের শেষ তারিখ: {new Date(job.application_deadline).toLocaleDateString('bn-BD')}</p>
          <p className="text-sm text-gray-500">ভিউ: {job.view_count + 1}</p>
        </div>
      </main>
    </div>
  );
}

// slugify function যা URL তৈরি করতে সাহায্য করবে
const slugify = (text) => {
    return text.toString().toLowerCase()
        .replace(/\s+/g, '-') // Replace spaces with -
        .replace(/[^\w\-]+/g, '') // Remove all non-word chars
        .replace(/\-\-+/g, '-') // Replace multiple - with single -
        .replace(/^-+/, '') // Trim - from start of text
        .replace(/-+$/, ''); // Trim - from end of text
};


export async function getStaticPaths() {
  const apiToken = process.env.API_TOKEN;
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

  const res = await fetch(`${baseUrl}/jobs`, {
    headers: { 'Authorization': `Bearer ${apiToken}` }
  });
  const jobsData = await res.json();
  const jobs = jobsData.data || [];

  const paths = jobs.map((job) => ({
    params: { slug: `${slugify(job.title)}-${job.id}` },
  }));

  return { paths, fallback: 'blocking' };
}

export async function getStaticProps({ params }) {
  const apiToken = process.env.API_TOKEN;
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
  const id = params.slug.split('-').pop();

  const headers = {
    'Authorization': `Bearer ${apiToken}`,
    'Accept': 'application/json',
  };

  const [jobRes, categoriesRes] = await Promise.all([
    fetch(`${baseUrl}/jobs/${id}`, { headers }),
    fetch(`${baseUrl}/categories`, { headers })
  ]);

  if (!jobRes.ok) {
    return { notFound: true }; // চাকরি খুঁজে না পেলে 404 পেইজ দেখাবে
  }

  const jobData = await jobRes.json();
  const categoriesData = await categoriesRes.json();
  
  return {
    props: {
      job: jobData.data || null,
      categories: categoriesData.data || [],
    },
    revalidate: 60,
  };
}
