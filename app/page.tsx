import Link from 'next/link';

export default async function Page() {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Techniques</h2>
        <Link href="/create" className="text-sm text-blue-600 hover:underline">
          + Añadir técnica
        </Link>
      </div>
    </div>
  );
}
