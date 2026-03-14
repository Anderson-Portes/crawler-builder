import React from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { MousePointerClick } from 'lucide-react';

export function ClickNode({ data }: NodeProps) {
  return (
    <div className="flex min-w-[150px] items-center gap-3 rounded-lg border-2 border-slate-200 bg-white p-3 shadow-md transition-all hover:border-blue-400">
      <Handle type="target" position={Position.Left} className="h-3 w-3 bg-blue-500" />
      
      <div className="flex h-10 w-10 items-center justify-center rounded-md bg-blue-100 text-blue-600">
        <MousePointerClick size={20} />
      </div>
      
      <div>
        <div className="font-semibold text-slate-800">
          {(data.label as string) || "Clicar em"}
        </div>
        <div className="text-[10px] uppercase font-bold text-slate-400">
          {(data.selector_type as string) || 'css'}
        </div>
        <div className="text-xs text-slate-500 truncate max-w-[120px]">
          {data.selector ? (data.selector as string) : 'Seletor vazio'}
        </div>
      </div>

      <Handle type="source" position={Position.Right} className="h-3 w-3 bg-blue-500" />
    </div>
  );
}
