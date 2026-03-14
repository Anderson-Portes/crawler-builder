"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Bot,
  LayoutDashboard,
  Globe,
  LogOut,
  ChevronRight,
} from "lucide-react";

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("user");
    router.push("/");
  };

  const menuItems = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Meus Robôs", href: "/dashboard/workflows", icon: Globe },
  ];

  const isActive = (path: string) => {
    if (path === "/dashboard") return pathname === "/dashboard";
    return pathname.startsWith(path);
  };

  return (
    <aside className="w-64 h-screen bg-white border-r border-slate-200 flex flex-col sticky top-0 shrink-0 shadow-[4px_0_24px_-15px_rgba(0,0,0,0.05)]">
      {}
      <div className="p-6">
        <Link href="/dashboard" className="flex items-center gap-3 group">
          <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-2.5 rounded-xl shadow-lg shadow-blue-200 group-hover:scale-110 transition-transform duration-300">
            <Bot size={24} className="text-white" />
          </div>
          <div className="flex flex-col">
            <span className="font-black text-xl tracking-tight text-slate-800 leading-none">
              Crawler Builder
            </span>
          </div>
        </Link>
      </div>
      {}
      <nav className="flex-1 px-4 py-4 space-y-1">
        <div className="pb-4 px-2">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2 mb-2">
            Principal
          </p>
        </div>
        {menuItems.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 group ${
                active
                  ? "bg-blue-50 text-blue-600"
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
              }`}
            >
              <div className="flex items-center gap-3">
                <item.icon
                  size={20}
                  className={
                    active
                      ? "text-blue-600"
                      : "text-slate-400 group-hover:text-slate-600"
                  }
                />
                <span className="text-sm font-bold">{item.name}</span>
              </div>
              {active && <ChevronRight size={16} className="text-blue-300" />}
            </Link>
          );
        })}
      </nav>
      {}
      <div className="p-4 border-t border-slate-100">
        <div className="bg-slate-50 rounded-2xl p-4 mb-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold border-2 border-white shadow-sm">
              U
            </div>
            <div className="flex flex-col overflow-hidden">
              <span className="text-sm font-bold text-slate-800 truncate">
                {user.email}
              </span>
              <span className="text-[10px] text-slate-400 truncate">
                Sessão Ativa
              </span>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-600 hover:text-red-600 hover:border-red-100 hover:bg-red-50 transition-all shadow-sm"
          >
            <LogOut size={14} />
            Sair do App
          </button>
        </div>
      </div>
    </aside>
  );
}
