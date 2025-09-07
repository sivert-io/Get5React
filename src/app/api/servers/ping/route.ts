import { NextRequest } from "next/server";
import { PrismaClient } from "@prisma/client";
import Rcon from "ts-rcon";

const prisma = new PrismaClient();

async function pingRcon(host: string, port: number, password: string) {
  const start = Date.now();
  return new Promise<{ ok: boolean; ms?: number }>((resolve) => {
    const conn = new (Rcon as any)(host, port, password, {
      tcp: true,
      challenge: false,
    });
    let settled = false;
    conn
      .on("auth", () => {
        const ms = Date.now() - start;
        settled = true;
        conn.disconnect();
        resolve({ ok: true, ms });
      })
      .on("error", () => {
        if (!settled) {
          settled = true;
          resolve({ ok: false });
        }
      });
    conn.connect();
    setTimeout(() => {
      if (!settled) {
        settled = true;
        try {
          conn.disconnect();
        } catch {}
        resolve({ ok: false });
      }
    }, 5000);
  });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const id = Number(body.id);
  if (!id) return Response.json({ error: "Missing id" }, { status: 400 });
  const server = await prisma.server.findUnique({ where: { id } });
  if (!server) return Response.json({ error: "Not found" }, { status: 404 });
  const res = await pingRcon(server.host, server.port, server.rconPassword);
  await prisma.server.update({
    where: { id },
    data: {
      lastPingAt: new Date(),
      reachable: res.ok,
      lastPingMs: res.ms,
    },
  });
  return Response.json({ ok: res.ok, ms: res.ms });
}
