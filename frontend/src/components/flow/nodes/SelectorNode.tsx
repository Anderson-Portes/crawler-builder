import { Handle, Position, NodeProps } from '@xyflow/react';
import { Scissors } from 'lucide-react';

export function SelectorNode({ data, selected }: NodeProps) {
  return (
    <div className={`flex items-center gap-3 rounded-xl border-2 bg-white px-4 py-3 shadow-md transition-all ${selected ? 'border-amber-500 shadow-lg' : 'border-slate-200'}`}>
      <Handle type="target" position={Position.Left} className="h-3 w-3 bg-amber-500" />
      
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100 text-amber-600">
        <Scissors size={20} />
      </div>
      <div>
        <div className="font-semibold text-slate-800">
          {(data.label as string) || "Extrair Dados"}
        </div>
        <div className="text-[10px] uppercase font-bold text-slate-400">
          {(data.selector_type as string) || 'xpath'}
        </div>
        <div className="text-xs text-slate-500 truncate max-w-[120px]">
          {data.selector ? (data.selector as string) : 'Seletor vazio'}
        </div>
      </div>

      <Handle type="source" position={Position.Right} className="h-3 w-3 bg-amber-500" />
    </div>
  );
}
