'use client';

import { fetchTechniques } from '@/features/techniques/api/fetchTechniques';
import { TechniqueCard } from '@/components/techniques/technique-card';
import { SimpleGrid, Box, Heading } from '@chakra-ui/react';

export default async function TechniquesPage() {
  const techniques = await fetchTechniques();

  return (
    <Box p={6}>
      <Heading as="h1" size="2xl" mb={8}>
        Techniques
      </Heading>

      <SimpleGrid columns={{ base: 1, sm: 2, md: 3, lg: 4 }}>
        {techniques.map((technique) => (
          <TechniqueCard key={technique.id} technique={technique} />
        ))}
      </SimpleGrid>
    </Box>
  );
}
