import { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import { promises as fs } from "fs";
import path from "path";

export async function POST(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  if (!token?.isAdmin)
    return Response.json({ error: "Unauthorized" }, { status: 401 });

  const form = await req.formData();
  const file = form.get("file") as unknown as File | null;
  if (!file) return Response.json({ error: "Missing file" }, { status: 400 });

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const uploadsDir = path.join(process.cwd(), "public", "uploads");
  await fs.mkdir(uploadsDir, { recursive: true });

  const ext = path.extname(file.name) || ".bin";
  const name = `upload_${Date.now()}_${Math.random().toString(36).slice(2)}${ext}`;
  const fullPath = path.join(uploadsDir, name);

  await fs.writeFile(fullPath, buffer);

  return Response.json({ url: `/uploads/${name}` });
}
