"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { fetchWorkflows } from "@/lib/api";

export default function WorkflowsPage() {
  const [workflows, setWorkflows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const data = await fetchWorkflows();
        setWorkflows(data);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <div className="p-4">Carregando workflows...</div>;

  return (
    <main className="p-4">
      <h1 className="text-2xl font-bold mb-4">Meus Workflows</h1>
      <Link
        href="/workflows/new"
        className="mb-4 inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        Criar Workflow
      </Link>
      <ul className="space-y-2">
        {workflows.map((wf) => (
          <li
            key={wf.id}
            className="p-4 bg-white rounded shadow flex justify-between items-center"
          >
            <span>{wf.name}</span>
            <Link
              href={`/workflows/${wf.id}`}
              className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600"
            >
              Editar
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
