import { fetchTechniques } from '@/features/techniques/api/fetchTechniques';
import { TechniqueCard } from '@/components/techniques/technique-card';
import { SimpleGrid, Box, Heading, Input, InputGroup, Grid } from '@chakra-ui/react';
import { CiSearch } from "react-icons/ci";
import { fetchCategories } from '@/features/categories/api/fetchCategories';
import { fetchBelts } from '@/features/belts/api/fetchBelts';

export default async function TechniquesPage() {

  const [techniques, categories, belts] = await Promise.all([
    fetchTechniques(),
    fetchCategories(),
    fetchBelts(),
  ]);

  return (
    <Box p={6}>
      <Heading as="h1" size="2xl" mb={8}>Techniques</Heading>
      <Box mb={6}>
        
        <InputGroup startElement={<CiSearch />}>
          <Input placeholder="Buscar técnicas..." />
        </InputGroup>

        <Grid templateColumns="repeat(3, 1fr)" gap="6">

          <Box p={4} borderWidth="1px" borderRadius="md">
            
            <Heading size="md" mb={4}>Categories</Heading>

            <SimpleGrid columns={{ base: 1, sm: 2, md: 3, lg: 4 }}>
              {categories.map((category) => (
                <Box key={category.id} p={4} borderWidth="1px" borderRadius="md">
                  {category.name}
                </Box>
              ))}
            </SimpleGrid>

          </Box>

          <Box p={4} borderWidth="1px" borderRadius="md">
            
            <h3>Belts</h3>

            <SimpleGrid columns={{ base: 1, sm: 2, md: 3, lg: 4 }}>
              {belts.map((belt) => (
                <Box key={belt.id} p={4} borderWidth="1px" borderRadius="md">
                  {belt.color}
                </Box>
              ))}
            </SimpleGrid>

          </Box>

        </Grid>

        
      </Box>
      <SimpleGrid columns={{ base: 1, sm: 2, md: 3, lg: 4 }}>
        {techniques.map((technique) => (
          <TechniqueCard key={technique.id} technique={technique} />
        ))}
      </SimpleGrid>
    </Box>
  );
}