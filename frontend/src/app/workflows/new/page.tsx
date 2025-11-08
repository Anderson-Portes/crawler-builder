"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { createWorkflow } from "@/lib/api";

export default function NewWorkflowPage() {
  const [name, setName] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const wf = await createWorkflow({ name });
    router.push(`/workflows/${wf.id}`);
  };

  return (
    <main className="p-4">
      <h1 className="text-2xl font-bold mb-4">Criar Workflow</h1>
      <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
        <div>
          <label className="block mb-1 font-semibold">Nome</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full px-3 py-2 border rounded"
          />
        </div>
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Criar
        </button>
      </form>
    </main>
  );
}
