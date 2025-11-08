"use client";

import React, { useEffect, useState, useCallback, useMemo } from "react";
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
  deleteNode,
  deleteConnection,
} from "@/lib/api";
import { CustomNode } from "./CustomNode";

interface Props {
  workflowId: string;
}

export default function WorkflowBuilder({ workflowId }: Props) {
  const [nodes, setNodes, onNodesChange] = useNodesState<{ label: string }>([]);
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
          position: { x: n.config?.x ?? 0, y: n.config?.y ?? 0 },
          data: { label: n.config?.label || `Node ${n.id}` },
        }))
      );

      // Map connections
      setEdges(
        wf.connections.map((c: any) => ({
          id: String(c.id),
          source: String(c.sourceNode.id),
          target: String(c.targetNode.id),
          sourceHandle: c.sourceHandle ?? undefined,
          targetHandle: c.targetHandle ?? undefined,
        }))
      );

      setLoading(false);
    })();
  }, [workflowId]);

  // -------- Add new node --------
  const onAddNode = () => {
    const newNode: Node<{ label: string }> = {
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
      source: params.source,
      target: params.target,
      sourceHandle: params.sourceHandle ?? undefined,
      targetHandle: params.targetHandle ?? undefined,
    };
    setEdges((eds) => addEdge(newEdge, eds));
  }, []);

  // -------- Save workflow changes --------
  const handleSave = async () => {
    if (!workflow) return;

    const idMap: Record<string, string> = {};

    // 1️⃣ Salvar nodes
    const updatedNodes = await Promise.all(
      nodes.map(async (n) => {
        if (n.id.startsWith("new-")) {
          const saved = await createNode({
            workflowId: Number(workflow.id),
            type: "default",
            config: { label: n.data.label, x: n.position.x, y: n.position.y },
          });
          idMap[n.id] = String(saved.id);
          return { ...n, id: String(saved.id) };
        } else {
          await updateNode(Number(n.id), {
            type: "default",
            config: { label: n.data.label, x: n.position.x, y: n.position.y },
          });
          return n;
        }
      })
    );

    setNodes(updatedNodes); // atualiza nodes no estado

    // 2️⃣ Atualizar edges no frontend
    const updatedEdges = edges.map((e) => ({
      ...e,
      source: idMap[e.source] ?? e.source,
      target: idMap[e.target] ?? e.target,
    }));
    setEdges(updatedEdges); // dispara re-render do React Flow

    // 3️⃣ Salvar conexões no backend
    for (const e of updatedEdges) {
      if (!e.source || !e.target) continue;

      const payload = {
        workflowId: Number(workflow.id),
        sourceNodeId: Number(e.source),
        targetNodeId: Number(e.target),
      };

      if (e.id.startsWith("new-")) {
        const saved = await createConnection(payload);
        e.id = String(saved.id);
      } else {
        await updateConnection(Number(e.id), payload);
      }
    }

    alert("Workflow salvo com sucesso!");
  };

  const onDeleteNode = useCallback(
    async (nodeId: string) => {
      if (nodeId.startsWith("new-")) {
        setNodes((nds) => nds.filter((n) => n.id !== nodeId));
      } else {
        await deleteNode(Number(nodeId));
        setNodes((nds) => nds.filter((n) => n.id !== nodeId));
        // Remove conexões ligadas
        setEdges((eds) =>
          eds.filter((e) => e.source !== nodeId && e.target !== nodeId)
        );
      }
    },
    [setNodes, setEdges]
  );

  const onDeleteEdge = useCallback(
    async (edgeId: string) => {
      if (edgeId.startsWith("new-")) {
        setEdges((eds) => eds.filter((e) => e.id !== edgeId));
      } else {
        await deleteConnection(Number(edgeId));
        setEdges((eds) => eds.filter((e) => e.id !== edgeId));
      }
    },
    [setEdges]
  );

  const nodesWithDeleteAndRename = nodes.map((n) => ({
    ...n,
    type: "custom",
    data: {
      ...n.data,
      onDelete: (nodeId: string) => {
        setNodes((nds) => nds.filter((x) => x.id !== nodeId));
        setEdges((eds) =>
          eds.filter((e) => e.source !== nodeId && e.target !== nodeId)
        );
        if (!nodeId.startsWith("new-")) deleteNode(Number(nodeId));
      },
      onRename: (nodeId: string, newLabel: string) => {
        setNodes((nds) =>
          nds.map((x) =>
            x.id === nodeId ? { ...x, data: { ...x.data, label: newLabel } } : x
          )
        );
        if (!nodeId.startsWith("new-"))
          updateNode(Number(nodeId), {
            config: { ...n.position, label: newLabel },
            type: "default",
          });
      },
    },
  }));

  const memoNodeTypes = useMemo(
    () => ({
      custom: CustomNode,
    }),
    []
  );

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
          nodes={nodesWithDeleteAndRename}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnectNew}
          nodeTypes={memoNodeTypes}
        >
          <Background />
          <MiniMap />
          <Controls />
        </ReactFlow>
      </div>
    </div>
  );
}
