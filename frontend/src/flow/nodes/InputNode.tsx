import React from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { Type } from 'lucide-react';

export function InputNode({ data }: NodeProps) {
  return (
    <div className="flex min-w-[150px] items-center gap-3 rounded-lg border-2 border-slate-200 bg-white p-3 shadow-md transition-all hover:border-indigo-400">
      <Handle type="target" position={Position.Left} className="h-3 w-3 bg-indigo-500" />
      
      <div className="flex h-10 w-10 items-center justify-center rounded-md bg-indigo-100 text-indigo-600">
        <Type size={20} />
      </div>
      
      <div>
        <div className="font-semibold text-slate-800">
          {(data.label as string) || "Digitar Valor"}
        </div>
        <div className="text-[10px] uppercase font-bold text-slate-400">
          {(data.selector_type as string) || 'css'}
        </div>
        <div className="text-xs text-slate-500 truncate max-w-[120px]">
          {data.value ? `"${data.value}"` : 'Sem valor'}
        </div>
      </div>

      <Handle type="source" position={Position.Right} className="h-3 w-3 bg-indigo-500" />
    </div>
  );
}
