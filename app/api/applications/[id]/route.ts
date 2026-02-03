import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { updateApplicationSchema } from "@/lib/schemas";

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(req: Request, ctx: Ctx) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id;

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await ctx.params; // ✅ Next.js 16.1: params is a Promise
  if (!id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }

  const body = await req.json().catch(() => null);
  const parsed = updateApplicationSchema.safeParse(body);

  if (!parsed.success) {
    const flat = parsed.error.flatten();
    const msg =
      flat.formErrors[0] ||
      Object.values(flat.fieldErrors).flat()[0] ||
      "Invalid input";
    return NextResponse.json({ error: msg }, { status: 400 });
  }

  // Ensure it belongs to the user
  const existing = await prisma.jobApplication.findFirst({
    where: { id, userId },
  });

  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const updated = await prisma.jobApplication.update({
    where: { id }, // ✅ now id is defined
    data: {
      company: parsed.data.company,
      roleTitle: parsed.data.roleTitle,
      location:
        parsed.data.location === undefined ? undefined : parsed.data.location || null,
      salaryRange:
        parsed.data.salaryRange === undefined ? undefined : parsed.data.salaryRange || null,
      notes: parsed.data.notes === undefined ? undefined : parsed.data.notes || null,
      status: parsed.data.status,
      url:
        parsed.data.url !== undefined
          ? parsed.data.url?.trim()
            ? parsed.data.url
            : null
          : undefined,
      // appliedAt: parsed.data.appliedAt ? new Date(parsed.data.appliedAt) : undefined, // later
    },
  });

  return NextResponse.json({ application: updated });
}

export async function DELETE(_req: Request, ctx: Ctx) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id;

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await ctx.params; // ✅ await params
  if (!id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }

  const existing = await prisma.jobApplication.findFirst({
    where: { id, userId },
  });

  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await prisma.jobApplication.delete({ where: { id } });

  return NextResponse.json({ ok: true });
}
