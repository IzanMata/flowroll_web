import { fetchTechnique } from '@/features/techniques/api/fetchTechniques';

export default async function TechniquePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const technique = await fetchTechnique(id);

  if (!technique) {
    return <h1>Not found</h1>; // TODO not found technique page
  }

  return <h1>{technique.name}</h1>;
}
