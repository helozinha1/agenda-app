"use client";

import { useState, useRef, useEffect } from "react";
import { X, RefreshCw } from "lucide-react";
import { STICKER_GROUPS } from "@/lib/stickers";

interface PlacedSticker {
  id: string;
  url: string;
  x: number;
  y: number;
  rotation: number;
  size: number;
}

export default function StickerPanel({ onClose }: { onClose: () => void }) {
  const [activeGroup, setActiveGroup] = useState(0);
  const [placed, setPlaced] = useState<PlacedSticker[]>([]);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [failedUrls, setFailedUrls] = useState<Set<string>>(new Set());

  const addSticker = (url: string) => {
    const id = `stk-${Date.now()}`;
    const x = window.innerWidth / 2 + (Math.random() - 0.5) * 320;
    const y = window.innerHeight / 2 + (Math.random() - 0.5) * 160;
    const rotation = (Math.random() - 0.5) * 22;
    const size = 72 + Math.random() * 40;
    setPlaced((prev) => [...prev, { id, url, x, y, rotation, size }]);
  };

  const removeSticker = (id: string) => setPlaced((prev) => prev.filter((s) => s.id !== id));

  const rotateSticker = (id: string) => {
    setPlaced((prev) =>
      prev.map((s) => s.id === id ? { ...s, rotation: s.rotation + 15 } : s)
    );
  };

  const startDrag = (e: React.PointerEvent, id: string) => {
    e.stopPropagation();
    const s = placed.find((p) => p.id === id);
    if (!s) return;
    setDraggingId(id);
    setDragOffset({ x: e.clientX - s.x, y: e.clientY - s.y });
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!draggingId) return;
    setPlaced((prev) =>
      prev.map((s) =>
        s.id === draggingId
          ? { ...s, x: e.clientX - dragOffset.x, y: e.clientY - dragOffset.y }
          : s
      )
    );
  };

  const onPointerUp = () => setDraggingId(null);

  const markFailed = (url: string) => setFailedUrls((prev) => new Set([...prev, url]));

  return (
    <>
      {/* Floating stickers overlay */}
      <div
        className="fixed inset-0 pointer-events-none z-40"
        style={{ pointerEvents: draggingId ? "all" : "none" }}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
      >
        {placed.map((s) => (
          <div
            key={s.id}
            className="absolute group"
            style={{
              left: s.x,
              top: s.y,
              transform: `translate(-50%, -50%) rotate(${s.rotation}deg)`,
              width: s.size,
              height: s.size,
              cursor: draggingId === s.id ? "grabbing" : "grab",
              pointerEvents: "all",
              userSelect: "none",
              zIndex: draggingId === s.id ? 999 : 40,
              filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.18))",
            }}
            onPointerDown={(e) => startDrag(e, s.id)}
          >
            <img
              src={s.url}
              alt="sticker"
              className="w-full h-full object-contain pointer-events-none select-none"
              draggable={false}
              onError={() => markFailed(s.url)}
            />
            {/* Hover controls */}
            <div className="absolute -top-3 -right-3 hidden group-hover:flex gap-1">
              <button
                className="w-5 h-5 rounded-full bg-white shadow text-gray-500 flex items-center justify-center hover:bg-gray-100 transition-colors pointer-events-auto"
                onPointerDown={(e) => { e.stopPropagation(); rotateSticker(s.id); }}
                title="Girar"
              >
                <RefreshCw size={9} />
              </button>
              <button
                className="w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600 transition-colors pointer-events-auto text-xs font-bold"
                onPointerDown={(e) => { e.stopPropagation(); removeSticker(s.id); }}
                title="Remover"
              >
                ×
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Picker panel */}
      <div
        className="flex-shrink-0 border-b"
        style={{ background: "var(--bg-card)", borderColor: "var(--border)" }}
      >
        {/* Group tabs */}
        <div className="flex items-center px-4 pt-2 gap-2">
          <div className="flex gap-1 flex-1 overflow-x-auto">
            {STICKER_GROUPS.map((g, i) => (
              <button
                key={i}
                onClick={() => setActiveGroup(i)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap flex-shrink-0 transition-all"
                style={
                  activeGroup === i
                    ? { background: "var(--accent-muted)", color: "var(--accent)" }
                    : { color: "var(--text-muted)" }
                }
              >
                <span className="text-sm">{g.icon}</span>
                {g.label}
              </button>
            ))}
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg flex-shrink-0 transition-colors"
            style={{ color: "var(--text-faint)" }}
            onMouseEnter={e => (e.currentTarget.style.background = "var(--bg-hover)")}
            onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
          >
            <X size={14} />
          </button>
        </div>

        {/* Sticker grid */}
        <div className="flex gap-2 px-4 py-3 overflow-x-auto">
          {STICKER_GROUPS[activeGroup].items
            .filter((item) => !failedUrls.has(item.url))
            .map((item) => (
              <button
                key={item.id}
                onClick={() => addSticker(item.url)}
                className="flex-shrink-0 w-14 h-14 rounded-xl flex items-center justify-center transition-all hover:scale-110 active:scale-95 p-1"
                style={{ background: "var(--bg-hover)" }}
                title={item.label}
              >
                <img
                  src={item.url}
                  alt={item.label}
                  className="w-full h-full object-contain"
                  loading="lazy"
                  onError={(e) => {
                    markFailed(item.url);
                    (e.currentTarget.closest("button") as HTMLElement)?.remove();
                  }}
                />
              </button>
            ))}
        </div>

        <p className="px-4 pb-2 text-[10px]" style={{ color: "var(--text-faint)" }}>
          Adesivos por <a href="https://www.flaticon.com/br/stickers" target="_blank" rel="noopener" className="underline">Flaticon</a> — arraste para mover, hover para girar/remover
        </p>
      </div>
    </>
  );
}