'use client';

import React, { useState } from 'react';
import {
  Box,
  Container,
  Heading,
  Text,
  Badge,
  Flex,
  IconButton,
  Button,
  Tabs,
  HStack,
  Icon,
  AspectRatio,
  SimpleGrid,
  VStack,
} from '@chakra-ui/react';

// Importa tus tipos reales aquí
import { Technique, ColorEnum } from '@/types'; 

// --- MOCK DATA (Para simular la API) ---
const mockTechnique: Technique = {
  id: 1,
  name: 'Armbar desde Guardia Cerrada',
  description:
    'El Armbar desde la guardia es una sumisión clásica que hiperextiende la articulación del codo. La mecánica principal consiste en aislar el brazo del oponente, romper su postura controlando la cabeza y pasar la pierna sobre su cara para asegurar la palanca. Es crucial mantener las rodillas apretadas ("pinch") para evitar que saque el codo.',
  difficulty: 2,
  min_belt: { id: 1, color: 'white', order: 1 },
  categories: [{ id: 1, name: 'Guardia' }, { id: 2, name: 'Sumisión' }],
  variations: [
    { id: 101, name: 'Armbar con agarre cruzado' },
    { id: 102, name: 'Helicopter Armbar (Transición)' },
    { id: 103, name: 'Armbar invertido' },
  ],
  leads_to: [
    { id: 201, to_technique: 'Triángulo', description: 'Si el oponente saca el brazo hacia atrás' },
    { id: 202, to_technique: 'Omoplata', description: 'Si el oponente gira el codo hacia el suelo' },
    { id: 203, to_technique: 'Flower Sweep', description: 'Si el oponente se planta fuerte' },
  ],
};

// --- MAPEO DE COLORES DE CINTURÓN ---
const beltColors: Record<ColorEnum, string> = {
  white: 'gray',
  blue: 'blue',
  purple: 'purple',
  brown: 'orange', // Chakra usa orange/yellow para marrones
  black: 'red',    // Rojo destaca bien sobre fondo negro
};

export default function TechniqueDetailPage() {
  const [showFullDesc, setShowFullDesc] = useState(false);

  
  // Color dinámico según el cinturón de la técnica
  const accentColor = beltColors[mockTechnique.min_belt.color];

  return (
    <Box minH="100vh" color="gray.100" pb={20}>
      
      {/* 1. STICKY HEADER CON VIDEO */}
      <Box 
        position="sticky" 
        top="0" 
        zIndex="100" 
        bg="black" 
        shadow="xl"
      >
        <AspectRatio ratio={16 / 9} maxH={{ base: "250px", md: "400px" }}>
          <Box 
            bgGradient="radial(gray.800, black)" 
            position="relative" 
            cursor="pointer"
            role="group"
          >
            {/* Overlay estético */}
            <Box position="absolute" inset="0" bg="blackAlpha.400" _groupHover={{ bg: 'blackAlpha.200' }} transition="all 0.3s"/>
            
            {/* Botón de Play Simulado */}
            <VStack zIndex={2}>
              <Box 
                p={4} 
                rounded="full" 
                bg="whiteAlpha.200" 
                backdropFilter="blur(10px)"
                border="1px solid"
                borderColor="whiteAlpha.400"
                transition="transform 0.2s"
                _groupHover={{ transform: 'scale(1.1)', bg: 'whiteAlpha.300' }}
              >
              </Box>
              <Text fontSize="xs" fontWeight="bold" color="whiteAlpha.800">
                VER EXPLICACIÓN (03:45)
              </Text>
            </VStack>
          </Box>
        </AspectRatio>
      </Box>

      {/* CONTENEDOR PRINCIPAL */}
      <Container maxW="container.md" pt={6} px={5}>
        
        {/* 2. ENCABEZADO DE TÉCNICA */}
        <Flex justify="space-between" align="start" mb={4}>
          <VStack align="start">
            <Badge 
              colorScheme={accentColor} 
              variant="subtle" 
              px={2} 
              py={1} 
              rounded="md"
              fontSize="0.7em"
              letterSpacing="widest"
            >
              {mockTechnique.min_belt.color.toUpperCase()} BELT
            </Badge>
            
            <Heading as="h1" size="lg" color="white" lineHeight="short">
              {mockTechnique.name}
            </Heading>
          </VStack>

          <IconButton
            aria-label="Compartir técnica"
            variant="ghost"
            color="gray.400"
            _hover={{ bg: 'whiteAlpha.100', color: 'white' }}
          />
        </Flex>

        {/* 3. DESCRIPCIÓN CON COLLAPSE */}
        <Box 
          
          p={4} 
          rounded="xl" 
          borderLeft="4px solid" 
          borderLeftColor={`${accentColor}.500`}
          shadow="lg"
          mb={8}
        >

          <Button 
            size="xs"
            display="flex" 
            alignItems="center"
            mt={2}
            color={`${accentColor}.300`} 
            onClick={() => setShowFullDesc(!showFullDesc)}
            _hover={{ color: `${accentColor}.200` }}
          >
            {showFullDesc ? 'Ocultar detalles' : 'Leer descripción completa'}
            
          </Button>
        </Box>

      </Container>
    </Box>
  );
}
