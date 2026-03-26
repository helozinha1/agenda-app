"use client";

import { useState, useEffect, useCallback } from "react";
import {
  ChevronLeft, ChevronRight, Plus, LayoutGrid, Calendar, List,
  Moon, Sun, Smile, ClipboardPaste,
} from "lucide-react";
import {
  addDays, addWeeks, addMonths, subDays, subWeeks, subMonths,
  format,
} from "date-fns";
import { Task, ViewMode, Category } from "@/types";
import { useTasks } from "@/hooks/useTasks";
import TaskModal from "@/components/TaskModal";
import WeekView from "@/components/WeekView";
import MonthView from "@/components/MonthView";
import DayView from "@/components/DayView";
import StickerPanel from "@/components/StickerPanel";
import { cn, MONTHS_PT } from "@/lib/utils";

// Fix timezone: use local date string instead of toISOString which shifts to UTC
function localDateStr(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

export default function Home() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<ViewMode>("week");
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [modalDate, setModalDate] = useState<Date>(new Date());
  const [categories, setCategories] = useState<Category[]>([]);
  const [dark, setDark] = useState(false);
  const [stickerOpen, setStickerOpen] = useState(false);
  const [copiedTask, setCopiedTask] = useState<Task | null>(null);

  const { tasks, loading, createTask, updateTask, deleteTask, reorderTasks } =
    useTasks(currentDate, view);

  useEffect(() => {
    fetch("/api/categories").then((r) => r.json()).then(setCategories);
  }, []);

  // Dark mode persistence
  useEffect(() => {
    const saved = localStorage.getItem("theme");
    if (saved === "dark") {
      setDark(true);
      document.documentElement.setAttribute("data-theme", "dark");
    }
  }, []);

  // Keyboard shortcuts: Ctrl+C to copy focused task, Ctrl+V to paste
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // Ctrl+V — paste to current date
      if ((e.ctrlKey || e.metaKey) && e.key === "v" && copiedTask && !modalOpen) {
        e.preventDefault();
        handlePasteTask(currentDate);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [copiedTask, currentDate, modalOpen]);

  const toggleDark = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.setAttribute("data-theme", next ? "dark" : "light");
    localStorage.setItem("theme", next ? "dark" : "light");
  };

  const navigate = (dir: 1 | -1) => {
    if (view === "day") setCurrentDate((d) => dir === 1 ? addDays(d, 1) : subDays(d, 1));
    else if (view === "week") setCurrentDate((d) => dir === 1 ? addWeeks(d, 1) : subWeeks(d, 1));
    else setCurrentDate((d) => dir === 1 ? addMonths(d, 1) : subMonths(d, 1));
  };

  const headerLabel = () => {
    if (view === "month") return `${MONTHS_PT[currentDate.getMonth()]} ${currentDate.getFullYear()}`;
    if (view === "day") return format(currentDate, "dd 'de' MMMM");
    return `${MONTHS_PT[currentDate.getMonth()]} ${currentDate.getFullYear()}`;
  };

  const openNewTask = (date?: Date) => {
    setSelectedTask(null);
    setModalDate(date || currentDate);
    setModalOpen(true);
  };

  const openEditTask = (task: Task) => {
    setSelectedTask(task);
    setModalOpen(true);
  };

  const handleCopyTask = useCallback((task: Task) => {
    setCopiedTask(task);
  }, []);

  // Use localDateStr to avoid UTC timezone shift
  const handlePasteTask = useCallback(async (date: Date) => {
    if (!copiedTask) return;
    await createTask({
      title: copiedTask.title,
      color: copiedTask.color,
      date: localDateStr(date),          // ← fix: local date, not UTC
      startTime: copiedTask.startTime || undefined,
      endTime: copiedTask.endTime || undefined,
      allDay: copiedTask.allDay,
      description: copiedTask.description || undefined,
      repeat: "NONE",
      categoryId: copiedTask.categoryId || undefined,
    });
  }, [copiedTask, createTask]);

  // Delete: close modal AFTER delete resolves
  const handleDelete = async () => {
    if (!selectedTask) return;
    await deleteTask(selectedTask.id);
    setModalOpen(false);
    setSelectedTask(null);
  };

  return (
    <div
      className="h-screen flex flex-col"
      style={{ background: "var(--bg)", color: "var(--text)", fontFamily: "'Poppins', sans-serif" }}
    >
      {/* Top bar */}
      <header
        className="flex items-center justify-between px-4 sm:px-5 py-2.5 gap-3 flex-shrink-0"
        style={{ background: "var(--bg-card)", borderBottom: "1px solid var(--border)", boxShadow: "var(--shadow)" }}
      >
        {/* Logo */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-xs font-bold"
            style={{ background: "var(--accent)" }}
          >
            P
          </div>
          <span className="text-sm font-semibold hidden sm:block" style={{ color: "var(--text)" }}>
            Planner
          </span>
        </div>

        {/* Nav controls */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => navigate(-1)}
            className="p-1.5 rounded-lg transition-colors"
            style={{ color: "var(--text-muted)" }}
            onMouseEnter={e => (e.currentTarget.style.background = "var(--bg-hover)")}
            onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
          >
            <ChevronLeft size={16} />
          </button>
          <button
            onClick={() => setCurrentDate(new Date())}
            className="text-xs font-medium px-2.5 py-1.5 rounded-lg transition-all min-w-[110px] text-center"
            style={{ color: "var(--text)", background: "var(--bg-hover)" }}
          >
            {headerLabel()}
          </button>
          <button
            onClick={() => navigate(1)}
            className="p-1.5 rounded-lg transition-colors"
            style={{ color: "var(--text-muted)" }}
            onMouseEnter={e => (e.currentTarget.style.background = "var(--bg-hover)")}
            onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
          >
            <ChevronRight size={16} />
          </button>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-1.5">
          {/* Copied task pill */}
          {copiedTask && (
            <div
              className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium"
              style={{ background: "var(--accent-muted)", color: "var(--accent)" }}
              title="Ctrl+V para colar na data atual"
            >
              <ClipboardPaste size={12} />
              <span className="max-w-[80px] truncate">{copiedTask.title}</span>
              <span className="opacity-50 text-[10px] hidden md:inline">Ctrl+V</span>
              <button onClick={() => setCopiedTask(null)} className="opacity-50 hover:opacity-100 ml-0.5 text-sm leading-none">×</button>
            </div>
          )}

          {/* View switcher */}
          <div className="flex rounded-xl p-0.5 gap-0.5" style={{ background: "var(--bg-hover)" }}>
            {([
              { v: "day" as ViewMode, icon: <List size={13} />, label: "Dia" },
              { v: "week" as ViewMode, icon: <Calendar size={13} />, label: "Semana" },
              { v: "month" as ViewMode, icon: <LayoutGrid size={13} />, label: "Mês" },
            ] as const).map(({ v, icon, label }) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={cn("px-2 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1 transition-all")}
                style={
                  view === v
                    ? { background: "var(--bg-card)", color: "var(--text)", boxShadow: "var(--shadow)" }
                    : { color: "var(--text-muted)" }
                }
              >
                {icon}
                <span className="hidden sm:inline">{label}</span>
              </button>
            ))}
          </div>

          {/* Sticker button */}
          <button
            onClick={() => setStickerOpen(!stickerOpen)}
            className="p-1.5 rounded-lg transition-colors"
            style={{
              color: stickerOpen ? "var(--accent)" : "var(--text-muted)",
              background: stickerOpen ? "var(--accent-muted)" : "transparent",
            }}
            title="Figurinhas"
          >
            <Smile size={16} />
          </button>

          {/* Dark mode */}
          <button
            onClick={toggleDark}
            className="p-1.5 rounded-lg transition-colors"
            style={{ color: "var(--text-muted)" }}
            onMouseEnter={e => (e.currentTarget.style.background = "var(--bg-hover)")}
            onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
            title={dark ? "Modo claro" : "Modo noturno"}
          >
            {dark ? <Sun size={16} /> : <Moon size={16} />}
          </button>

          {/* Add task */}
          <button
            onClick={() => openNewTask()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium text-white transition-all hover:opacity-90 active:scale-95"
            style={{ background: "var(--accent)" }}
          >
            <Plus size={15} />
            <span className="hidden sm:inline">Tarefa</span>
          </button>
        </div>
      </header>

      {/* Sticker panel */}
      {stickerOpen && <StickerPanel onClose={() => setStickerOpen(false)} />}

      {/* Loading bar */}
      {loading && (
        <div className="h-0.5" style={{ background: "var(--border)" }}>
          <div className="h-full animate-pulse w-full" style={{ background: "var(--accent)" }} />
        </div>
      )}

      {/* Views */}
      {view === "week" && (
        <WeekView
          tasks={tasks}
          currentDate={currentDate}
          onTaskClick={openEditTask}
          onDayClick={(d: Date) => { setCurrentDate(d); setView("day"); }}
          onReorder={reorderTasks}
          copiedTask={copiedTask}
          onCopyTask={handleCopyTask}
          onPasteTask={handlePasteTask}
          onNewTask={openNewTask}
        />
      )}
      {view === "month" && (
        <MonthView
          tasks={tasks}
          currentDate={currentDate}
          onTaskClick={openEditTask}
          onDayClick={(d: Date) => { setCurrentDate(d); setView("day"); }}
          copiedTask={copiedTask}
          onCopyTask={handleCopyTask}
          onPasteTask={handlePasteTask}
        />
      )}
      {view === "day" && (
        <DayView
          tasks={tasks}
          currentDate={currentDate}
          onTaskClick={openEditTask}
          onReorder={reorderTasks}
          copiedTask={copiedTask}
          onCopyTask={handleCopyTask}
          onPasteTask={handlePasteTask}
          onNewTask={openNewTask}
        />
      )}

      {/* FAB mobile */}
      <button
        onClick={() => openNewTask()}
        className="sm:hidden fixed bottom-6 right-6 w-14 h-14 text-white rounded-full shadow-lg flex items-center justify-center active:scale-95 transition-transform"
        style={{ background: "var(--accent)" }}
      >
        <Plus size={24} />
      </button>

      {/* Modal */}
      <TaskModal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setSelectedTask(null); }}
        initialDate={modalDate}
        task={selectedTask}
        categories={categories}
        onSave={async (data) => {
          if (selectedTask) {
            await updateTask(selectedTask.id, data);
          } else {
            await createTask(data);
          }
        }}
        onDelete={selectedTask ? handleDelete : undefined}
        onCopy={selectedTask ? () => { handleCopyTask(selectedTask); } : undefined}
      />
    </div>
  );
}