"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import api from "@/lib/api";

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const router = useRouter();

  useEffect(() => {
    if (localStorage.getItem("access_token")) {
      router.push("/dashboard");
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      if (isLogin) {
        const { data } = await api.post("/auth/login", { email, password });
        localStorage.setItem("access_token", data.access_token);
        localStorage.setItem("user", JSON.stringify(data.user));
        router.push("/dashboard");
      } else {
        await api.post("/auth/register", { email, password });
        setIsLogin(true);
        setSuccess("Conta criada com sucesso! Você já pode fazer o login.");
        setPassword("");
      }
    } catch (err: any) {
      setError(err.response?.data?.error || "Erro ao processar!");
    }
  };

  return (
    <div className="flex h-screen items-center justify-center bg-slate-100">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl">
        <h1 className="mb-6 text-2xl font-bold text-center text-slate-800">
          {isLogin ? "Bem vindos ao CrawlerBuilder" : "Crie sua conta"}
        </h1>
        {success && (
          <div className="mb-4 rounded bg-green-100 p-3 text-sm text-green-700">
            {success}
          </div>
        )}
        {error && (
          <div className="mb-4 rounded bg-red-100 p-3 text-sm text-red-700">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-600">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full rounded-md border border-slate-300 p-2 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-600">
              Senha
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full rounded-md border border-slate-300 p-2 pr-10 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
          <button
            type="submit"
            className="mt-2 rounded-md bg-blue-600 py-2 px-4 font-semibold text-white transition hover:bg-blue-700"
          >
            {isLogin ? "Entrar" : "Registrar"}
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-slate-500">
          {isLogin ? "Não tem conta?" : "Já possui conta?"}{" "}
          <button
            onClick={() => {
              setIsLogin(!isLogin);
              setError("");
              setSuccess("");
            }}
            type="button"
            className="text-blue-600 hover:underline"
          >
            {isLogin ? "Registre-se" : "Entre aqui"}
          </button>
        </p>
      </div>
    </div>
  );
}
