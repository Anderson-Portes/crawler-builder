"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Plus, Pencil, Trash2, History, Search, Bot } from "lucide-react";
import Swal from "sweetalert2";
import api from "@/lib/api";

interface Workflow {
  id: number;
  name: string;
  description: string;
  updated_at: string;
}

export default function WorkflowsPage() {
  const router = useRouter();
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const fetchWorkflows = async () => {
    try {
      const { data } = await api.get("/workflows/");
      setWorkflows(data);
    } catch (err: any) {
      if (err.response?.status === 401) {
        router.push("/");
      }
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchWorkflows();
  }, []);
  const createWorkflow = async () => {
    try {
      const { data } = await api.post("/workflows/", {
        name: "Novo Fluxo de Scraping",
      });
      router.push(`/editor/${data.id}`);
    } catch (err) {
      console.error(err);
      Swal.fire("Erro!", "Não foi possível criar o fluxo.", "error");
    }
  };
  const deleteWorkflow = async (id: number) => {
    const result = await Swal.fire({
      title: "Tem certeza?",
      text: "Você não poderá reverter a exclusão deste fluxo!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#2563eb",
      cancelButtonColor: "#ef4444",
      confirmButtonText: "Sim, apagar!",
      cancelButtonText: "Cancelar",
    });
    if (!result.isConfirmed) return;
    try {
      await api.delete(`/workflows/${id}`);
      fetchWorkflows();
      Swal.fire("Apagado!", "Seu fluxo foi excluído.", "success");
    } catch (err) {
      console.error(err);
      Swal.fire("Erro!", "Houve um problema ao excluir o fluxo.", "error");
    }
  };
  const filteredWorkflows = workflows.filter((wf) =>
    wf.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="p-4 md:p-10">
      <div className="mx-auto max-w-6xl">
        <div className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-black text-slate-800 tracking-tight">
              Meus Robôs
            </h1>
            <p className="text-slate-500 font-medium mt-1">
              Gerencie e turbine suas automações.
            </p>
          </div>
          <button
            onClick={createWorkflow}
            className="flex items-center justify-center gap-2 rounded-2xl bg-blue-600 px-8 py-4 text-sm font-bold text-white shadow-xl shadow-blue-200 transition-all hover:bg-blue-700 hover:scale-[1.02] active:scale-[0.98]"
          >
            <Plus size={20} />
            Novo Robô de Scraping
          </button>
        </div>
        <div className="mb-8 relative max-w-md">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            size={18}
          />
          <input
            type="text"
            placeholder="Buscar por nome..."
            className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        {loading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-48 rounded-2xl bg-slate-100 animate-pulse"
              ></div>
            ))}
          </div>
        ) : filteredWorkflows.length === 0 ? (
          <div className="rounded-3xl border-2 border-dashed border-slate-200 bg-white p-16 text-center shadow-sm">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 shadow-inner">
              <Plus size={40} />
            </div>
            <h3 className="mb-2 text-2xl font-black text-slate-900">
              {searchTerm
                ? "Nenhum resultado encontrado"
                : "Hora de criar seu primeiro robô!"}
            </h3>
            <p className="mb-8 text-slate-500 font-medium max-w-sm mx-auto">
              {searchTerm
                ? "Tente buscar com outro termo."
                : "Construa robôs inteligentes que coletam dados para você em segundos."}
            </p>
            {!searchTerm && (
              <button
                onClick={createWorkflow}
                className="rounded-xl bg-blue-600 px-10 py-4 text-sm font-black text-white shadow-lg hover:bg-blue-700 transition-all active:scale-95"
              >
                Começar Agora
              </button>
            )}
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredWorkflows.map((wf) => (
              <div
                key={wf.id}
                className="group flex flex-col justify-between rounded-3xl border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-1 overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="bg-slate-50 p-3 rounded-2xl text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-500 transition-colors">
                      <Bot size={24} />
                    </div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-50 px-2 py-1 rounded-md">
                      ID: #{wf.id}
                    </span>
                  </div>
                  <h3
                    className="mb-2 text-xl font-black text-slate-800 truncate"
                    title={wf.name}
                  >
                    {wf.name}
                  </h3>
                  <p className="text-sm text-slate-500 font-medium line-clamp-2">
                    {wf.description ||
                      "Este robô ainda não tem uma descrição. Adicione uma no editor!"}
                  </p>
                </div>
                <div className="flex items-center justify-between bg-slate-50/50 p-5 px-6 border-t border-slate-100">
                  <div className="flex flex-col">
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-tighter">
                      Última edicão
                    </span>
                    <span className="text-xs font-bold text-slate-600">
                      {new Date(wf.updated_at).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex gap-1.5">
                    <Link
                      href={`/editor/${wf.id}`}
                      className="rounded-xl p-2.5 text-slate-500 bg-white border border-slate-200 hover:border-blue-200 hover:text-blue-600 hover:bg-blue-50 transition-all shadow-sm"
                      title="Editar Robô"
                    >
                      <Pencil size={18} />
                    </Link>
                    <Link
                      href={`/dashboard/history/${wf.id}`}
                      className="rounded-xl p-2.5 text-slate-500 bg-white border border-slate-200 hover:border-purple-200 hover:text-purple-600 hover:bg-purple-50 transition-all shadow-sm"
                      title="Ver Histórico"
                    >
                      <History size={18} />
                    </Link>
                    <button
                      onClick={() => deleteWorkflow(wf.id)}
                      className="rounded-xl p-2.5 text-slate-500 bg-white border border-slate-200 hover:border-red-200 hover:text-red-600 hover:bg-red-50 transition-all shadow-sm"
                      title="Excluir"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
