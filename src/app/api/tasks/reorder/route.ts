import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// PATCH /api/tasks/reorder
// body: { items: [{ id, position }] }
export async function PATCH(req: NextRequest) {
  const { items } = await req.json();

  await prisma.$transaction(
    items.map(({ id, position }: { id: string; position: number }) =>
      prisma.task.update({ where: { id }, data: { position } })
    )
  );

  return NextResponse.json({ ok: true });
}
