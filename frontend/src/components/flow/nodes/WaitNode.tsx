import React from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { Clock } from 'lucide-react';

export function WaitNode({ data }: NodeProps) {
  return (
    <div className="flex min-w-[150px] items-center gap-3 rounded-lg border-2 border-slate-200 bg-white p-3 shadow-md transition-all hover:border-slate-400">
      <Handle type="target" position={Position.Left} className="h-3 w-3 bg-slate-500" />
      
      <div className="flex h-10 w-10 items-center justify-center rounded-md bg-slate-100 text-slate-600">
        <Clock size={20} />
      </div>
      
      <div>
        <div className="font-semibold text-slate-800">
          {(data.label as string) || "Aguardar"}
        </div>
        <div className="text-xs text-slate-500">
          {data.type === 'timeout' ? `${data.seconds || 1} segundos` : 'Elemento aparecer'}
        </div>
      </div>

      <Handle type="source" position={Position.Right} className="h-3 w-3 bg-slate-500" />
    </div>
  );
}
