import Link from 'next/link';

export default function Header({ categories }) {
  const safeCategories = Array.isArray(categories) ? categories : [];

  return (
    <header className="bg-white shadow-md">
      <nav className="container mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold text-gray-800">
            JobsBox BD
          </Link>
          <div className="hidden md:flex space-x-4">
            {safeCategories.map((category) => (
              <Link
                key={category.id}
                href={`/category/${category.slug}`}
                className="text-gray-600 hover:text-blue-500"
              >
                {category.name}
              </Link>
            ))}
          </div>
        </div>
      </nav>
    </header>
  );
}
