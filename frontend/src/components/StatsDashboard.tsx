"use client";
import React, { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend,
} from "recharts";
import {
  LayoutGrid,
  PlayCircle,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import api from "@/config/api";

interface StatsData {
  total_workflows: number;
  total_runs: number;
  success_rate: number;
  status_data: { name: string; value: number; color: string }[];
  daily_data: {
    date: string;
    total: number;
    success: number;
    failure: number;
  }[];
  top_workflows: { name: string; runs: number }[];
}

export function StatsDashboard() {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await api.get("/workflows/stats");
        setStats(data);
      } catch (err) {
        console.error("Erro ao buscar estatísticas:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading)
    return (
      <div className="animate-pulse bg-slate-100 h-64 rounded-xl mb-8"></div>
    );
  if (!stats) return null;
  return (
    <div className="space-y-6 mb-10">
      {}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard
          title="Total de Fluxos"
          value={stats.total_workflows}
          icon={<LayoutGrid className="text-blue-500" />}
          gradient="from-blue-500/10 to-blue-600/5"
        />
        <StatCard
          title="Total de Runs"
          value={stats.total_runs}
          icon={<PlayCircle className="text-purple-500" />}
          gradient="from-purple-500/10 to-purple-600/5"
        />
        <StatCard
          title="Taxa de Sucesso"
          value={`${stats.success_rate}%`}
          icon={<CheckCircle2 className="text-emerald-500" />}
          gradient="from-emerald-500/10 to-emerald-600/5"
        />
        <StatCard
          title="Total de Falhas"
          value={stats.status_data.find((s) => s.name === "Falhas")?.value || 0}
          icon={<AlertCircle className="text-rose-500" />}
          gradient="from-rose-500/10 to-rose-600/5"
        />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-6">
            Atividade Semanal
          </h3>
          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={stats.daily_data}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#f1f5f9"
                />
                <XAxis
                  dataKey="date"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#94a3b8", fontSize: 12 }}
                  dy={10}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#94a3b8", fontSize: 12 }}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: "12px",
                    border: "none",
                    boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
                  }}
                />
                <Legend iconType="circle" />
                <Line
                  type="monotone"
                  dataKey="success"
                  name="Sucesso"
                  stroke="#10b981"
                  strokeWidth={3}
                  dot={{ r: 4, strokeWidth: 2 }}
                  activeDot={{ r: 6 }}
                />
                <Line
                  type="monotone"
                  dataKey="failure"
                  name="Falhas"
                  stroke="#ef4444"
                  strokeWidth={3}
                  dot={{ r: 4, strokeWidth: 2 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
        {}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col">
          <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">
            Saúde dos Robôs
          </h3>
          <div className="flex-1 h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats.status_data}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {stats.status_data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend verticalAlign="bottom" height={36} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      {}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-6">
          Workflows Mais Ativos
        </h3>
        <div className="h-[200px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={stats.top_workflows} layout="vertical">
              <XAxis type="number" hide />
              <YAxis
                dataKey="name"
                type="category"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#475569", fontSize: 12 }}
                width={150}
              />
              <Tooltip cursor={{ fill: "#f8fafc" }} />
              <Bar
                dataKey="runs"
                fill="#6366f1"
                radius={[0, 4, 4, 0]}
                barSize={20}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  icon,
  gradient,
}: {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  gradient: string;
}) {
  return (
    <div
      className={`bg-white border border-slate-200 rounded-2xl p-5 shadow-sm overflow-hidden relative group`}
    >
      <div
        className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-50`}
      ></div>
      <div className="relative flex items-center justify-between">
        <div>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">
            {title}
          </p>
          <p className="text-2xl font-black text-slate-800">{value}</p>
        </div>
        <div className="p-3 bg-white rounded-xl shadow-sm border border-slate-100">
          {icon}
        </div>
      </div>
    </div>
  );
}
