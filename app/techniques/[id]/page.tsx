export default async function TechniquePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <div className="p-8">
      <h1 className="text-lg font-semibold">Técnica #{id}</h1>
      <p className="text-sm text-muted-foreground mt-2">Módulo en desarrollo.</p>
    </div>
  );
}
