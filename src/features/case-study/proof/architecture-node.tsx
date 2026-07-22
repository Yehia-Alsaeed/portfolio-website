"use client";

import type { Node, NodeProps } from "@xyflow/react";
import { Handle, Position } from "@xyflow/react";

import type { ProofNode } from "@/content/projects/proof";
import { cn } from "@/lib/utils";

export type ArchitectureNodeData = {
  node: ProofNode;
  selected: boolean;
  onSelect: () => void;
};

export type ArchitectureFlowNode = Node<ArchitectureNodeData, "architecture">;

export function ArchitectureNode({ data }: NodeProps<ArchitectureFlowNode>) {
  return (
    <>
      <Handle position={Position.Left} type="target" />
      <button
        aria-pressed={data.selected}
        className={cn(
          "border-line bg-paper min-w-[160px] cursor-pointer border px-3 py-2 text-left font-mono transition-colors",
          data.selected ? "bg-ink text-paper" : "hover:bg-soft",
        )}
        onClick={data.onSelect}
        type="button"
      >
        <span className="block text-[0.5625rem] tracking-[0.1em] uppercase opacity-70">
          {data.node.technology}
        </span>
        <span className="block text-sm font-bold">{data.node.label}</span>
      </button>
      <Handle position={Position.Right} type="source" />
    </>
  );
}
