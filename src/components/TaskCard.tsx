"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Repeat, Copy, GripVertical } from "lucide-react";
import { Task } from "@/types";
import { getTextColor } from "@/lib/utils";

interface Props {
  task: Task;
  onClick: () => void;
  onCopy?: (task: Task) => void;
  compact?: boolean;
}

export default function TaskCard({ task, onClick, onCopy, compact = false }: Props) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  const textColor = getTextColor(task.color);

  if (compact) {
    return (
      <div
        ref={setNodeRef}
        style={{ ...style, background: task.color, color: textColor }}
        className="rounded-lg px-2 py-1 text-xs font-medium w-full group relative flex items-center gap-1"
      >
        {/* drag handle only */}
        <div
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-40 flex-shrink-0"
          style={{ color: textColor }}
          onPointerDown={e => e.stopPropagation()}
        >
          <GripVertical size={10} />
        </div>

        {/* clickable area */}
        <div className="flex-1 min-w-0 cursor-pointer" onClick={onClick}>
          {task.startTime && (
            <div style={{ color: textColor, opacity: 0.7 }} className="text-[10px] font-normal">
              {task.startTime}{task.endTime ? ` – ${task.endTime}` : ""}
            </div>
          )}
          <div className="truncate">{task.title}</div>
        </div>

        {onCopy && (
          <button
            className="opacity-0 group-hover:opacity-70 flex-shrink-0"
            style={{ color: textColor }}
            onClick={(e) => { e.stopPropagation(); onCopy(task); }}
            title="Copiar (Ctrl+C)"
          >
            <Copy size={9} />
          </button>
        )}
      </div>
    );
  }

  return (
    <div
      ref={setNodeRef}
      style={{ ...style, background: task.color, color: textColor }}
      className="rounded-xl flex items-stretch w-full group relative"
    >
      {/* drag handle */}
      <div
        {...attributes}
        {...listeners}
        className="flex items-center pl-2 cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-40 flex-shrink-0"
        style={{ color: textColor }}
      >
        <GripVertical size={13} />
      </div>

      {/* clickable content */}
      <div
        className="flex-1 py-2.5 pr-3 cursor-pointer min-w-0"
        onClick={onClick}
      >
        {(task.startTime || task.endTime) && (
          <div style={{ color: textColor, opacity: 0.7 }} className="text-[10px] font-normal mb-0.5">
            {task.startTime}{task.endTime ? ` – ${task.endTime}` : ""}
          </div>
        )}
        <p className="text-sm font-semibold truncate leading-tight">{task.title}</p>
        {task.repeat !== "NONE" && <Repeat size={9} className="mt-1 opacity-50" />}
      </div>

      {onCopy && (
        <button
          className="opacity-0 group-hover:opacity-60 pr-2 flex items-center flex-shrink-0"
          style={{ color: textColor }}
          onClick={(e) => { e.stopPropagation(); onCopy(task); }}
          title="Copiar"
        >
          <Copy size={10} />
        </button>
      )}
    </div>
  );
}