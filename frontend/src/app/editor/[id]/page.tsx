"use client";
import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  applyNodeChanges,
  applyEdgeChanges,
  addEdge,
  Node,
  Edge,
  OnNodesChange,
  OnEdgesChange,
  OnConnect,
  ReactFlowProvider,
  useReactFlow,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import Swal from "sweetalert2";
import api from "@/lib/api";
import { Sidebar } from "@/components/Sidebar";
import { HttpNode } from "@/components/flow/nodes/HttpNode";
import { SelectorNode } from "@/components/flow/nodes/SelectorNode";
import { ExportNode } from "@/components/flow/nodes/ExportNode";
import { ClickNode } from "@/components/flow/nodes/ClickNode";
import { InputNode } from "@/components/flow/nodes/InputNode";
import { WaitNode } from "@/components/flow/nodes/WaitNode";
import { PropertiesSidebar } from "@/components/flow/PropertiesSidebar";
import {
  Play,
  Pencil,
  Check,
  X,
  Save,
  ArrowLeft,
} from "lucide-react";

const nodeTypes = {
  http: HttpNode,
  selector: SelectorNode,
  export: ExportNode,
  click: ClickNode,
  input: InputNode,
  wait: WaitNode,
};

const initialNodes: Node[] = [];

import { AuthGuard } from "@/components/AuthGuard";

export default function EditorPage() {
  return (
    <AuthGuard>
      <ReactFlowProvider>
        <EditorContent />
      </ReactFlowProvider>
    </AuthGuard>
  );
}

