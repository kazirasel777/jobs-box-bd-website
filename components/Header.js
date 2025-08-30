// components/Header.js
export default function Header({ categories = [] }) {
  return (
    <header className="w-full bg-white border-b">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <a href="/" className="font-bold text-lg">JobsBox BD</a>
        <nav className="flex gap-3 overflow-x-auto">
          {categories.map((c) => (
            <a key={c.id ?? c.value ?? c.slug} href={`/category/${c.slug ?? c.value ?? c.id}`} className="text-sm text-gray-600 hover:text-black">
              {c.name}
            </a>
          ))}
        </nav>
      </div>
    </header>
  );
}
