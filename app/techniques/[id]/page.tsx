import { TechniqueCard } from '@/components/techniques/technique-card';

type Technique = {
  id: number;
  name: string;
  description?: string;
  difficulty?: number;
  min_belt?: { id: number; color: string; order: number } | null;
  categories?: { id: number; name: string }[];
  variations?: { id: number; name: string; description?: string }[];
  leads_to?: { id: number; to_technique?: string }[];
};

async function fetchTechnique(id: string): Promise<Technique | null> {
  const url = (process.env.NEXT_PUBLIC_API_URL ?? '') + `techniques/${id}/`;
  const res = await fetch(url, { cache: 'no-store' });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error('Failed to fetch technique');
  return res.json();
}

export default async function TechniquePage({ params, }: { params: Promise<{ id: string }>; }) {
  
  const { id } = await params;

  const technique = await fetchTechnique(id);

  if (!technique) {
    return <h1>Prueba</h1>;  // TODO not found technique page
  }

  return (
    <TechniqueCard technique={technique} />
  );
}
