import Head from 'next/head';

export default function Home() {
  return (
    <div className="bg-gray-100 min-h-screen flex flex-col items-center justify-center py-2">
      <Head>
        <title>Job Box BD</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="bg-white rounded-xl shadow-md p-8 text-center">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">
          Welcome to Job Box BD!
        </h1>
        <p className="text-lg text-gray-600 mb-6">
          Find your dream job in Bangladesh.
        </p>
        <div className="flex justify-center space-x-4">
          <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
            Find Jobs
          </button>
          <button className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
            Post a Job
          </button>
        </div>
      </main>

      <footer className="w-full max-w-2xl border-t border-gray-200 py-4 mt-8 text-center text-gray-500">
        <p>&copy; {new Date().getFullYear()} Job Box BD. All rights reserved.</p>
      </footer>
    </div>
  );
}
