"use client";

import { useState, useEffect, useRef } from "react";
import { X, Repeat, Clock, AlignLeft, Tag, Calendar, Copy, Pipette } from "lucide-react";
import { format } from "date-fns";
import { Task, CreateTaskInput, RepeatType, Category } from "@/types";
import { DAYS_PT, cn, getTextColor } from "@/lib/utils";

interface Props {
  open: boolean;
  onClose: () => void;
  onSave: (data: CreateTaskInput) => Promise<void>;
  onDelete?: () => Promise<void>;
  onCopy?: () => void;
  initialDate?: Date;
  task?: Task | null;
  categories: Category[];
}

const REPEAT_OPTIONS: { value: RepeatType; label: string }[] = [
  { value: "NONE", label: "Não repetir" },
  { value: "DAILY", label: "Todo dia" },
  { value: "WEEKLY", label: "Toda semana" },
  { value: "MONTHLY", label: "Todo mês" },
];

// Quick preset swatches — only used as shortcuts, not the full palette
const SWATCHES = [
  "#6B7FD4", "#9B8ED4", "#D47FB3", "#D4856B",
  "#D4C06B", "#5BAD8F", "#6BBFD4", "#D46B6B",
  "#B8D4A0", "#8BBCCC", "#E8A87C", "#A78BFA",
  "#F472B6", "#34D399", "#60A5FA", "#FBBF24",
];

