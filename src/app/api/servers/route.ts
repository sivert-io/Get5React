import { NextRequest } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getToken } from "next-auth/jwt";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const servers = await prisma.server.findMany();
    return Response.json({ servers });
  } catch (e: any) {
    return Response.json(
      { error: e?.message || "Failed to fetch servers" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  if (!token?.isAdmin)
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  try {
    const server = await prisma.server.create({
      data: {
        name: body.name,
        host: body.host,
        port: Number(body.port),
        rconPassword: body.rconPassword,
        note: body.note ?? "",
        isEnabled: body.isEnabled ?? true,
      },
    });
    return Response.json({ server }, { status: 201 });
  } catch (e: any) {
    return Response.json(
      { error: e?.message || "Failed to create server" },
      { status: 400 }
    );
  }
}

export async function PUT(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  if (!token?.isAdmin)
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  try {
    const server = await prisma.server.update({
      where: { id: Number(body.id) },
      data: {
        name: body.name,
        host: body.host,
        port: body.port != null ? Number(body.port) : undefined,
        rconPassword: body.rconPassword,
        note: body.note,
        isEnabled: body.isEnabled,
      },
    });
    return Response.json({ server });
  } catch (e: any) {
    return Response.json(
      { error: e?.message || "Failed to update server" },
      { status: 400 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  if (!token?.isAdmin)
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  const id = Number(req.nextUrl.searchParams.get("id"));
  if (!id) return Response.json({ error: "Missing id" }, { status: 400 });
  try {
    const server = await prisma.server.delete({ where: { id } });
    return Response.json({ server });
  } catch (e: any) {
    return Response.json(
      { error: e?.message || "Failed to delete server" },
      { status: 400 }
    );
  }
}
