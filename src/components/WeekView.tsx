"use client";

import { useMemo } from "react";
import {
  startOfWeek, endOfWeek, eachDayOfInterval,
  isSameDay, format, parseISO,
} from "date-fns";
import {
  DndContext, closestCenter, DragEndEvent,
  MouseSensor, TouchSensor, useSensor, useSensors,
} from "@dnd-kit/core";
import {
  SortableContext, verticalListSortingStrategy, arrayMove,
} from "@dnd-kit/sortable";
import { Task } from "@/types";
import TaskCard from "./TaskCard";
import { DAYS_PT, cn } from "@/lib/utils";
import { ClipboardPaste, Plus } from "lucide-react";

const HOURS = Array.from({ length: 16 }, (_, i) => i + 7);

interface Props {
  tasks: Task[];
  currentDate: Date;
  onTaskClick: (task: Task) => void;
  onDayClick: (date: Date) => void;
  onReorder: (items: { id: string; position: number }[]) => void;
  copiedTask?: Task | null;
  onCopyTask?: (task: Task) => void;
  onPasteTask?: (date: Date) => void;
  onNewTask?: (date: Date) => void;
}

export default function WeekView({
  tasks, currentDate, onTaskClick, onDayClick, onReorder,
  copiedTask, onCopyTask, onPasteTask, onNewTask,
}: Props) {
  const days = useMemo(
    () => eachDayOfInterval({
      start: startOfWeek(currentDate, { weekStartsOn: 0 }),
      end: endOfWeek(currentDate, { weekStartsOn: 0 }),
    }),
    [currentDate]
  );

  // MouseSensor with delay so a quick click never triggers drag
  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { delay: 200, tolerance: 6 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 8 } }),
  );

  const tasksByDay = useMemo(() => {
    const map: Record<string, Task[]> = {};
    for (const day of days) {
      const key = format(day, "yyyy-MM-dd");
      map[key] = tasks
        .filter((t) => isSameDay(parseISO(t.date), day))
        .sort((a, b) => {
          if (a.allDay && !b.allDay) return -1;
          if (!a.allDay && b.allDay) return 1;
          return (a.startTime || "").localeCompare(b.startTime || "");
        });
    }
    return map;
  }, [tasks, days]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const dayKey = Object.keys(tasksByDay).find((k) =>
      tasksByDay[k].some((t) => t.id === active.id)
    );
    if (!dayKey) return;
    const dayTasks = tasksByDay[dayKey];
    const oldIndex = dayTasks.findIndex((t) => t.id === active.id);
    const newIndex = dayTasks.findIndex((t) => t.id === over.id);
    const reordered = arrayMove(dayTasks, oldIndex, newIndex);
    onReorder(reordered.map((t, i) => ({ id: t.id, position: i })));
  };

  const today = new Date();

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <div className="flex-1 overflow-auto" style={{ background: "var(--bg)" }}>
        {/* Day headers */}
        <div
          className="grid grid-cols-8 sticky top-0 z-10"
          style={{ background: "var(--bg-card)", borderBottom: "1px solid var(--border)" }}
        >
          <div className="h-12 border-r" style={{ borderColor: "var(--border)" }} />
          {days.map((day, i) => (
            <button
              key={i}
              onClick={() => onDayClick(day)}
              className="h-12 flex flex-col items-center justify-center transition-colors hover:opacity-80"
            >
              <span className="text-[10px] font-medium uppercase tracking-widest" style={{ color: "var(--text-faint)" }}>
                {DAYS_PT[day.getDay()]}
              </span>
              <span
                className="text-base font-bold w-8 h-8 flex items-center justify-center rounded-full mt-0.5 transition-colors"
                style={
                  isSameDay(day, today)
                    ? { background: "var(--accent)", color: "#fff" }
                    : { color: "var(--text)" }
                }
              >
                {format(day, "d")}
              </span>
            </button>
          ))}
        </div>

        {/* All-day row */}
        <div
          className="grid grid-cols-8 border-b"
          style={{ background: "var(--bg-card)", borderColor: "var(--border)" }}
        >
          <div className="py-2 px-2 text-[9px] font-medium uppercase tracking-wider border-r flex items-center justify-end"
            style={{ color: "var(--text-faint)", borderColor: "var(--border)" }}>
            int.
          </div>
          {days.map((day, i) => {
            const key = format(day, "yyyy-MM-dd");
            const allDayTasks = (tasksByDay[key] || []).filter((t) => t.allDay);
            return (
              <div key={i} className="py-1 px-1 min-h-[28px] border-r space-y-0.5"
                style={{ borderColor: "var(--border)" }}>
                <SortableContext items={allDayTasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
                  {allDayTasks.map((t) => (
                    <TaskCard key={t.id} task={t} onClick={() => onTaskClick(t)} onCopy={onCopyTask} compact />
                  ))}
                </SortableContext>
              </div>
            );
          })}
        </div>

        {/* Hour rows */}
        {HOURS.map((h) => (
          <div key={h} className="grid grid-cols-8 border-b" style={{ borderColor: "var(--border)" }}>
            <div
              className="w-full h-16 border-r px-2 flex items-start pt-1.5 flex-shrink-0"
              style={{ borderColor: "var(--border)" }}
            >
              <span className="text-[10px]" style={{ color: "var(--text-faint)" }}>{h}:00</span>
            </div>
            {days.map((day, i) => {
              const key = format(day, "yyyy-MM-dd");
              const hourTasks = (tasksByDay[key] || []).filter((t) => {
                if (!t.startTime) return false;
                return parseInt(t.startTime.split(":")[0]) === h;
              });
              return (
                <div
                  key={i}
                  className="h-16 border-r relative group/cell"
                  style={{ borderColor: "var(--border)" }}
                  onMouseEnter={e => (e.currentTarget.style.background = "var(--bg-hover)")}
                  onMouseLeave={e => (e.currentTarget.style.background = "")}
                >
                  <SortableContext items={hourTasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
                    <div className="p-0.5 space-y-0.5 h-full">
                      {hourTasks.map((t) => (
                        <TaskCard key={t.id} task={t} onClick={() => onTaskClick(t)} onCopy={onCopyTask} compact />
                      ))}
                    </div>
                  </SortableContext>
                  <div className="absolute top-0.5 right-0.5 hidden group-hover/cell:flex gap-0.5 z-10">
                    {onNewTask && (
                      <button
                        onClick={() => onNewTask(day)}
                        className="w-5 h-5 rounded flex items-center justify-center opacity-60 hover:opacity-100"
                        style={{ background: "var(--bg-card)", color: "var(--text-muted)" }}
                      >
                        <Plus size={10} />
                      </button>
                    )}
                    {copiedTask && onPasteTask && (
                      <button
                        onClick={() => onPasteTask(day)}
                        className="w-5 h-5 rounded flex items-center justify-center opacity-60 hover:opacity-100"
                        style={{ background: "var(--accent-muted)", color: "var(--accent)" }}
                        title={`Colar "${copiedTask.title}"`}
                      >
                        <ClipboardPaste size={10} />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ))}

        {/* Unscheduled */}
        {days.some(day => (tasksByDay[format(day, "yyyy-MM-dd")] || []).some(t => !t.allDay && !t.startTime)) && (
          <div className="grid grid-cols-8 border-b" style={{ borderColor: "var(--border)" }}>
            <div className="py-2 px-2 text-[9px] font-medium uppercase tracking-wider border-r flex items-center justify-end"
              style={{ color: "var(--text-faint)", borderColor: "var(--border)" }}>
              livre
            </div>
            {days.map((day, i) => {
              const key = format(day, "yyyy-MM-dd");
              const free = (tasksByDay[key] || []).filter(t => !t.allDay && !t.startTime);
              return (
                <div key={i} className="py-1 px-1 space-y-0.5 border-r" style={{ borderColor: "var(--border)" }}>
                  <SortableContext items={free.map(t => t.id)} strategy={verticalListSortingStrategy}>
                    {free.map((t) => (
                      <TaskCard key={t.id} task={t} onClick={() => onTaskClick(t)} onCopy={onCopyTask} compact />
                    ))}
                  </SortableContext>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </DndContext>
  );
}