function EditorContent() {
  const params = useParams();
  const router = useRouter();
  const { screenToFlowPosition, deleteElements } = useReactFlow();
  const [workflow, setWorkflow] = useState<any>(null);
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [tempTitle, setTempTitle] = useState("");
  useEffect(() => {
    if (params.id) {
      loadWorkflow(params.id as string);
    }
  }, [params.id]);
  const loadWorkflow = async (id: string) => {
    try {
      const { data } = await api.get(`/workflows/${id}`);
      setWorkflow(data);
      setTempTitle(data.name);
      if (data.nodes_data && data.nodes_data.nodes) {
        setNodes(data.nodes_data.nodes);
        setEdges(data.nodes_data.edges || []);
      } else {
        setNodes(initialNodes);
      }
    } catch (err) {
      console.error(err);
      Swal.fire("Erro!", "Não foi possível carregar o fluxo.", "error").then(
        () => {
          router.push("/dashboard");
        },
      );
    }
  };
  const saveWorkflow = async () => {
    if (!workflow) return;
    try {
      const nodes_data = { nodes, edges };
      await api.put(`/workflows/${workflow.id}`, { nodes_data });
      const Toast = Swal.mixin({
        toast: true,
        position: "bottom-end",
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
      });
      Toast.fire({
        icon: "success",
        title: "Fluxo salvo com sucesso!",
      });
    } catch (err) {
      console.error(err);
      Swal.fire("Erro!", "Houve um problema ao salvar as alterações.", "error");
    }
  };
  const handleRename = async (newName: string) => {
    if (!workflow || !newName.trim()) {
      setIsEditing(false);
      setTempTitle(workflow?.name || "");
      return;
    }
    try {
      await api.put(`/workflows/${workflow.id}`, { name: newName });
      setWorkflow({ ...workflow, name: newName });
      setIsEditing(false);
    } catch (err) {
      console.error(err);
      Swal.fire("Erro!", "Não foi possível renomear o fluxo.", "error");
    }
  };
  const runWorkflow = async () => {
    if (!workflow) return;
    setIsRunning(true);
    try {
      await saveWorkflow();
      const { data } = await api.post(`/workflows/${workflow.id}/run`);
      const handleDownload = async (resultId: number, format: string) => {
        try {
          const response = await api.get(
            `/workflow-results/${resultId}/export?format=${format}`,
            {
              responseType: "blob",
            },
          );
          const url = window.URL.createObjectURL(new Blob([response.data]));
          const link = document.createElement("a");
          link.href = url;
          link.setAttribute("download", `resultado_${resultId}.${format}`);
          document.body.appendChild(link);
          link.click();
          link.remove();
        } catch (error) {
          console.error("Erro ao baixar arquivo:", error);
          Swal.fire("Erro!", "Não foi possível baixar o arquivo.", "error");
        }
      };
      if (data.status === "success") {
        const results = data.data;
        const resultId = data.id;
        const mainResult =
          results.find((r: any) => r.data)?.data || "Nenhum dado extraído";
        const exportNodes = results.filter((r: any) => r.format);
        Swal.fire({
          title: "Execução Concluída!",
          html: `
            <div class="text-left mt-4 space-y-4">
              <div>
                <p class="font-bold text-slate-600 mb-1">Prévia dos Dados:</p>
                <pre class="bg-slate-100 p-3 rounded text-xs overflow-auto max-h-40 border border-slate-200">${JSON.stringify(mainResult, null, 2)}</pre>
              </div>
              ${exportNodes.length > 0
              ? `
                <div class="border-t pt-4">
                  <p class="font-bold text-slate-600 mb-2">Arquivos Gerados:</p>
                  <div class="flex flex-wrap gap-2">
                    ${exportNodes
                .map(
                  (node: any) => `
                      <button id="download-${node.format}-${resultId}" class="px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded text-xs font-semibold flex items-center gap-1 transition">📥 Baixar ${node.format}</button>
                    `,
                )
                .join("")}
                  </div>
                </div>
              `
              : ""
            }
            </div>
          `,
          icon: "success",
          confirmButtonText: "Fechar",
          confirmButtonColor: "#2563eb",
          didOpen: () => {
            exportNodes.forEach((node: any) => {
              const btn = document.getElementById(
                `download-${node.format}-${resultId}`,
              );
              if (btn)
                btn.onclick = () =>
                  handleDownload(resultId, node.format.toLowerCase());
            });
          },
        });
      } else {
        Swal.fire(
          "Erro na Execução",
          data.error || "Erro desconhecido",
          "error",
        );
      }
    } catch (err: any) {
      console.error(err);
      Swal.fire("Erro!", "Falha ao conectar com a API de execução.", "error");
    } finally {
      setIsRunning(false);
    }
  };
  const onNodesChange: OnNodesChange = useCallback(
    (changes) => setNodes((nds) => applyNodeChanges(changes, nds)),
    [],
  );
  const onEdgesChange: OnEdgesChange = useCallback(
    (changes) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    [],
  );
  const onConnect: OnConnect = useCallback(
    (params) => setEdges((eds) => addEdge(params, eds)),
    [],
  );
  const onNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
    setSelectedNodeId(node.id);
  }, []);
  const onPaneClick = useCallback(() => {
    setSelectedNodeId(null);
  }, []);
  const onUpdateNodeData = useCallback((nodeId: string, newData: any) => {
    setNodes((nds) =>
      nds.map((n) => {
        if (n.id === nodeId) return { ...n, data: newData };
        return n;
      }),
    );
  }, []);
  const handleDeleteNode = useCallback((nodeId: string) => {
    setNodes((nds) => nds.filter((n) => n.id !== nodeId));
    setEdges((eds) =>
      eds.filter((e) => e.source !== nodeId && e.target !== nodeId),
    );
    setSelectedNodeId(null);
  }, []);
  const onDragStart = (event: React.DragEvent, nodeType: string) => {
    event.dataTransfer.setData("application/reactflow", nodeType);
    event.dataTransfer.effectAllowed = "move";
  };
  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);
  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      const type = event.dataTransfer.getData("application/reactflow");
      if (!type) return;
      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });
      const newNode: Node = {
        id: `node_${Date.now()}`,
        type,
        position,
        data: { label: `${type} node` },
      };
      setNodes((nds) => nds.concat(newNode));
    },
    [screenToFlowPosition],
  );
  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col relative overflow-hidden">
        <header className="h-16 border-b bg-white/80 backdrop-blur-md px-6 flex items-center justify-between z-20 sticky top-0">
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard/workflows"
              className="p-2 hover:bg-slate-100 rounded-xl text-slate-400 hover:text-slate-600 transition-all"
            >
              <ArrowLeft size={20} />
            </Link>
            <div className="flex items-center gap-2">
              {isEditing ? (
                <div className="flex items-center gap-1">
                  <input
                    type="text"
                    value={tempTitle}
                    onChange={(e) => setTempTitle(e.target.value)}
                    autoFocus
                    onKeyDown={(e) =>
                      e.key === "Enter" && handleRename(tempTitle)
                    }
                    className="rounded-lg border border-blue-400 px-3 py-1 text-lg font-black text-slate-800 outline-none w-[300px]"
                  />
                  <button
                    onClick={() => handleRename(tempTitle)}
                    className="rounded-xl p-1.5 text-emerald-600 hover:bg-emerald-50 transition-colors"
                  >
                    <Check size={20} />
                  </button>
                  <button
                    onClick={() => {
                      setTempTitle(workflow?.name || "");
                      setIsEditing(false);
                    }}
                    className="rounded-xl p-1.5 text-rose-600 hover:bg-rose-50 transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2 group/title">
                  <h1 className="text-xl font-black text-slate-800 tracking-tight">
                    {workflow ? workflow.name : "Carregando..."}
                  </h1>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="opacity-0 group-hover/title:opacity-100 transition-opacity p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                  >
                    <Pencil size={18} />
                  </button>
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={saveWorkflow}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-bold text-slate-600 hover:border-slate-300 hover:bg-slate-50 transition-all shadow-sm active:scale-95"
            >
              <Save size={18} />
              Salvar
            </button>
            <button
              onClick={runWorkflow}
              disabled={isRunning}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-black text-white transition-all shadow-lg active:scale-95 ${isRunning
                ? "bg-blue-400 cursor-not-allowed shadow-none"
                : "bg-blue-600 hover:bg-blue-700 shadow-blue-200 shadow-lg"
                }`}
            >
              <Play size={18} fill="currentColor" />
              {isRunning ? "Executando..." : "Rodar Fluxo"}
            </button>
          </div>
        </header>
        <div className="flex-1 flex overflow-hidden">

          <aside className="w-64 border-r bg-white p-6 shadow-sm flex flex-col z-10 overflow-y-auto">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">
              Blocos Disponíveis
            </p>
            <div className="space-y-3 flex-1">
              <ToolboxItem
                icon="🌐"
                label="HTTP Request"
                type="http"
                onDragStart={onDragStart}
              />
              <ToolboxItem
                icon="✂️"
                label="CSS Selector"
                type="selector"
                onDragStart={onDragStart}
              />
              <ToolboxItem
                icon="⬇️"
                label="Exportar Dados"
                type="export"
                onDragStart={onDragStart}
              />
              <div className="pt-4 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-300">
                Navegação
              </div>
              <ToolboxItem
                icon="🖱️"
                label="Clicar Elemento"
                type="click"
                onDragStart={onDragStart}
              />
              <ToolboxItem
                icon="⌨️"
                label="Digitar Texto"
                type="input"
                onDragStart={onDragStart}
              />
              <ToolboxItem
                icon="⏱️"
                label="Delay"
                type="wait"
                onDragStart={onDragStart}
              />
            </div>
            <div className="mt-6 p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
                Arraste os blocos para o canvas.
              </p>
            </div>
          </aside>

          <main
            className="flex-1 relative"
            onDragOver={onDragOver}
            onDrop={onDrop}
          >
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              onNodeClick={onNodeClick}
              onPaneClick={onPaneClick}
              nodeTypes={nodeTypes}
              fitView
              deleteKeyCode={["Backspace", "Delete"]}
              className="bg-slate-50/50"
            >
              <Background color="#cbd5e1" gap={20} size={1} />
              <Controls />
              <MiniMap
                nodeStrokeColor={(n: any) => {
                  if (n.type === "http") return "#3b82f6";
                  if (n.type === "selector") return "#f59e0b";
                  if (n.type === "export") return "#10b981";
                  return "#1a192b";
                }}
                nodeColor={(n: any) => {
                  if (n.type === "http") return "#eff6ff";
                  if (n.type === "selector") return "#fef3c7";
                  if (n.type === "export") return "#d1fae5";
                  return "#fff";
                }}
                nodeBorderRadius={12}
              />
            </ReactFlow>
          </main>
          <PropertiesSidebar
            selectedNode={nodes.find((n) => n.id === selectedNodeId) || null}
            onUpdateNodeData={onUpdateNodeData}
            onDeleteNode={handleDeleteNode}
            onClose={() => setSelectedNodeId(null)}
          />
        </div>
      </div>
    </div>
  );
}

function ToolboxItem({ icon, label, type, onDragStart }: any) {
  return (
    <div
      className="group flex items-center gap-3 bg-white p-3.5 rounded-2xl border border-slate-200 cursor-grab hover:border-blue-400 hover:shadow-lg hover:shadow-blue-50 transition-all active:scale-95"
      onDragStart={(e) => onDragStart(e, type)}
      draggable
    >
      <span className="text-xl group-hover:scale-125 transition-transform">
        {icon}
      </span>
      <span className="text-xs font-bold text-slate-700">{label}</span>
    </div>
  );
}
