"use client";

import { useState, useEffect, useCallback } from "react";
import { Task, CreateTaskInput, ViewMode } from "@/types";
import { format } from "date-fns";

export function useTasks(currentDate: Date, view: ViewMode) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/tasks?view=${view}&date=${format(currentDate, "yyyy-MM-dd")}`
      );
      const data = await res.json();
      setTasks(data);
    } finally {
      setLoading(false);
    }
  }, [currentDate, view]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const createTask = async (input: CreateTaskInput) => {
    const res = await fetch("/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    const task = await res.json();
    setTasks((prev) => [...prev, task]);
    return task;
  };

  const updateTask = async (id: string, data: Partial<CreateTaskInput>) => {
    const res = await fetch(`/api/tasks/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const updated = await res.json();
    setTasks((prev) => prev.map((t) => (t.id === id ? updated : t)));
    return updated;
  };

  const deleteTask = async (id: string) => {
    await fetch(`/api/tasks/${id}`, { method: "DELETE" });
    setTasks((prev) => prev.filter((t) => t.id !== id));
  };

  const reorderTasks = async (items: { id: string; position: number }[]) => {
    setTasks((prev) =>
      prev.map((t) => {
        const found = items.find((i) => i.id === t.id);
        return found ? { ...t, position: found.position } : t;
      })
    );
    await fetch("/api/tasks/reorder", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items }),
    });
  };

  return { tasks, loading, createTask, updateTask, deleteTask, reorderTasks, refetch: fetchTasks };
}
