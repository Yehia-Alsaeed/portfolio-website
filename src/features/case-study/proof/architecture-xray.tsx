"use client";

import "@xyflow/react/dist/style.css";

import { Background, Controls, ReactFlow, type Edge } from "@xyflow/react";
import * as React from "react";

import type { ArchitectureProof } from "@/content/projects/proof";
import {
  ArchitectureNode,
  type ArchitectureFlowNode,
} from "@/features/case-study/proof/architecture-node";

export type ArchitectureXRayProps = { proof: ArchitectureProof };

const nodeTypes = { architecture: ArchitectureNode };

function getInitialReducedMotion(): boolean {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function useReducedMotion(): boolean {
  const [reduced, setReduced] = React.useState(getInitialReducedMotion);

  React.useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const listener = (event: MediaQueryListEvent) => setReduced(event.matches);
    query.addEventListener("change", listener);
    return () => query.removeEventListener("change", listener);
  }, []);

  return reduced;
}

export function ArchitectureXRay({ proof }: ArchitectureXRayProps) {
  const [selectedId, setSelectedId] = React.useState<string | null>(null);
  const reducedMotion = useReducedMotion();

  const nodes: ArchitectureFlowNode[] = proof.nodes.map((node) => ({
    connectable: false,
    data: { node, onSelect: () => setSelectedId(node.id), selected: node.id === selectedId },
    draggable: false,
    height: 60,
    id: node.id,
    position: node.position,
    type: "architecture",
    width: 176,
  }));

  const edges: Edge[] = proof.edges.map((edge) => ({
    animated: !reducedMotion,
    id: edge.id,
    label: edge.label,
    source: edge.source,
    target: edge.target,
  }));

  const xs = proof.nodes.map((node) => node.position.x);
  const ys = proof.nodes.map((node) => node.position.y);
  const translateExtent: [[number, number], [number, number]] = [
    [Math.min(...xs) - 300, Math.min(...ys) - 300],
    [Math.max(...xs) + 500, Math.max(...ys) + 500],
  ];

  const selectedNode = proof.nodes.find((node) => node.id === selectedId);

  return (
    <div>
      <div style={{ height: 440 }}>
        <ReactFlow
          edges={edges}
          edgesFocusable={false}
          edgesReconnectable={false}
          elementsSelectable
          fitView
          maxZoom={1.5}
          minZoom={0.5}
          nodes={nodes}
          nodesConnectable={false}
          nodesDraggable={false}
          nodeTypes={nodeTypes}
          panOnScroll
          proOptions={{ hideAttribution: true }}
          translateExtent={translateExtent}
        >
          <Background />
          <Controls showInteractive={false} />
        </ReactFlow>
      </div>

      <div aria-live="polite" className="border-line border-t p-4">
        {selectedNode ? (
          <>
            <p className="text-accent-text font-mono text-[0.625rem] font-bold tracking-[0.1em] uppercase">
              {selectedNode.technology}
            </p>
            <h4 className="mt-1 text-base font-bold">{selectedNode.label}</h4>
            <p className="text-dim mt-2 text-sm leading-relaxed">{selectedNode.responsibility}</p>
            <dl className="mt-2 flex flex-col gap-2 font-mono text-[0.6875rem] leading-relaxed">
              <div>
                <dt className="text-dim tracking-[0.08em] uppercase">Input</dt>
                <dd className="mt-0.5">{selectedNode.input}</dd>
              </div>
              <div>
                <dt className="text-dim tracking-[0.08em] uppercase">Output</dt>
                <dd className="mt-0.5">{selectedNode.output}</dd>
              </div>
            </dl>
          </>
        ) : (
          <p className="text-dim text-sm">Select a node above to see its full detail.</p>
        )}
      </div>
    </div>
  );
}
