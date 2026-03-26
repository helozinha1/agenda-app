import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  startOfDay, endOfDay, startOfMonth, endOfMonth,
  startOfWeek, endOfWeek, addDays, addWeeks, addMonths,
  isBefore, parseISO,
} from "date-fns";

// Parse "yyyy-MM-dd" as LOCAL noon to avoid UTC timezone shift
function parseDateLocal(str: string): Date {
  const [y, m, d] = str.split("-").map(Number);
  return new Date(y, m - 1, d, 12, 0, 0);
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const view = searchParams.get("view") || "week";
  const dateStr = searchParams.get("date") || new Date().toISOString();
  const date = parseISO(dateStr);

  let start: Date;
  let end: Date;

  if (view === "day") {
    start = startOfDay(date);
    end = endOfDay(date);
  } else if (view === "month") {
    start = startOfMonth(date);
    end = endOfMonth(date);
  } else {
    start = startOfWeek(date, { weekStartsOn: 0 });
    end = endOfWeek(date, { weekStartsOn: 0 });
  }

  const tasks = await prisma.task.findMany({
    where: { date: { gte: start, lte: end } },
    include: { category: true },
    orderBy: [{ position: "asc" }, { startTime: "asc" }],
  });

  const repeatingTasks = await prisma.task.findMany({
    where: {
      repeat: { not: "NONE" },
      date: { lt: start },
      OR: [{ repeatUntil: null }, { repeatUntil: { gte: start } }],
    },
    include: { category: true },
  });

  const expandedTasks = expandRepeatingTasks(repeatingTasks, start, end);
  const allTasks = [...tasks, ...expandedTasks].map(serializeTask);

  return NextResponse.json(allTasks);
}

export async function POST(req: NextRequest) {
  const body = await req.json();

  // Use parseDateLocal so "2025-03-27" stays as Mar 27 regardless of server timezone
  const dateValue = typeof body.date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(body.date)
    ? parseDateLocal(body.date)
    : new Date(body.date);

  const task = await prisma.task.create({
    data: {
      title: body.title,
      color: body.color || "#6B7FD4",
      date: dateValue,
      startTime: body.startTime || null,
      endTime: body.endTime || null,
      allDay: body.allDay || false,
      description: body.description || null,
      repeat: body.repeat || "NONE",
      repeatUntil: body.repeatUntil ? parseDateLocal(body.repeatUntil) : null,
      repeatDays: body.repeatDays || [],
      categoryId: body.categoryId || null,
    },
    include: { category: true },
  });

  return NextResponse.json(serializeTask(task), { status: 201 });
}

function expandRepeatingTasks(tasks: any[], start: Date, end: Date) {
  const expanded: any[] = [];
  for (const task of tasks) {
    let current = new Date(task.date);
    const until = task.repeatUntil ? new Date(task.repeatUntil) : end;

    while (isBefore(current, start)) {
      if (task.repeat === "DAILY") current = addDays(current, 1);
      else if (task.repeat === "WEEKLY") {
        current = task.repeatDays.length > 0 ? addDays(current, 1) : addWeeks(current, 1);
      } else if (task.repeat === "MONTHLY") current = addMonths(current, 1);
      else break;
    }

    while (!isBefore(end, current) && !isBefore(until, current)) {
      if (task.repeat === "WEEKLY" && task.repeatDays.length > 0 && !task.repeatDays.includes(current.getDay())) {
        current = addDays(current, 1);
        continue;
      }
      expanded.push({ ...task, id: `${task.id}_${current.toISOString()}`, date: new Date(current), isExpanded: true });
      if (task.repeat === "DAILY") current = addDays(current, 1);
      else if (task.repeat === "WEEKLY") {
        current = task.repeatDays.length > 0 ? addDays(current, 1) : addWeeks(current, 1);
      } else if (task.repeat === "MONTHLY") current = addMonths(current, 1);
      else break;
    }
  }
  return expanded;
}

function serializeTask(task: any) {
  return {
    ...task,
    date: task.date instanceof Date ? task.date.toISOString() : task.date,
    repeatUntil: task.repeatUntil instanceof Date ? task.repeatUntil.toISOString() : task.repeatUntil,
    createdAt: task.createdAt instanceof Date ? task.createdAt.toISOString() : task.createdAt,
    updatedAt: task.updatedAt instanceof Date ? task.updatedAt.toISOString() : task.updatedAt,
  };
}