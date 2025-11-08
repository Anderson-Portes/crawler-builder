"use client";

import { Handle, Position, NodeProps } from "reactflow";
import { useState } from "react";

interface CustomNodeData {
  label: string;
  onDelete: (id: string) => void;
  onRename: (id: string, newLabel: string) => void;
}

export function CustomNode({ id, data }: NodeProps<CustomNodeData>) {
  const [editing, setEditing] = useState(false);
  const [tempLabel, setTempLabel] = useState(data.label);

  const handleRename = () => {
    data.onRename(id, tempLabel);
    setEditing(false);
  };

  return (
    <div className="bg-white p-2 rounded shadow flex flex-col items-center">
      <Handle type="target" position={Position.Top} />

      <div className="flex items-center gap-1">
        {editing ? (
          <input
            className="border px-1 rounded text-sm"
            value={tempLabel}
            autoFocus
            onChange={(e) => setTempLabel(e.target.value)}
            onBlur={handleRename}
            onKeyDown={(e) => e.key === "Enter" && handleRename()}
          />
        ) : (
          <span
            className="cursor-pointer"
            onClick={() => setEditing(true)}
            title="Clique para renomear"
          >
            {data.label}
          </span>
        )}

        <button
          onClick={() => data.onDelete(id)}
          className="ml-1 text-red-600 hover:text-red-800"
          title="Deletar Node"
        >
          🗑️
        </button>
      </div>

      <Handle type="source" position={Position.Bottom} />
    </div>
  );
}
