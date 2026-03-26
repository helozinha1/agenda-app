import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const COLOR_PALETTE = [
  { hex: "#6B7FD4", label: "Azul índigo" },
  { hex: "#9B8ED4", label: "Lavanda" },
  { hex: "#D47FB3", label: "Rosa" },
  { hex: "#D4856B", label: "Terracota" },
  { hex: "#D4C06B", label: "Dourado" },
  { hex: "#7BD47B", label: "Verde" },
  { hex: "#6BBFD4", label: "Ciano" },
  { hex: "#D46B6B", label: "Vermelho" },
  { hex: "#B8D4A0", label: "Menta" },
  { hex: "#D4B896", label: "Pêssego" },
  { hex: "#8BBCCC", label: "Azul claro" },
  { hex: "#C4C4C4", label: "Cinza" },
];

export const DAYS_PT = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
export const DAYS_FULL_PT = [
  "Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado",
];
export const MONTHS_PT = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];

export function getTextColor(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.6 ? "#1a1a2e" : "#fff";
}

export function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}