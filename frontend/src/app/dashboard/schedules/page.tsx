"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Clock, CalendarClock, X, Check, Search } from "lucide-react";
import Swal from "sweetalert2";
import api from "@/lib/api";

interface Workflow {
  id: number;
  name: string;
  is_scheduled: boolean;
  schedule_interval: number | null;
  last_run: string | null;
  next_run: string | null;
}

export default function SchedulesPage() {
  const router = useRouter();
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // Modal State
  const [selectedWf, setSelectedWf] = useState<Workflow | null>(null);
  const [isScheduled, setIsScheduled] = useState(false);
  const [intervalMinutes, setIntervalMinutes] = useState<number>(60);
  const [saving, setSaving] = useState(false);

  const fetchWorkflows = async () => {
    try {
      const { data } = await api.get("/workflows/");
      setWorkflows(data);
    } catch (err: any) {
      if (err.response?.status === 401) router.push("/");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkflows();
  }, []);

  const openScheduleModal = (wf: Workflow) => {
    setSelectedWf(wf);
    setIsScheduled(wf.is_scheduled || false);
    setIntervalMinutes(wf.schedule_interval || 60);
  };

  const saveSchedule = async () => {
    if (!selectedWf) return;
    setSaving(true);
    try {
      await api.patch(`/workflows/${selectedWf.id}`, {
        is_scheduled: isScheduled,
        schedule_interval: intervalMinutes,
      });
      Swal.fire({
        toast: true,
        position: 'top-end',
        title: "Agendamento salvo!",
        icon: "success",
        showConfirmButton: false,
        timer: 3000
      });
      setSelectedWf(null);
      fetchWorkflows();
    } catch (err) {
      console.error(err);
      Swal.fire("Erro!", "Não foi possível salvar o agendamento.", "error");
    } finally {
      setSaving(false);
    }
  };

  const filteredWorkflows = workflows.filter((wf) =>
    wf.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="p-4 md:p-10 relative">
      <div className="mx-auto max-w-6xl">
        <div className="mb-10 flex flex-col gap-2">
          <h1 className="text-4xl font-black text-slate-800 tracking-tight flex items-center gap-3">
            <CalendarClock size={36} className="text-blue-600" /> Agendamentos
          </h1>
          <p className="text-slate-500 font-medium">
            Configure a frequência em que seus robôs devem rodar automaticamente (em background).
          </p>
        </div>

        <div className="mb-8 relative max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Buscar robô por nome..."
            className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {loading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-48 rounded-2xl bg-slate-100 animate-pulse"></div>
            ))}
          </div>
        ) : filteredWorkflows.length === 0 ? (
          <div className="rounded-3xl border-2 border-dashed border-slate-200 bg-white p-16 text-center text-slate-500 font-medium shadow-sm">
            Tente buscar com outro termo ou crie um robô primeiro.
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredWorkflows.map((wf) => (
              <div
                key={wf.id}
                className={`group flex flex-col justify-between rounded-3xl border-2 transition-all duration-300 shadow-sm overflow-hidden ${wf.is_scheduled ? 'border-blue-200 bg-blue-50/10' : 'border-slate-200 bg-white hover:border-blue-100'
                  }`}
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className={`p-3 rounded-2xl transition-colors ${wf.is_scheduled ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-400'}`}>
                      <Clock size={24} />
                    </div>
                    {wf.is_scheduled ? (
                      <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest bg-blue-100 px-3 py-1.5 rounded-md flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></span>
                        Ativo
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest bg-slate-100 px-3 py-1.5 rounded-md flex items-center gap-1">
                        Pausado
                      </span>
                    )}
                  </div>
                  <h3 className="mb-2 text-xl font-black text-slate-800 truncate" title={wf.name}>
                    {wf.name}
                  </h3>

                  {wf.is_scheduled ? (
                    <div className="space-y-1 mt-4">
                      <p className="text-sm font-semibold text-slate-600">Rodando a cada {wf.schedule_interval} minutos</p>
                      <p className="text-xs text-slate-500">Próxima: <span className="font-bold text-slate-700">{wf.next_run ? new Date(wf.next_run).toLocaleString() : 'Calculando...'}</span></p>
                    </div>
                  ) : (
                    <p className="text-sm text-slate-500 font-medium mt-4">Este robô só roda manualmente.</p>
                  )}
                </div>

                <div className="bg-slate-50/50 p-4 border-t border-slate-100 flex">
                  <button
                    onClick={() => openScheduleModal(wf)}
                    className={`w-full py-2.5 rounded-xl text-sm font-bold shadow-sm transition-all ${wf.is_scheduled
                        ? 'bg-white border-2 border-slate-200 text-slate-600 hover:border-blue-300 hover:text-blue-600'
                        : 'bg-blue-600 border-2 border-blue-600 text-white hover:bg-blue-700'
                      }`}
                  >
                    {wf.is_scheduled ? 'Editar Agenda' : 'Criar Agenda'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedWf && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-xl font-black text-slate-800">🗓️ Agendar Robô</h2>
              <button
                onClick={() => setSelectedWf(null)}
                className="p-2 text-slate-400 hover:bg-slate-100 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div>
                <p className="text-sm font-bold text-slate-500 mb-1">Robô Selecionado</p>
                <p className="text-lg font-black text-slate-800 truncate">{selectedWf.name}</p>
              </div>

              <div className="flex items-center justify-between p-4 rounded-2xl border-2 border-slate-100">
                <div>
                  <p className="font-bold text-slate-700">Ativar Agendamento</p>
                  <p className="text-xs text-slate-500 font-medium">Permitir execução automática.</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={isScheduled}
                    onChange={(e) => setIsScheduled(e.target.checked)}
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              {isScheduled && (
                <div className="space-y-3 animate-in fade-in slide-in-from-top-4">
                  <label className="block text-sm font-bold text-slate-700">
                    Intervalo de Execução (em minutos)
                  </label>
                  <input
                    type="number"
                    min="1"
                    className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 bg-white font-medium focus:border-blue-500 focus:outline-none transition-colors"
                    value={intervalMinutes}
                    onChange={(e) => setIntervalMinutes(Number(e.target.value))}
                  />
                  <p className="text-xs text-slate-500 flex items-center gap-1 font-medium">
                    <Clock size={12} /> O robô rodará exatamente a cada {intervalMinutes || 0} minutos.
                  </p>
                </div>
              )}
            </div>

            <div className="p-6 bg-slate-50 border-t border-slate-100 flex gap-3">
              <button
                onClick={() => setSelectedWf(null)}
                className="flex-1 py-3 text-sm font-bold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-100 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={saveSchedule}
                disabled={saving || (isScheduled && (!intervalMinutes || intervalMinutes < 1))}
                className="flex-1 py-3 text-sm font-black text-white bg-blue-600 rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-blue-200 transition-all flex items-center justify-center gap-2"
              >
                {saving ? 'Salvando...' : <><Check size={18} /> Salvar Agenda</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
