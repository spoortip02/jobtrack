import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { createApplicationSchema } from "@/lib/schemas";

export async function GET() {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id;

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const apps = await prisma.jobApplication.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ applications: apps });
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id;

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const parsed = createApplicationSchema.safeParse(body);

  if (!parsed.success) {
    const flat = parsed.error.flatten();
    const msg =
      flat.formErrors[0] ||
      Object.values(flat.fieldErrors).flat()[0] ||
      "Invalid input";
    return NextResponse.json({ error: msg }, { status: 400 });
  }

  const created = await prisma.jobApplication.create({
    data: {
      userId,
      company: parsed.data.company,
      roleTitle: parsed.data.roleTitle,
      location: parsed.data.location || null,
      url: parsed.data.url?.trim() ? parsed.data.url : null,
      salaryRange: parsed.data.salaryRange || null,
      notes: parsed.data.notes || null,
      status: parsed.data.status ?? "SAVED",
    },
  });

  return NextResponse.json({ application: created }, { status: 201 });
}
