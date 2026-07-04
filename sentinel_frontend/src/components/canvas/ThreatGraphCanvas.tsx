"use client";

import { useGetAttackPath } from "@/lib/queries";
import ReactFlow, { 
  Background, 
  Controls, 
  Edge, 
  Node, 
  MarkerType, 
  Handle, 
  Position,
  useNodesState,
  useEdgesState,
  useViewport,
  ReactFlowProvider,
  Panel
} from "reactflow";
import "reactflow/dist/style.css";
import { useEffect, useCallback } from "react";
import dagre from "dagre";

const getLayoutedElements = (nodes: Node[], edges: Edge[], direction = 'TB') => {
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));
  dagreGraph.setGraph({ rankdir: direction });

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: 220, height: 100 });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  const layoutedNodes = nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    return {
      ...node,
      position: {
        x: nodeWithPosition.x - 110,
        y: nodeWithPosition.y - 50,
      }
    };
  });

  return { nodes: layoutedNodes, edges };
};

// Custom Node for Light Theme
const CustomNode = ({ data, selected, dragging }: any) => {
  const isRootIdentity = data.label?.includes('root') || data.nodeType === 'Root';
  const isIdentity = data.nodeType === 'Identity' || data.nodeType === 'User' || isRootIdentity;
  const isIP = data.nodeType === 'IP' || data.nodeType === 'IpAddress';
  const isPolicy = data.nodeType === 'Policy' || data.nodeType === 'Permission';
  
  let bgClass = "bg-[var(--node-bg)]";
  let textClass = "text-[var(--node-text)]";
  let borderClass = "border-[var(--node-border)]";
  
  if (isRootIdentity) {
    bgClass = "bg-[var(--node-identity-bg)]";
    textClass = "text-[var(--node-identity-text)] font-semibold";
    borderClass = "border-[var(--node-border-active)]";
  } else if (isIdentity) {
    borderClass = "border-[var(--node-border-active)]";
  } else if (isIP) {
    borderClass = "border-[var(--node-ip-border)]";
  } else if (isPolicy) {
    borderClass = "border-[var(--node-policy-border)]";
  }

  const dragStyles = dragging 
    ? "scale-[1.02] shadow-[0_8px_24px_rgba(99,102,241,0.18)] border-[var(--node-border-active)] cursor-grabbing" 
    : "hover:-translate-y-0.5 hover:shadow-[var(--node-shadow-hover)] hover:border-[var(--node-border-active)] cursor-grab";

  const selectedStyles = (selected && !dragging) ? "ring-[3px] ring-[rgba(99,102,241,0.25)] ring-offset-0" : "";

  return (
    <div 
      className={`relative px-4 py-3 rounded-xl border ${bgClass} ${textClass} ${borderClass} 
      shadow-[var(--node-shadow)] transition-all duration-200 ${dragStyles} ${selectedStyles}`}
      style={{ width: 220, minHeight: 60 }}
    >
      <Handle type="target" position={Position.Top} className="opacity-0" />
      <div className="text-sm break-words">{data.label}</div>
      <Handle type="source" position={Position.Bottom} className="opacity-0" />
    </div>
  );
};

const nodeTypes = { custom: CustomNode };

// Two-tier Zoom-aware Background
const GraphBackground = () => {
  const { zoom } = useViewport();
  return (
    <>
      {/* Major Grid */}
      <Background variant={"lines" as any} gap={100} color="#D1D5DB" lineWidth={1} />
      {/* Minor Grid - Hides at low zoom levels */}
      {zoom >= 0.6 && <Background variant={"lines" as any} gap={20} color="#E5E7EB" lineWidth={0.5} />}
    </>
  );
};

function ThreatGraphCanvasInner({ data }: { data: any }) {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  const onLayout = useCallback(() => {
    if (!data?.nodes || !data?.edges) return;

    const initialNodes: Node[] = data.nodes.map((n: any) => ({
      id: n.id,
      position: { x: 0, y: 0 },
      type: 'custom',
      data: { 
        label: n.label || n.data?.name || n.type || n.id,
        nodeType: n.type
      },
    }));

    const initialEdges: Edge[] = data.edges.map((e: any) => {
      const isAssumed = e.type === 'ASSUMED_ROLE' || e.label === 'ASSUMED_ROLE';
      const edgeColor = isAssumed ? 'var(--node-border-active)' : 'var(--edge-color)';
      
      return {
        id: e.id,
        source: e.source,
        target: e.target,
        label: e.label || e.type,
        animated: isAssumed,
        className: 'edge-draw-in',
        style: { stroke: edgeColor, strokeWidth: 1.5 },
        labelStyle: { fill: 'var(--edge-label-text)', fontWeight: 600, fontSize: 10, letterSpacing: '0.05em', textTransform: 'uppercase' },
        labelBgStyle: { fill: 'var(--edge-label-bg)', stroke: '#E2E8F0', strokeWidth: 1, rx: 4, ry: 4 },
        labelBgPadding: [6, 4],
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: edgeColor,
        },
      };
    });

    const layouted = getLayoutedElements(initialNodes, initialEdges, 'TB');
    setNodes(layouted.nodes);
    setEdges(layouted.edges);
  }, [data, setNodes, setEdges]);

  useEffect(() => {
    onLayout();
  }, [onLayout]);

  return (
    <ReactFlow 
      nodes={nodes} 
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      nodeTypes={nodeTypes}
      nodesDraggable={true}
      snapToGrid={true}
      snapGrid={[20, 20]}
      fitView
      fitViewOptions={{ padding: 0.2 }}
    >
      <GraphBackground />
      <Controls />
      <Panel position="top-right" className="m-4">
        <button 
          onClick={onLayout}
          className="bg-white border border-gray-200 px-3 py-1.5 rounded-lg shadow-sm text-sm font-semibold text-slate-600 hover:text-indigo-600 hover:bg-slate-50 transition-colors"
        >
          Reset Layout
        </button>
      </Panel>
    </ReactFlow>
  );
}

export default function ThreatGraphCanvas({ identityId }: { identityId: string }) {
  const { data, isLoading } = useGetAttackPath(identityId);

  if (isLoading) {
    return <div className="h-full flex items-center justify-center text-indigo-600 animate-pulse">Loading Investigations...</div>;
  }

  return (
    <div className="h-full w-full bg-[var(--graph-bg)] relative">
      <ReactFlowProvider>
        <ThreatGraphCanvasInner data={data} />
      </ReactFlowProvider>
    </div>
  );
}
