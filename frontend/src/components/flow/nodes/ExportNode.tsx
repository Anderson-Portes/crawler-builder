import { Handle, Position, NodeProps } from '@xyflow/react';
import { Download } from 'lucide-react';

export function ExportNode({ data, selected }: NodeProps) {
  return (
    <div className={`flex items-center gap-3 rounded-xl border-2 bg-white px-4 py-3 shadow-md transition-all ${selected ? 'border-emerald-500 shadow-lg' : 'border-slate-200'}`}>
      <Handle type="target" position={Position.Left} className="h-3 w-3 bg-emerald-500" />
      
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600">
        <Download size={20} />
      </div>
      <div>
        <div className="font-semibold text-slate-800">
          {(data.label as string) || "Exportar Dados"}
        </div>
        <div className="text-xs text-slate-500">{data.format ? `Formato: ${data.format}` : 'Selecione um formato'}</div>
      </div>
    </div>
  );
}
