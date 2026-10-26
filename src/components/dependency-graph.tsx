import { useMemo } from "react";
import {
  Background,
  Controls,
  Handle,
  MarkerType,
  MiniMap,
  Position,
  ReactFlow,
  type Edge,
  type Node,
  type NodeProps,
} from "@xyflow/react";
import { cn } from "@/lib/utils";
import type { Health } from "@/lib/workspace-data";

type GraphItem = {
  id: string;
  label: string;
  type: string;
  status: Health;
  owner: string;
  projectId: string;
};

type EntityData = GraphItem & { label: string };
type EntityNodeType = Node<EntityData, "entity">;

const coordinates: Record<string, { x: number; y: number }> = {
  migration: { x: 40, y: 95 },
  docs: { x: 40, y: 280 },
  api: { x: 300, y: 180 },
  tests: { x: 560, y: 180 },
  milestone: { x: 820, y: 180 },
  payment: { x: 1080, y: 180 },
  tokens: { x: 300, y: 440 },
  mobile: { x: 560, y: 440 },
};

const nodeTone: Record<Health, string> = {
  Healthy: "bg-success",
  "At risk": "bg-warning",
  Blocked: "bg-risk",
  Completed: "bg-muted-foreground",
};

function EntityNode({ data, selected }: NodeProps<EntityNodeType>) {
  return (
    <div className={cn("min-w-44 rounded-md border bg-card px-3 py-2.5 shadow-sm transition-shadow", selected ? "border-primary ring-2 ring-primary/15" : "border-border")}>
      <Handle type="target" position={Position.Left} className="!size-2 !border-0 !bg-muted-foreground" />
      <div className="flex items-center gap-2">
        <span className={cn("size-2 shrink-0 rounded-full", nodeTone[data.status])} />
        <span className="max-w-40 truncate text-xs font-semibold text-foreground">{data.label}</span>
      </div>
      <div className="mt-1.5 flex items-center justify-between gap-3 text-[10px] text-muted-foreground">
        <span className="capitalize">{data.type}</span>
        <span className="max-w-24 truncate">{data.owner}</span>
      </div>
      <Handle type="source" position={Position.Right} className="!size-2 !border-0 !bg-primary" />
    </div>
  );
}

const nodeTypes = { entity: EntityNode };

export default function DependencyGraph({
  nodes: items,
  edges: links,
  selectedNode,
  onNodeSelect,
}: {
  nodes: GraphItem[];
  edges: Array<{ id: string; source: string; target: string; animated?: boolean }>;
  selectedNode: string | null;
  onNodeSelect: (id: string) => void;
}) {
  const nodes = useMemo<EntityNodeType[]>(
    () => items.map((item) => ({
      id: item.id,
      type: "entity",
      position: coordinates[item.id] ?? { x: 0, y: 0 },
      data: { ...item, label: item.label },
      selected: item.id === selectedNode,
    })),
    [items, selectedNode],
  );
  const edges = useMemo<Edge[]>(() => links.map((edge) => ({
    ...edge,
    type: "smoothstep",
    animated: edge.animated ?? false,
    markerEnd: { type: MarkerType.ArrowClosed, width: 14, height: 14, color: "var(--color-primary)" },
    style: { stroke: "var(--color-primary)", strokeWidth: 1.5 },
  })), [links]);

  return (
    <div className="h-[580px] w-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.24 }}
        minZoom={0.25}
        maxZoom={1.5}
        onNodeClick={(_, node) => onNodeSelect(node.id)}
        nodesConnectable={false}
        proOptions={{ hideAttribution: true }}
      >
        <Background color="var(--color-border)" gap={18} size={1} />
        <Controls showInteractive={false} />
        <MiniMap
          pannable
          zoomable
          nodeColor={(node) => node.data["status"] === "Healthy" ? "var(--color-success)" : node.data["status"] === "Blocked" ? "var(--color-risk)" : "var(--color-warning)"}
          maskColor="var(--color-background)"
        />
      </ReactFlow>
    </div>
  );
}