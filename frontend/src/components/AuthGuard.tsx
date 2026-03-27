"use client";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import api from "@/lib/api";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("access_token");
      if (!token) {
        if (pathname !== "/") router.push("/");
        return;
      }

      try {
        const { data } = await api.get("/auth/me");
        localStorage.setItem("user", JSON.stringify(data));
        setIsAuthorized(true);
      } catch (err) {
        localStorage.removeItem("access_token");
        localStorage.removeItem("user");
        router.push("/");
      }
    };

    checkAuth();
  }, [router, pathname]);

  if (!isAuthorized) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600"></div>
          <p className="text-sm font-semibold tracking-wide text-slate-500 uppercase">Verificando acesso...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
