"use client";

import { useMemo } from "react";
import {
  startOfMonth, endOfMonth, startOfWeek, endOfWeek,
  eachDayOfInterval, isSameDay, isSameMonth, format, parseISO,
} from "date-fns";
import { Task } from "@/types";
import { DAYS_PT, cn } from "@/lib/utils";
import { ClipboardPaste, Copy } from "lucide-react";

interface Props {
  tasks: Task[];
  currentDate: Date;
  onTaskClick: (task: Task) => void;
  onDayClick: (date: Date) => void;
  copiedTask?: Task | null;
  onCopyTask?: (task: Task) => void;
  onPasteTask?: (date: Date) => void;
}

export default function MonthView({
  tasks, currentDate, onTaskClick, onDayClick,
  copiedTask, onCopyTask, onPasteTask,
}: Props) {
  const days = useMemo(() => {
    const start = startOfWeek(startOfMonth(currentDate), { weekStartsOn: 0 });
    const end = endOfWeek(endOfMonth(currentDate), { weekStartsOn: 0 });
    return eachDayOfInterval({ start, end });
  }, [currentDate]);

  const today = new Date();

  return (
    <div className="flex-1 overflow-auto p-3 miro-grid" style={{ background: "var(--bg)" }}>
      {/* Day headers */}
      <div className="grid grid-cols-7 mb-1">
        {DAYS_PT.map((d) => (
          <div key={d} className="text-[10px] text-center font-semibold py-1 uppercase tracking-widest"
            style={{ color: "var(--text-faint)" }}>
            {d}
          </div>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-7 gap-1">
        {days.map((day, i) => {
          const key = format(day, "yyyy-MM-dd");
          const dayTasks = tasks
            .filter((t) => isSameDay(parseISO(t.date), day))
            .slice(0, 3);
          const extra = tasks.filter((t) => isSameDay(parseISO(t.date), day)).length - 3;
          const isCurrentMonth = isSameMonth(day, currentDate);
          const isToday = isSameDay(day, today);

          return (
            <div
              key={i}
              onClick={() => onDayClick(day)}
              className="min-h-[84px] rounded-xl p-1.5 cursor-pointer transition-all group/day relative"
              style={{
                background: isCurrentMonth ? "var(--bg-card)" : "transparent",
                opacity: isCurrentMonth ? 1 : 0.4,
                outline: isToday ? `2px solid var(--accent)` : "none",
                outlineOffset: "-1px",
              }}
              onMouseEnter={e => {
                if (isCurrentMonth) (e.currentTarget as HTMLElement).style.background = "var(--bg-hover)";
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.background = isCurrentMonth ? "var(--bg-card)" : "transparent";
              }}
            >
              <div className="flex items-center justify-between mb-1">
                <div
                  className="text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full"
                  style={
                    isToday
                      ? { background: "var(--accent)", color: "#fff" }
                      : { color: "var(--text-muted)" }
                  }
                >
                  {format(day, "d")}
                </div>
                {/* Paste button on hover */}
                {copiedTask && onPasteTask && (
                  <button
                    onClick={(e) => { e.stopPropagation(); onPasteTask(day); }}
                    className="opacity-0 group-hover/day:opacity-100 transition-opacity w-5 h-5 rounded flex items-center justify-center"
                    style={{ background: "var(--accent-muted)", color: "var(--accent)" }}
                    title={`Colar "${copiedTask.title}"`}
                  >
                    <ClipboardPaste size={10} />
                  </button>
                )}
              </div>
              <div className="space-y-0.5">
                {dayTasks.map((t) => (
                  <div
                    key={t.id}
                    onClick={(e) => { e.stopPropagation(); onTaskClick(t); }}
                    className="truncate text-[10px] px-1.5 py-0.5 rounded-md font-medium cursor-pointer hover:opacity-80 transition-opacity group/task relative flex items-center gap-1"
                    style={{ background: t.color, color: "#fff" }}
                  >
                    {t.startTime && <span className="opacity-70 text-[9px]">{t.startTime}</span>}
                    <span className="truncate flex-1">{t.title}</span>
                    {onCopyTask && (
                      <button
                        className="opacity-0 group-hover/task:opacity-80 hover:!opacity-100"
                        onClick={(e) => { e.stopPropagation(); onCopyTask(t); }}
                        title="Copiar"
                      >
                        <Copy size={8} />
                      </button>
                    )}
                  </div>
                ))}
                {extra > 0 && (
                  <p className="text-[10px] pl-1" style={{ color: "var(--text-faint)" }}>+{extra}</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}