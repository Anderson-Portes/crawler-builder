"use client";

import React, { useEffect, useState, useCallback } from "react";
import ReactFlow, {
  addEdge,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  Connection,
  Edge,
  Node,
} from "reactflow";
import "reactflow/dist/style.css";
import {
  fetchWorkflow,
  createWorkflow,
  createNode,
  updateNode,
  createConnection,
  updateConnection,
} from "@/lib/api";

interface Props {
  workflowId: string;
}

interface WorkflowNodeData {
  label: string;
}

export default function WorkflowBuilder({ workflowId }: Props) {
  const [nodes, setNodes, onNodesChange] = useNodesState<
    Node<WorkflowNodeData>[]
  >([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge[]>([]);
  const [loading, setLoading] = useState(true);
  const [workflow, setWorkflow] = useState<any>(null);

  // -------- Load workflow --------
  useEffect(() => {
    (async () => {
      if (!workflowId) return;

      let wf;
      try {
        wf = await fetchWorkflow(workflowId);
      } catch {
        wf = await createWorkflow({ name: `Workflow ${workflowId}` });
      }

      setWorkflow(wf);

      // Map nodes
      setNodes(
        wf.nodes.map((n: any) => ({
          id: String(n.id),
          position: { x: n.x ?? 0, y: n.y ?? 0 },
          data: { label: n.label || `Node ${n.id}` },
        }))
      );

      // Map connections
      setEdges(
        wf.connections.map((c: any) => ({
          id: String(c.id),
          source: String(c.sourceNode.id),
          target: String(c.targetNode.id),
          sourceHandle: undefined,
          targetHandle: undefined,
        }))
      );

      setLoading(false);
    })();
  }, [workflowId]);

  // -------- Add new node --------
  const onAddNode = () => {
    const newNode: Node<WorkflowNodeData> = {
      id: `new-${Date.now()}`,
      data: { label: "Novo Node" },
      position: { x: 100, y: 100 },
    };
    setNodes((nds) => [...nds, newNode]);
  };

  // -------- Connect new edge --------
  const onConnectNew = useCallback((params: Connection) => {
    if (!params.source || !params.target) return;

    const newEdge: Edge = {
      id: `new-${Date.now()}`,
      source: params.source!,
      target: params.target!,
      sourceHandle: params.sourceHandle ?? undefined,
      targetHandle: params.targetHandle ?? undefined,
    };
    setEdges((eds) => addEdge(newEdge, eds));
  }, []);

  // -------- Save workflow changes --------
  const handleSave = async () => {
    if (!workflow) return;

    // Save nodes
    for (const n of nodes) {
      if (n.id.startsWith("new-")) {
        const saved = await createNode({
          workflowId: Number(workflow.id),
          type: "default",
          config: { label: n.data.label, x: n.position.x, y: n.position.y },
        });
        n.id = String(saved.id);
      } else {
        await updateNode(Number(n.id), {
          x: n.position.x,
          y: n.position.y,
          label: n.data.label,
        });
      }
    }

    // Save connections
    for (const e of edges) {
      if (!e.source || !e.target) continue; // garante que não haja edges inválidas

      if (e.id.startsWith("new-")) {
        const saved = await createConnection({
          workflowId: workflow.id,
          sourceNodeId: e.source,
          targetNodeId: e.target,
        });
        e.id = String(saved.id);
      } else {
        await updateConnection(e.id, {
          sourceNodeId: e.source,
          targetNodeId: e.target,
        });
      }
    }

    alert("Workflow salvo com sucesso!");
  };

  if (loading) return <div className="p-4">Carregando workflow...</div>;

  return (
    <div className="w-full h-[calc(100vh-4rem)] bg-gray-100 rounded-xl shadow-inner p-2 flex flex-col">
      {/* Botão salvar / adicionar node */}
      <div className="flex justify-between mb-2">
        <button
          onClick={onAddNode}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
        >
          Adicionar Node
        </button>
        <button
          onClick={handleSave}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Salvar Workflow
        </button>
      </div>

      {/* Canvas React Flow */}
      <div className="flex-1">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnectNew}
          fitView
        >
          <Background />
          <MiniMap />
          <Controls />
        </ReactFlow>
      </div>
    </div>
  );
}
