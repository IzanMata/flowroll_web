'use client'

import {
  Card,
  CardBody,
  CardFooter,
  Image,
  Text,
  Button,
  Badge,
  VStack,
  HStack,
  Box,
  Flex,
} from '@chakra-ui/react'

type Technique = {
  id: number
  name: string
  description?: string
  difficulty?: number
  min_belt?: { id: number; color: string; order: number } | null
  categories?: { id: number; name: string }[]
  variations?: { id: number; name: string; description?: string }[]
  leads_to?: { id: number; to_technique?: string }[]
}

export const TechniqueCard = ({ technique }: { technique: Technique }) => {
  return (
    <Card.Root
      maxW="sm"
      borderWidth="1px"
      borderRadius="lg"
      borderColor={technique.min_belt ? technique.min_belt.color : 'gray.200'}
      boxShadow="md"
      overflow="hidden"
      m={4}
      transition="all 0.2s"
      _hover={{ boxShadow: 'xl', transform: 'translateY(-4px)' }}
    >
      {/* <Image
        src=""
        alt={technique.name}
        objectFit="cover"
        h="180px"
        w="100%"
      /> */}

      <CardBody>
        <Flex justify="space-between" align="center" mb={2}>
          <Text fontSize="xl" fontWeight="bold">
            {technique.name}
          </Text>
          {technique.difficulty && (
            <Badge colorScheme="red">{`Dificultad: ${technique.difficulty}`}</Badge>
          )}
        </Flex>

        {technique.min_belt && (
          <Badge colorScheme="teal" mb={2}>
            Belt: {technique.min_belt.color}
          </Badge>
        )}

        {technique.categories && technique.categories.length > 0 && (
          <HStack mb={2} wrap="wrap">
            {technique.categories.map((c) => (
              <Badge key={c.id} colorScheme="blue">
                {c.name}
              </Badge>
            ))}
          </HStack>
        )}

        {technique.description && (
          <Text fontSize="sm" color="gray.600" mb={2}>
            {technique.description}
          </Text>
        )}

        <Box borderBottom="1px solid" borderColor="gray.200" my={2} />

        {technique.variations && technique.variations.length > 0 && (
          <VStack align="start" mb={2}>
            <Text fontWeight="semibold">Variaciones:</Text>
            {technique.variations.map((v) => (
              <Text key={v.id} fontSize="sm">
                • {v.name} {v.description && `- ${v.description}`}
              </Text>
            ))}
          </VStack>
        )}

        {technique.leads_to && technique.leads_to.length > 0 && (
          <VStack align="start" mb={2}>
            <Text fontWeight="semibold">Conduce a:</Text>
            {technique.leads_to.map((l, i) => (
              <Text key={i} fontSize="sm">
                • {l.to_technique || 'Desconocido'}
              </Text>
            ))}
          </VStack>
        )}
      </CardBody>

      <CardFooter gap={2}>
        <Button colorScheme="teal" flex={1}>
          Learn
        </Button>
        <Button variant="outline" flex={1}>
          Añadir a favoritos
        </Button>
      </CardFooter>
    </Card.Root>

  )
}
