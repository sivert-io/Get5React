import { PrismaClient } from "@prisma/client";
import { NextRequest } from "next/server";

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  const search = req.nextUrl.searchParams;
  const teamIdParam = search.get("teamId");
  const steamIdParam = search.get("steamId");
  const limitParam = search.get("limit");

  let teamId: number | null = null;

  try {
    if (teamIdParam) {
      teamId = Number(teamIdParam);
    } else if (steamIdParam) {
      const user = await prisma.user.findUnique({
        where: { steamID: steamIdParam },
        select: { teamId: true },
      });
      teamId = user?.teamId ?? null;
    }

    if (!teamId) {
      return Response.json({ matches: [] });
    }

    const limit = Math.min(Number(limitParam ?? 10) || 10, 50);

    const matches = await prisma.match.findMany({
      where: {
        OR: [{ team1Id: teamId }, { team2Id: teamId }],
      },
      include: {
        team1: true,
        team2: true,
        Tournament: { select: { id: true, name: true } },
      },
      orderBy: { date: "desc" },
      take: limit,
    });

    return Response.json({ matches });
  } catch (error) {
    return Response.json({ matches: [], error: "Failed to fetch matches" }, { status: 500 });
  }
}


