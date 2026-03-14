"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Plus } from "lucide-react";
import { StatsDashboard } from "@/components/StatsDashboard";

export default function DashboardPage() {
  const router = useRouter();
  useEffect(() => {
    if (!localStorage.getItem("access_token")) {
      router.push("/");
    }
  }, [router]);
  return (
    <div className="p-4 md:p-10">
      <div className="mx-auto max-w-6xl">
        <div className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-black text-slate-800 tracking-tight">
              Centro de Comando
            </h1>
            <p className="text-slate-500 font-medium mt-1">
              Monitoramento em tempo real dos seus robôs.
            </p>
          </div>
          <Link
            href="/dashboard/workflows"
            className="flex items-center justify-center gap-2 rounded-2xl bg-blue-600 px-8 py-4 text-sm font-bold text-white shadow-xl shadow-blue-200 transition-all hover:bg-blue-700 hover:scale-[1.02] active:scale-[0.98]"
          >
            <Plus size={20} />
            Gerenciar Meus Robôs
          </Link>
        </div>
        <StatsDashboard />
      </div>
    </div>
  );
}
