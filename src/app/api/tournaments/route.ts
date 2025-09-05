import { NextRequest } from "next/server";
import { PrismaClient, TournamentType } from "@prisma/client";
import { getToken } from "next-auth/jwt";

const prisma = new PrismaClient();

export async function GET() {
  const tournaments = await prisma.tournament.findMany({
    include: { teams: true, maps: true },
  });
  return Response.json({ tournaments });
}

export async function POST(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  if (!token?.isAdmin) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await req.json();
  try {
    const createData: any = {
      name: body.name,
      description: body.description ?? "",
      type: (body.type as TournamentType) ?? "SingleElimination",
      logo: body.logo ?? "",
      banner: body.banner ?? "/banner_example.png",
      isActive: body.isActive ?? true,
      isPublic: body.isPublic ?? true,
      isOpen: body.isOpen ?? true,
      maxRating: body.maxRating ?? 0,
      startDate: body.startDate ? new Date(body.startDate) : new Date(),
      endDate: body.endDate
        ? new Date(body.endDate)
        : new Date(Date.now() + 86400000),
      maxTeams: body.maxTeams ?? 16,
    };
    if (body.formatConfig !== undefined)
      createData.formatConfig = body.formatConfig;
    const created = await prisma.tournament.create({ data: createData });
    if (Array.isArray(body.mapIds) && body.mapIds.length > 0) {
      await prisma.map.updateMany({
        where: { id: { in: body.mapIds } },
        data: { tournamentId: created.id },
      });
    }
    return Response.json({ tournament: created }, { status: 201 });
  } catch (e) {
    return Response.json(
      { error: "Failed to create tournament" },
      { status: 400 }
    );
  }
}

export async function PUT(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  if (!token?.isAdmin) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await req.json();
  try {
    const updateData: any = {
      name: body.name,
      description: body.description,
      type: body.type as TournamentType,
      logo: body.logo,
      banner: body.banner,
      isActive: body.isActive,
      isPublic: body.isPublic,
      isOpen: body.isOpen,
      maxRating: body.maxRating,
      startDate: body.startDate ? new Date(body.startDate) : undefined,
      endDate: body.endDate ? new Date(body.endDate) : undefined,
      maxTeams: body.maxTeams,
    };
    if (body.formatConfig !== undefined)
      updateData.formatConfig = body.formatConfig;
    const updated = await prisma.tournament.update({
      where: { id: Number(body.id) },
      data: updateData,
    });
    if (Array.isArray(body.mapIds)) {
      const id = Number(body.id);
      // Clear existing assignments
      await prisma.map.updateMany({
        where: { tournamentId: id },
        data: { tournamentId: null },
      });
      if (body.mapIds.length > 0) {
        await prisma.map.updateMany({
          where: { id: { in: body.mapIds } },
          data: { tournamentId: id },
        });
      }
    }
    return Response.json({ tournament: updated });
  } catch (e) {
    return Response.json(
      { error: "Failed to update tournament" },
      { status: 400 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  if (!token?.isAdmin) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  const id = Number(req.nextUrl.searchParams.get("id"));
  if (!id) return Response.json({ error: "Missing id" }, { status: 400 });
  try {
    const deleted = await prisma.tournament.delete({ where: { id } });
    return Response.json({ tournament: deleted });
  } catch (e) {
    return Response.json(
      { error: "Failed to delete tournament" },
      { status: 400 }
    );
  }
}
