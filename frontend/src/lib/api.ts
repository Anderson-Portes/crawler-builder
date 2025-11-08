export async function fetchWorkflows() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/workflows`);
  if (!res.ok) throw new Error('Erro ao carregar workflows');
  return res.json();
}

export async function createWorkflow(data: { name: string }) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/workflows`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Erro ao criar workflow');
  return res.json();
}

export async function fetchWorkflow(id: string) {
  console.log(`${process.env.NEXT_PUBLIC_API_URL}/workflows/${id}`)
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/workflows/${id}`);
  if (!res.ok) throw new Error('Erro ao carregar workflow');
  return res.json();
}

// -------- Nodes --------
export interface CreateNodePayload {
  workflowId: number;
  type: string; // obrigatório
  config?: {
    label: string;
    x: number;
    y: number;
    [key: string]: any;
  };
}

export async function createNode(payload: CreateNodePayload) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/nodes`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Erro ao criar node");
  return res.json();
}

export interface UpdateNodePayload {
  type: string;
  config?: {
    label: string;
    x: number;
    y: number;
    [key: string]: any;
  };
}

export async function updateNode(nodeId: number, payload: UpdateNodePayload) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/nodes/${nodeId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Erro ao atualizar node");
  return res.json();
}

export async function deleteNode(id: number) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/nodes/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Erro ao deletar node');
}

// -------- Connections --------
export async function createConnection(data: { workflowId: number; sourceNodeId: number; targetNodeId: number }) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/connections`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Erro ao criar connection');
  return res.json();
}

export async function updateConnection(id: number, data: { sourceNodeId: number; targetNodeId: number }) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/connections/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Erro ao atualizar connection');
  return res.json();
}

export async function deleteConnection(id: number) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/connections/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Erro ao deletar connection');
}
