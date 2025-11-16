'use client';

import { useState, useCallback, useEffect } from 'react';
import { ReactFlow, applyNodeChanges, applyEdgeChanges, addEdge } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useTechniques } from "@/features/techniques/hooks/useTechniques";

export default function App() {
  const techniquesQuery = useTechniques();
  const techniques = techniquesQuery.data;

  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);

  useEffect(() => {
    if (!techniques) return;

    const mappedNodes = techniques.map((tech, index) => ({
      id: tech.id.toString(),
      position: { x: 0, y: index * 120 },
      data: { label: tech.name }
    }));

    setNodes(mappedNodes);
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

  if (techniquesQuery.isLoading) return <p>Cargando técnicas...</p>;
  if (techniquesQuery.error) return <p>Error cargando técnicas</p>;

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