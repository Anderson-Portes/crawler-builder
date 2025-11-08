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
export async function createNode(data: { workflowId: number; x: number; y: number; label: string }) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/nodes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Erro ao criar node');
  return res.json();
}

export async function updateNode(id: number, data: { x: number; y: number; label: string }) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/nodes/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Erro ao atualizar node');
  return res.json();
}

export async function deleteNode(id: number) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/nodes/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Erro ao deletar node');
}

// -------- Connections --------
export async function createConnection(data: { workflowId: number; sourceNodeId: string; targetNodeId: string }) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/connections`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Erro ao criar connection');
  return res.json();
}

export async function updateConnection(id: string, data: { sourceNodeId: string; targetNodeId: string }) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/connections/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Erro ao atualizar connection');
  return res.json();
}

export async function deleteConnection(id: string) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/connections/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Erro ao deletar connection');
}
