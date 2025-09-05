import { NextRequest } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const id = Number(params.id);
  if (!id) return Response.json({ error: "Invalid id" }, { status: 400 });

  const tournament = await prisma.tournament.findUnique({
    where: { id },
    include: {
      teams: true,
      matches: {
        include: { team1: true, team2: true, map: true },
        orderBy: { date: "desc" },
      },
      maps: true,
    },
  });

  if (!tournament)
    return Response.json({ error: "Not found" }, { status: 404 });

  return Response.json({ tournament });
}
