"use client";
import { useEffect, useState, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  ArrowLeft,
  Download,
  Trash2,
  Calendar,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import Swal from "sweetalert2";
import api from "@/config/api";

interface ExecutionResult {
  id: number;
  status: string;
  created_at: string;
  error_message: string | null;
  data: any[];
}

export default function HistoryPage() {
  const router = useRouter();
  const { id } = useParams();
  const [results, setResults] = useState<ExecutionResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [workflowName, setWorkflowName] = useState("");
  const fetchHistory = useCallback(async () => {
    try {
      const wfRes = await api.get(`/workflows/${id}`);
      setWorkflowName(wfRes.data.name);
      const { data } = await api.get(`/workflows/${id}/results`);
      setResults(data);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [id]);
  useEffect(() => {
    if (!localStorage.getItem("access_token")) {
      router.push("/");
    } else {
      fetchHistory();
    }
  }, [router, fetchHistory]);
  const handleDownload = async (resultId: number, format: string) => {
    try {
      const response = await api.get(
        `/workflows/results/${resultId}/export?format=${format}`,
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
      Swal.fire("Erro!", "Não foi possível baixar o arquivo.", "error");
    }
  };
  const deleteResult = async (resultId: number) => {
    Swal.fire(
      "Aviso",
      "Funcionalidade de exclusão de histórico em desenvolvimento.",
      "info",
    );
  };

  return (
    <div className="p-4 md:p-10">
      <div className="mx-auto max-w-5xl">
        <div className="mb-10 flex items-center gap-6">
          <Link
            href="/dashboard/workflows"
            className="group p-3 bg-white hover:bg-blue-600 rounded-2xl transition-all shadow-sm border border-slate-200 hover:border-blue-500"
          >
            <ArrowLeft
              size={24}
              className="text-slate-500 group-hover:text-white transition-colors"
            />
          </Link>
          <div>
            <h1 className="text-3xl font-black text-slate-800 tracking-tight">
              Registro de Atividade
            </h1>
            <p className="text-slate-500 font-medium">
              Linhagem de dados para:{" "}
              <span className="text-blue-600 font-bold">
                {workflowName || "Workflow"}
              </span>
            </p>
          </div>
        </div>
        {loading ? (
          <div className="flex flex-col items-center justify-center p-20 gap-4">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-slate-100 border-b-blue-600"></div>
            <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">
              Carregando Histórico
            </p>
          </div>
        ) : results.length === 0 ? (
          <div className="bg-white rounded-3xl border-2 border-dashed border-slate-200 p-20 text-center shadow-sm">
            <p className="text-slate-500 font-medium">
              Este robô ainda não tem nenhuma execução registrada.
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            {results.map((res) => {
              const exportFormats = res.data
                .filter((item) => item.format)
                .map((item) => item.format.toLowerCase());
              const isSuccess = res.status === "success";
              return (
                <div
                  key={res.id}
                  className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm hover:shadow-lg transition-all duration-300"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-start gap-5">
                      <div
                        className={`mt-1 h-12 w-12 rounded-2xl flex items-center justify-center shadow-sm ${isSuccess ? "bg-emerald-50 text-emerald-600 border border-emerald-100" : "bg-rose-50 text-rose-600 border border-rose-100"}`}
                      >
                        {isSuccess ? (
                          <CheckCircle2 size={28} />
                        ) : (
                          <XCircle size={28} />
                        )}
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-3">
                          <span
                            className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${isSuccess ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"}`}
                          >
                            {isSuccess ? "Concluído" : "Falhou"}
                          </span>
                          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400">
                            <Calendar size={14} />
                            {new Date(res.created_at).toLocaleString()}
                          </div>
                        </div>
                        <p className="text-slate-800 font-bold text-sm">
                          Execução #{res.id}
                        </p>
                        {res.error_message && (
                          <div className="mt-2 p-3 bg-rose-50 rounded-xl border border-rose-100">
                            <p className="text-[11px] text-rose-600 font-mono leading-relaxed">
                              {res.error_message}
                            </p>
                          </div>
                        )}
                        {!res.error_message && exportFormats.length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-4">
                            {exportFormats.map((fmt) => (
                              <button
                                key={fmt}
                                onClick={() => handleDownload(res.id, fmt)}
                                className="flex items-center gap-2 px-4 py-2 bg-slate-50 hover:bg-blue-600 text-slate-600 hover:text-white border border-slate-200 hover:border-blue-600 rounded-xl text-xs font-black transition-all shadow-sm active:scale-95"
                              >
                                <Download size={14} />
                                {fmt.toUpperCase()}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => deleteResult(res.id)}
                      className="p-3 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all self-end md:self-center"
                      title="Remover Registro"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
