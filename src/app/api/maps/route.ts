import { NextRequest } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getToken } from "next-auth/jwt";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const maps = await prisma.map.findMany();
    return Response.json({ maps });
  } catch (e: any) {
    return Response.json(
      { error: e?.message || "Failed to fetch maps" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  if (!token?.isAdmin)
    return Response.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const displayName: string = body.display_name || body.name;
  if (!displayName)
    return Response.json({ error: "display_name required" }, { status: 400 });

  const dataName = (body.data_name || displayName)
    .toLowerCase()
    .replace(/\s+/g, "_")
    .replace(/[^a-z0-9_]/g, "");

  const preview: string = body.preview || "/banner_example.png";

  try {
    const created = await prisma.map.create({
      data: { display_name: displayName, data_name: dataName, preview },
    });
    return Response.json({ map: created }, { status: 201 });
  } catch (e) {
    return Response.json({ error: "Failed to create map" }, { status: 400 });
  }
}

export async function PUT(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  if (!token?.isAdmin)
    return Response.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const id = Number(body.id);
  if (!id) return Response.json({ error: "Missing id" }, { status: 400 });

  const displayName: string | undefined = body.display_name || body.name;
  const dataName: string | undefined = body.data_name;
  const preview: string | undefined = body.preview;

  try {
    const updated = await prisma.map.update({
      where: { id },
      data: {
        display_name: displayName,
        data_name: dataName,
        preview,
      },
    });
    return Response.json({ map: updated });
  } catch (e) {
    return Response.json({ error: "Failed to update map" }, { status: 400 });
  }
}

export async function DELETE(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  if (!token?.isAdmin)
    return Response.json({ error: "Unauthorized" }, { status: 401 });

  const id = Number(req.nextUrl.searchParams.get("id"));
  if (!id) return Response.json({ error: "Missing id" }, { status: 400 });
  try {
    const deleted = await prisma.map.delete({ where: { id } });
    return Response.json({ map: deleted });
  } catch (e) {
    return Response.json({ error: "Failed to delete map" }, { status: 400 });
  }
}
