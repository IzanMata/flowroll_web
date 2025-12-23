'use client';

import { useState, useCallback, useEffect } from 'react';
import {
  ReactFlow,
  applyNodeChanges,
  applyEdgeChanges,
  addEdge,
} from '@xyflow/react';

import '@xyflow/react/dist/style.css';
import { useTechniques } from '@/features/techniques/hooks/useTechniques';

export default function TechniqueFlow() {
  const { data: techniques, loading } = useTechniques();

  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);

  useEffect(() => {
    if (!techniques) return;

    // ------------------------
    // 1️⃣ Mapear nodos
    // ------------------------
    const mappedNodes = techniques.map((tech, i) => ({
      id: tech.id.toString(),
      position: { x: 300, y: i * 150 },
      data: { label: tech.name },
    }));

    // ------------------------
    // 2️⃣ Mapear edges con label = transition_type
    // ------------------------
    const mappedEdges = [];

    techniques.forEach((tech) => {
      tech.leads_to.forEach((lead) => {
        const target = techniques.find((t) => t.name === lead.to_technique);

        if (target) {
          mappedEdges.push({
            id: `${tech.id}-${target.id}`,
            source: tech.id.toString(),
            target: target.id.toString(),
            label: lead.transition_type || 'chain', // <-- label del edge
            labelBgPadding: [4, 2],
            labelBgStyle: { fill: 'white', fillOpacity: 0.7 },
            labelStyle: { fontSize: 12, fontWeight: 600 },
          });
        }
      });
    });

    setNodes(mappedNodes);
    setEdges(mappedEdges);
  }, [techniques]);

  const onNodesChange = useCallback(
    (changes) => setNodes((nds) => applyNodeChanges(changes, nds)),
    [],
  );

  const onEdgesChange = useCallback(
    (changes) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    [],
  );

  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge(params, eds)),
    [],
  );

  if (loading) return <p>Cargando...</p>;

  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        fitView
      />
    </div>
  );
}
