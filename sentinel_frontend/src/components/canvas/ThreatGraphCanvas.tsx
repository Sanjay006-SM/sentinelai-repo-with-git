"use client";

import { useGetAttackPath } from "@/lib/queries";
import ReactFlow, { Background, Controls, Edge, Node, MarkerType } from "reactflow";
import "reactflow/dist/style.css";
import { useMemo, useEffect } from "react";
import dagre from "dagre";

const dagreGraph = new dagre.graphlib.Graph();
dagreGraph.setDefaultEdgeLabel(() => ({}));

const getLayoutedElements = (nodes: Node[], edges: Edge[], direction = 'TB') => {
  dagreGraph.setGraph({ rankdir: direction });

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: 220, height: 100 });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  nodes.forEach((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    // Offset for center-to-topleft
    node.position = {
      x: nodeWithPosition.x - 110,
      y: nodeWithPosition.y - 50,
    };
  });

  return { nodes, edges };
};

export default function ThreatGraphCanvas({ identityId }: { identityId: string }) {
  const { data, isLoading } = useGetAttackPath(identityId);

  const { layoutedNodes, layoutedEdges } = useMemo(() => {
    if (!data?.nodes || !data?.edges) return { layoutedNodes: [], layoutedEdges: [] };

    const initialNodes: Node[] = data.nodes.map((n) => ({
      id: n.id,
      position: { x: 0, y: 0 },
      data: { label: n.label || n.data?.name || n.type || n.id },
      style: {
        background: n.type === 'Identity' ? 'rgba(6, 182, 212, 0.1)' : 'rgba(16, 185, 129, 0.1)',
        color: '#fff',
        border: `1px solid ${n.type === 'Identity' ? '#06b6d4' : '#10b981'}`,
        borderRadius: '8px',
        padding: '12px',
        width: 220,
        boxShadow: `0 0 15px ${n.type === 'Identity' ? 'rgba(6, 182, 212, 0.2)' : 'rgba(16, 185, 129, 0.2)'}`,
      }
    }));

    const initialEdges: Edge[] = data.edges.map(e => ({
      id: e.id,
      source: e.source,
      target: e.target,
      label: e.label || e.type,
      animated: e.type === 'ASSUMED_ROLE' || e.label === 'ASSUMED_ROLE',
      style: { stroke: (e.type === 'ASSUMED_ROLE' || e.label === 'ASSUMED_ROLE') ? '#8b5cf6' : '#06b6d4', strokeWidth: 2 },
      labelStyle: { fill: '#fff', fontWeight: 700 },
      labelBgStyle: { fill: '#18181b' },
      markerEnd: {
        type: MarkerType.ArrowClosed,
        color: (e.type === 'ASSUMED_ROLE' || e.label === 'ASSUMED_ROLE') ? '#8b5cf6' : '#06b6d4',
      },
    }));

    const layouted = getLayoutedElements(initialNodes, initialEdges, 'TB');
    return { layoutedNodes: layouted.nodes, layoutedEdges: layouted.edges };
  }, [data]);

  if (isLoading) {
    return <div className="h-full flex items-center justify-center text-[#06b6d4] animate-pulse">Loading Attack Graph...</div>;
  }

  return (
    <div className="h-full w-full bg-[#09090b]">
      <ReactFlow nodes={layoutedNodes} edges={layoutedEdges} fitView>
        <Background color="#18181b" gap={20} />
        <Controls />
      </ReactFlow>
    </div>
  );
}