export default function TaskModal({
  open, onClose, onSave, onDelete, onCopy, initialDate, task, categories,
}: Props) {
  const [title, setTitle] = useState("");
  const [color, setColor] = useState("#6B7FD4");
  const [hexInput, setHexInput] = useState("#6B7FD4");
  const [date, setDate] = useState(format(initialDate || new Date(), "yyyy-MM-dd"));
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [allDay, setAllDay] = useState(false);
  const [description, setDescription] = useState("");
  const [repeat, setRepeat] = useState<RepeatType>("NONE");
  const [repeatUntil, setRepeatUntil] = useState("");
  const [repeatDays, setRepeatDays] = useState<number[]>([]);
  const [categoryId, setCategoryId] = useState("");
  const [saving, setSaving] = useState(false);
  const colorInputRef = useRef<HTMLInputElement>(null);

  const applyColor = (c: string) => {
    setColor(c);
    setHexInput(c);
  };

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      applyColor(task.color);
      setDate(format(new Date(task.date), "yyyy-MM-dd"));
      setStartTime(task.startTime || "");
      setEndTime(task.endTime || "");
      setAllDay(task.allDay);
      setDescription(task.description || "");
      setRepeat(task.repeat);
      setRepeatUntil(task.repeatUntil ? format(new Date(task.repeatUntil), "yyyy-MM-dd") : "");
      setRepeatDays(task.repeatDays || []);
      setCategoryId(task.categoryId || "");
    } else {
      setTitle("");
      applyColor("#6B7FD4");
      setDate(format(initialDate || new Date(), "yyyy-MM-dd"));
      setStartTime(""); setEndTime(""); setAllDay(false);
      setDescription(""); setRepeat("NONE"); setRepeatUntil("");
      setRepeatDays([]); setCategoryId("");
    }
  }, [task, initialDate, open]);

  const toggleRepeatDay = (d: number) => {
    setRepeatDays((prev) =>
      prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d]
    );
  };

  const handleHexInput = (val: string) => {
    setHexInput(val);
    if (/^#[0-9A-Fa-f]{6}$/.test(val)) setColor(val);
  };

  const handleSave = async () => {
    if (!title.trim()) return;
    setSaving(true);
    try {
      await onSave({
        title: title.trim(), color, date,
        startTime: allDay ? undefined : startTime || undefined,
        endTime: allDay ? undefined : endTime || undefined,
        allDay,
        description: description || undefined,
        repeat,
        repeatUntil: repeatUntil || undefined,
        repeatDays,
        categoryId: categoryId || undefined,
      });
      onClose();
    } finally {
      setSaving(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div
        className="relative rounded-t-3xl sm:rounded-2xl w-full sm:max-w-md max-h-[92vh] overflow-y-auto shadow-2xl"
        style={{ background: "var(--bg-card)", color: "var(--text)" }}
      >
        {/* Colored top bar */}
        <div
          className="h-1.5 w-full rounded-t-3xl sm:rounded-t-2xl transition-colors duration-200"
          style={{ background: color }}
        />

        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-4 pb-0">
          <h2 className="font-semibold text-base" style={{ color: "var(--text)" }}>
            {task ? "Editar tarefa" : "Nova tarefa"}
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full transition-colors"
            style={{ color: "var(--text-faint)" }}
            onMouseEnter={e => (e.currentTarget.style.background = "var(--bg-hover)")}
            onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
          >
            <X size={16} />
          </button>
        </div>

        <div className="px-5 pt-4 pb-2 space-y-4">
          {/* Title */}
          <input
            autoFocus
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSave()}
            placeholder="Nome da tarefa..."
            className="w-full text-base font-medium outline-none pb-1.5 bg-transparent"
            style={{
              color: "var(--text)",
              borderBottom: "2px solid " + color,
            }}
          />

          {/* ── COLOR PICKER ── */}
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest mb-2.5"
              style={{ color: "var(--text-faint)" }}>
              Cor da tarefa
            </p>

            {/* Swatches grid */}
            <div className="flex flex-wrap gap-2 mb-3">
              {SWATCHES.map((c) => (
                <button
                  key={c}
                  onClick={() => applyColor(c)}
                  className="w-7 h-7 rounded-full transition-all hover:scale-110"
                  style={{
                    background: c,
                    outline: color === c ? `3px solid ${c}` : "none",
                    outlineOffset: "2px",
                    boxShadow: color === c ? `0 0 0 1px white` : "none",
                  }}
                  title={c}
                />
              ))}
            </div>

            {/* Custom color row: native picker + hex input */}
            <div className="flex items-center gap-2">
              {/* Native color wheel */}
              <div className="relative flex-shrink-0">
                <div
                  className="w-9 h-9 rounded-xl cursor-pointer border-2 flex items-center justify-center transition-all hover:scale-105"
                  style={{ background: color, borderColor: "var(--border)" }}
                  onClick={() => colorInputRef.current?.click()}
                  title="Escolher cor personalizada"
                >
                  <Pipette size={14} style={{ color: getTextColor(color) }} />
                </div>
                <input
                  ref={colorInputRef}
                  type="color"
                  value={color}
                  onChange={(e) => applyColor(e.target.value)}
                  className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
                  tabIndex={-1}
                />
              </div>

              {/* Hex input */}
              <input
                type="text"
                value={hexInput}
                onChange={(e) => handleHexInput(e.target.value)}
                onBlur={() => setHexInput(color)}
                placeholder="#6B7FD4"
                maxLength={7}
                className="flex-1 text-xs font-mono rounded-lg px-3 py-2 outline-none uppercase"
                style={{
                  background: "var(--bg-hover)",
                  border: "1px solid var(--border)",
                  color: "var(--text)",
                }}
              />

              {/* Preview chip */}
              <div
                className="px-3 py-2 rounded-lg text-xs font-semibold flex-shrink-0"
                style={{ background: color, color: getTextColor(color) }}
              >
                Preview
              </div>
            </div>
          </div>

          {/* Date */}
          <div className="flex items-center gap-3">
            <Calendar size={15} style={{ color: "var(--text-faint)" }} className="flex-shrink-0" />
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="text-sm outline-none rounded-lg px-3 py-1.5"
              style={{
                color: "var(--text)",
                background: "var(--bg-hover)",
                border: "1px solid var(--border)",
              }}
            />
          </div>

          {/* All day + times */}
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <Clock size={15} style={{ color: "var(--text-faint)" }} className="flex-shrink-0" />
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <div
                  onClick={() => setAllDay(!allDay)}
                  className="w-9 h-5 rounded-full transition-colors relative"
                  style={{ background: allDay ? "var(--accent)" : "var(--border)" }}
                >
                  <div
                    className={cn(
                      "absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform",
                      allDay ? "translate-x-4" : "translate-x-0.5"
                    )}
                  />
                </div>
                <span className="text-sm" style={{ color: "var(--text-muted)" }}>Dia inteiro</span>
              </label>
            </div>
            {!allDay && (
              <div className="flex items-center gap-2 ml-7">
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="text-sm rounded-lg px-2 py-1.5 outline-none"
                  style={{ color: "var(--text)", background: "var(--bg-hover)", border: "1px solid var(--border)" }}
                />
                <span className="text-sm" style={{ color: "var(--text-faint)" }}>até</span>
                <input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="text-sm rounded-lg px-2 py-1.5 outline-none"
                  style={{ color: "var(--text)", background: "var(--bg-hover)", border: "1px solid var(--border)" }}
                />
              </div>
            )}
          </div>

          {/* Description */}
          <div className="flex items-start gap-3">
            <AlignLeft size={15} style={{ color: "var(--text-faint)" }} className="flex-shrink-0 mt-1.5" />
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Adicionar descrição..."
              rows={2}
              className="flex-1 text-sm outline-none resize-none rounded-lg px-3 py-2"
              style={{ color: "var(--text)", background: "var(--bg-hover)", border: "1px solid var(--border)" }}
            />
          </div>

          {/* Category */}
          {categories.length > 0 && (
            <div className="flex items-center gap-3">
              <Tag size={15} style={{ color: "var(--text-faint)" }} className="flex-shrink-0" />
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="text-sm rounded-lg px-3 py-1.5 outline-none flex-1"
                style={{ color: "var(--text)", background: "var(--bg-hover)", border: "1px solid var(--border)" }}
              >
                <option value="">Sem categoria</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          )}

          {/* Repeat */}
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <Repeat size={15} style={{ color: "var(--text-faint)" }} className="flex-shrink-0" />
              <select
                value={repeat}
                onChange={(e) => setRepeat(e.target.value as RepeatType)}
                className="text-sm rounded-lg px-3 py-1.5 outline-none flex-1"
                style={{ color: "var(--text)", background: "var(--bg-hover)", border: "1px solid var(--border)" }}
              >
                {REPEAT_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>

            {repeat === "WEEKLY" && (
              <div className="ml-7 flex gap-1">
                {DAYS_PT.map((d, i) => (
                  <button
                    key={i}
                    onClick={() => toggleRepeatDay(i)}
                    className="w-8 h-8 rounded-full text-xs font-medium transition-all"
                    style={
                      repeatDays.includes(i)
                        ? { background: color, color: getTextColor(color) }
                        : { background: "var(--bg-hover)", color: "var(--text-muted)" }
                    }
                  >
                    {d[0]}
                  </button>
                ))}
              </div>
            )}

            {repeat !== "NONE" && (
              <div className="ml-7 flex items-center gap-2">
                <span className="text-xs" style={{ color: "var(--text-faint)" }}>Repetir até</span>
                <input
                  type="date"
                  value={repeatUntil}
                  onChange={(e) => setRepeatUntil(e.target.value)}
                  className="text-xs rounded-lg px-2 py-1 outline-none"
                  style={{ color: "var(--text)", background: "var(--bg-hover)", border: "1px solid var(--border)" }}
                />
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-4 flex gap-2">
          {task && onDelete && (
            <button
              onClick={async () => { await onDelete(); onClose(); }}
              className="px-3 py-2.5 rounded-xl text-sm transition-colors"
              style={{ color: "#f87171", border: "1px solid #fecaca" }}
              onMouseEnter={e => (e.currentTarget.style.background = "#fff1f2")}
              onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
            >
              Excluir
            </button>
          )}
          {task && onCopy && (
            <button
              onClick={() => { onCopy(); onClose(); }}
              className="px-3 py-2.5 rounded-xl text-sm flex items-center gap-1.5 transition-colors"
              style={{ color: "var(--text-muted)", border: "1px solid var(--border)" }}
              onMouseEnter={e => (e.currentTarget.style.background = "var(--bg-hover)")}
              onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
            >
              <Copy size={13} /> Copiar
            </button>
          )}
          <button
            onClick={handleSave}
            disabled={!title.trim() || saving}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white transition-all disabled:opacity-40 hover:opacity-90 active:scale-[0.98]"
            style={{ background: color }}
          >
            {saving ? "Salvando..." : "Salvar"}
          </button>
        </div>
      </div>
    </div>
  );
}