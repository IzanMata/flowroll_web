import { notFound } from "next/navigation";

type Technique = {
  id: number;
  name: string;
  description?: string;
  difficulty?: number;
  min_belt?: { id: number; color: string; order: number } | null;
  categories?: { id: number; name: string }[];
  variations?: { id: number; name: string; description?: string }[];
  leads_to?: { id: number; to_technique?: string }[]; // depende serializer
};

async function fetchTechnique(id: string): Promise<Technique | null> {
  const url = (process.env.NEXT_PUBLIC_API_URL ?? "") + `techniques/${id}/`;
  const res = await fetch(url, { cache: "no-store" });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error("Failed to fetch technique");
  return res.json();
}

export default async function TechniquePage({ params }: { params: { id: string } }) {
  const technique = await fetchTechnique(params.id);
  if (!technique) return notFound();

  return (
    <div>
      <h2 className="text-2xl font-bold mb-2">{technique.name}</h2>
      <div className="mb-4 text-sm text-gray-600">Dificultad: {technique.difficulty}</div>
      <div className="prose max-w-none">{technique.description}</div>

      <section className="mt-6">
        <h3 className="font-semibold">Variaciones</h3>
        <ul className="list-disc pl-6">
          {technique.variations?.map((v) => (
            <li key={v.id} className="text-sm">{v.name} — <span className="text-gray-500">{v.description}</span></li>
          )) || <li className="text-sm text-gray-500">No hay variaciones</li>}
        </ul>
      </section>
    </div>
  );
}
