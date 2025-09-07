import { NextRequest } from "next/server";
import { PrismaClient, TournamentType } from "@prisma/client";
import { getToken } from "next-auth/jwt";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const tournaments = await prisma.tournament.findMany({
      include: { teams: true, maps: true },
    });
    return Response.json({ tournaments });
  } catch (e: any) {
    return Response.json(
      { error: e?.message || "Failed to fetch tournaments" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  if (!token?.isAdmin) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await req.json();

  function computeRequiredServers(type: TournamentType, maxTeams: number) {
    const teams = Math.max(2, Number(maxTeams) || 2);
    switch (type) {
      case "SingleElimination":
      case "Swiss":
      case "RoundRobin":
        return Math.ceil(teams / 2);
      case "DoubleElimination":
        return Math.ceil(teams / 2) + Math.ceil(teams / 4);
      default:
        return Math.ceil(teams / 2);
    }
  }

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
    // No pre-allocation: we auto-pick at start; return capacity info only
    const start = new Date(createData.startDate);
    const end = new Date(createData.endDate);
    const overlapping = await prisma.tournament.findMany({
      where: {
        AND: [{ endDate: { gte: start } }, { startDate: { lte: end } }],
      },
      select: { id: true, name: true, type: true, maxTeams: true },
    });
    const serversEnabled = await prisma.server.count({
      where: { isEnabled: true },
    });
    const overlapNeeded = overlapping.reduce(
      (acc, t) => acc + computeRequiredServers(t.type, t.maxTeams),
      0
    );
    const thisNeeded = computeRequiredServers(
      createData.type,
      createData.maxTeams
    );
    const totalNeeded = overlapNeeded + thisNeeded;
    const capacityOk = serversEnabled >= totalNeeded;

    const created = await prisma.tournament.create({ data: createData });
    if (Array.isArray(body.mapIds) && body.mapIds.length > 0) {
      await prisma.map.updateMany({
        where: { id: { in: body.mapIds } },
        data: { tournamentId: created.id },
      });
    }
    const requiredServers = computeRequiredServers(
      createData.type,
      createData.maxTeams
    );
    return Response.json(
      {
        tournament: created,
        requiredServers,
        capacityOk,
        serversEnabled,
        totalNeeded,
        overlapCount: overlapping.length,
      },
      { status: 201 }
    );
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

  function computeRequiredServers(type: TournamentType, maxTeams: number) {
    const teams = Math.max(2, Number(maxTeams) || 2);
    switch (type) {
      case "SingleElimination":
      case "Swiss":
      case "RoundRobin":
        return Math.ceil(teams / 2);
      case "DoubleElimination":
        return Math.ceil(teams / 2) + Math.ceil(teams / 4);
      default:
        return Math.ceil(teams / 2);
    }
  }

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
    const existing = await prisma.tournament.findUnique({
      where: { id: Number(body.id) },
      select: { startDate: true, endDate: true },
    });
    const start = updateData.startDate ?? existing?.startDate!;
    const end = updateData.endDate ?? existing?.endDate!;
    const overlapping = await prisma.tournament.findMany({
      where: {
        id: { not: Number(body.id) },
        AND: [{ endDate: { gte: start } }, { startDate: { lte: end } }],
      },
      select: { id: true, name: true, type: true, maxTeams: true },
    });
    const serversEnabled = await prisma.server.count({
      where: { isEnabled: true },
    });
    const overlapNeeded = overlapping.reduce(
      (acc, t) => acc + computeRequiredServers(t.type, t.maxTeams),
      0
    );
    const thisNeeded = computeRequiredServers(
      updateData.type,
      updateData.maxTeams
    );
    const totalNeeded = overlapNeeded + thisNeeded;
    const capacityOk = serversEnabled >= totalNeeded;

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
    const requiredServers = computeRequiredServers(
      updateData.type,
      updateData.maxTeams
    );
    return Response.json({
      tournament: updated,
      requiredServers,
      capacityOk,
      serversEnabled,
      totalNeeded,
      overlapCount: overlapping.length,
    });
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
