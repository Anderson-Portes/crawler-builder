"use client";
import { Sidebar } from "@/components/Sidebar";
import { AuthGuard } from "@/components/AuthGuard";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
      <div className="flex h-screen bg-slate-50 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-auto relative">{children}</main>
      </div>
    </AuthGuard>
  );
}
