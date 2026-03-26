import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function parseDateLocal(str: string): Date {
  const [y, m, d] = str.split("-").map(Number);
  return new Date(y, m - 1, d, 12, 0, 0);
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const body = await req.json();

  const task = await prisma.task.update({
    where: { id: params.id },
    data: {
      ...(body.title !== undefined && { title: body.title }),
      ...(body.color !== undefined && { color: body.color }),
      ...(body.date !== undefined && {
        date: typeof body.date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(body.date)
          ? parseDateLocal(body.date)
          : new Date(body.date),
      }),
      ...(body.startTime !== undefined && { startTime: body.startTime }),
      ...(body.endTime !== undefined && { endTime: body.endTime }),
      ...(body.allDay !== undefined && { allDay: body.allDay }),
      ...(body.description !== undefined && { description: body.description }),
      ...(body.position !== undefined && { position: body.position }),
      ...(body.repeat !== undefined && { repeat: body.repeat }),
      ...(body.repeatUntil !== undefined && {
        repeatUntil: body.repeatUntil
          ? (typeof body.repeatUntil === "string" && /^\d{4}-\d{2}-\d{2}$/.test(body.repeatUntil)
            ? parseDateLocal(body.repeatUntil)
            : new Date(body.repeatUntil))
          : null,
      }),
      ...(body.repeatDays !== undefined && { repeatDays: body.repeatDays }),
      ...(body.categoryId !== undefined && { categoryId: body.categoryId }),
    },
    include: { category: true },
  });

  return NextResponse.json({
    ...task,
    date: task.date.toISOString(),
    repeatUntil: task.repeatUntil?.toISOString() ?? null,
    createdAt: task.createdAt.toISOString(),
    updatedAt: task.updatedAt.toISOString(),
  });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  await prisma.task.delete({ where: { id: params.id } });
  return new Response(null, { status: 204 });
}