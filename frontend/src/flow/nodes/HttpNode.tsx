import { Handle, Position, NodeProps } from '@xyflow/react';
import { Globe } from 'lucide-react';

export function HttpNode({ data, selected }: NodeProps) {
  return (
    <div className={`flex items-center gap-3 rounded-xl border-2 bg-white px-4 py-3 shadow-md transition-all ${selected ? 'border-blue-500 shadow-lg' : 'border-slate-200'}`}>
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
        <Globe size={20} />
      </div>
      <div>
        <div className="font-semibold text-slate-800">
          {(data.label as string) || "Requisição HTTP"}
        </div>
        <div className="text-xs text-slate-500">
          {(() => {
            if (!data.url) return 'Sem URL configurada';
            try {
              return new URL(data.url as string).hostname;
            } catch (e) {
              return data.url as string; // Retorna texto cru caso URL invalida
            }
          })()}
        </div>
      </div>
      <Handle type="source" position={Position.Right} className="h-3 w-3 bg-blue-500" />
    </div>
  );
}
