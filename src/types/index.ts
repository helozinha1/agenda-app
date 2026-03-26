export type RepeatType = "NONE" | "DAILY" | "WEEKLY" | "MONTHLY";

export interface Category {
  id: string;
  name: string;
  color: string;
}

export interface Task {
  id: string;
  title: string;
  color: string;
  date: string; // ISO string
  startTime: string | null;
  endTime: string | null;
  allDay: boolean;
  description: string | null;
  position: number;
  repeat: RepeatType;
  repeatUntil: string | null;
  repeatDays: number[];
  categoryId: string | null;
  category: Category | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTaskInput {
  title: string;
  color?: string;
  date: string;
  startTime?: string;
  endTime?: string;
  allDay?: boolean;
  description?: string;
  repeat?: RepeatType;
  repeatUntil?: string;
  repeatDays?: number[];
  categoryId?: string;
}

export type ViewMode = "week" | "month" | "day";
