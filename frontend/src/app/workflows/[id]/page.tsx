import WorkflowBuilder from "@/components/WorkflowBuilder";
interface Props {
  params: Promise<{ id: string }>;
}

export default async function WorkflowPage({ params }: Props) {
  const workflowId = (await params).id;

  return (
    <main className="p-4">
      <h1 className="text-2xl font-bold mb-4">Workflow Builder</h1>
      <WorkflowBuilder workflowId={workflowId} />
    </main>
  );
}
