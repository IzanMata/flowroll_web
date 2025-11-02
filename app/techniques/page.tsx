import { TechniqueNode } from '@/features/techniques/components/TechniqueNode';
import { fetchTechniques } from '@/features/techniques/api/fetchTechniques';

export default async function TechniquesPage() {
  const techniques = await fetchTechniques();

  return (
    <main className="p-6">
      <h1 className="text-3xl font-bold mb-8">Techniques</h1>
      <div className="flex flex-wrap gap-6">
        {techniques.map((tech) => (
          <TechniqueNode key={tech.id} technique={tech} />
        ))}
      </div>
    </main>
  );
}
