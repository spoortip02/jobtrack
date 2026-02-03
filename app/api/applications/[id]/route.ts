import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { updateApplicationSchema } from "@/lib/schemas";

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id;

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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

  const existing = await prisma.jobApplication.findFirst({
    where: { id: params.id, userId },
  });

  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const updated = await prisma.jobApplication.update({
    where: { id: params.id },
    data: {
      company: parsed.data.company,
      roleTitle: parsed.data.roleTitle,
      location: parsed.data.location === undefined ? undefined : parsed.data.location || null,
      salaryRange: parsed.data.salaryRange === undefined ? undefined : parsed.data.salaryRange || null,
      notes: parsed.data.notes === undefined ? undefined : parsed.data.notes || null,
      status: parsed.data.status,
      url:
        parsed.data.url !== undefined
          ? parsed.data.url?.trim()
            ? parsed.data.url
            : null
          : undefined,
      // appliedAt: parsed.data.appliedAt ? new Date(parsed.data.appliedAt) : undefined, // later if needed
    },
  });

  return NextResponse.json({ application: updated });
}

export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id;

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const existing = await prisma.jobApplication.findFirst({
    where: { id: params.id, userId },
  });

  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await prisma.jobApplication.delete({ where: { id: params.id } });

  return NextResponse.json({ ok: true });
}
