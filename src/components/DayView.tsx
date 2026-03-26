"use client";

import { useMemo } from "react";
import {
  DndContext, closestCenter, DragEndEvent,
  MouseSensor, TouchSensor, useSensor, useSensors,
} from "@dnd-kit/core";
import {
  SortableContext, verticalListSortingStrategy, arrayMove,
} from "@dnd-kit/sortable";
import { format, parseISO, isSameDay } from "date-fns";
import { Task } from "@/types";
import TaskCard from "./TaskCard";
import { MONTHS_PT } from "@/lib/utils";
import { ClipboardPaste, Plus } from "lucide-react";

const HOURS = Array.from({ length: 16 }, (_, i) => i + 7);

interface Props {
  tasks: Task[];
  currentDate: Date;
  onTaskClick: (task: Task) => void;
  onReorder: (items: { id: string; position: number }[]) => void;
  copiedTask?: Task | null;
  onCopyTask?: (task: Task) => void;
  onPasteTask?: (date: Date) => void;
  onNewTask?: (date: Date) => void;
}

export default function DayView({
  tasks, currentDate, onTaskClick, onReorder,
  copiedTask, onCopyTask, onPasteTask, onNewTask,
}: Props) {
  const dayTasks = useMemo(
    () => tasks
      .filter((t) => isSameDay(parseISO(t.date), currentDate))
      .sort((a, b) => {
        if (a.allDay && !b.allDay) return -1;
        if (!a.allDay && b.allDay) return 1;
        return (a.startTime || "").localeCompare(b.startTime || "");
      }),
    [tasks, currentDate]
  );

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { delay: 200, tolerance: 6 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 8 } }),
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = dayTasks.findIndex((t) => t.id === active.id);
    const newIndex = dayTasks.findIndex((t) => t.id === over.id);
    const reordered = arrayMove(dayTasks, oldIndex, newIndex);
    onReorder(reordered.map((t, i) => ({ id: t.id, position: i })));
  };

  const d = currentDate;

  return (
    <div className="flex-1 overflow-auto" style={{ background: "var(--bg)" }}>
      {/* Header */}
      <div
        className="sticky top-0 z-10 px-5 py-3 flex items-center justify-between"
        style={{ background: "var(--bg-card)", borderBottom: "1px solid var(--border)" }}
      >
        <div>
          <p className="text-xl font-bold" style={{ color: "var(--text)" }}>
            {format(d, "d")}{" "}
            <span className="font-light" style={{ color: "var(--text-muted)" }}>
              de {MONTHS_PT[d.getMonth()]}
            </span>
          </p>
          <p className="text-xs" style={{ color: "var(--text-faint)" }}>
            {dayTasks.length} tarefa{dayTasks.length !== 1 && "s"}
          </p>
        </div>
        <div className="flex gap-2">
          {onNewTask && (
            <button
              onClick={() => onNewTask(d)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium"
              style={{ background: "var(--bg-hover)", color: "var(--text-muted)" }}
            >
              <Plus size={12} /> Nova
            </button>
          )}
          {copiedTask && onPasteTask && (
            <button
              onClick={() => onPasteTask(d)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium"
              style={{ background: "var(--accent-muted)", color: "var(--accent)" }}
            >
              <ClipboardPaste size={12} /> Colar "{copiedTask.title}"
            </button>
          )}
        </div>
      </div>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <div className="flex">
          {/* Hours */}
          <div className="w-14 flex-shrink-0">
            {HOURS.map((h) => (
              <div key={h} className="h-16 border-b px-2 flex items-start pt-1.5"
                style={{ borderColor: "var(--border)" }}>
                <span className="text-[10px]" style={{ color: "var(--text-faint)" }}>{h}:00</span>
              </div>
            ))}
          </div>

          {/* Tasks */}
          <div className="flex-1 relative">
            {HOURS.map((h) => (
              <div key={h} className="h-16 border-b" style={{ borderColor: "var(--border)" }} />
            ))}
            <div className="absolute inset-0 p-1.5">
              <SortableContext items={dayTasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
                <div className="space-y-1.5">
                  {dayTasks.map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      onClick={() => onTaskClick(task)}
                      onCopy={onCopyTask}
                    />
                  ))}
                </div>
              </SortableContext>
            </div>
          </div>
        </div>
      </DndContext>
    </div>
  );
}