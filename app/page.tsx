import Link from "next/link";

type Technique = {
  id: number;
  name: string;
  description?: string;
  difficulty?: number;
  min_belt?: { id: number; color: string; order: number } | null;
  categories?: { id: number; name: string }[];
};

async function fetchTechniques(): Promise<Technique[]> {
  const url = (process.env.NEXT_PUBLIC_API_URL ?? "") + "techniques/";
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) {
    throw new Error("Failed to fetch techniques");
  }
  return res.json();
}

export default async function Page() {
  const techniques = await fetchTechniques();

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Técnicas</h2>
        <Link href="/create" className="text-sm text-blue-600 hover:underline">
          + Añadir técnica
        </Link>
      </div>

      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {techniques.map((t) => (
          <li key={t.id} className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-lg font-semibold">
              <Link href={`/techniques/${t.id}`} className="hover:underline">
                {t.name}
              </Link>
            </h3>
            <p className="text-sm text-gray-600 mt-1 line-clamp-3">{t.description}</p>
            <div className="mt-3 text-xs text-gray-500">
              {t.categories?.map((c) => c.name).join(" • ")}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}