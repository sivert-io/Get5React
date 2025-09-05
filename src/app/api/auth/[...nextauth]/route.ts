import { NextRequest } from "next/server";
import SteamProvider, { SteamProfile } from "next-auth-steam";
import { PROVIDER_ID } from "next-auth-steam";
import NextAuth from "next-auth/next";
import { PrismaClient } from "@prisma/client";
import consola from "consola";
import { capName } from "@/common";

const prisma = new PrismaClient();

function isEnvAdmin(steamId: string): boolean {
  const list = process.env.ADMIN_STEAM_IDS || "";
  const ids = list
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  return ids.includes(steamId);
}

async function registerUser(profile: SteamProfile) {
  const existingUser = await prisma.user.findUnique({
    where: { steamID: profile.steamid },
  });

  if (!existingUser) {
    consola.info("Registering new user with id:", profile.steamid);

    const userCount = await prisma.user.count();
    const isAdmin = isEnvAdmin(profile.steamid) || userCount === 0;

    await prisma.user.create({
      data: {
        steamID: profile.steamid,
        isAdmin,
        name: capName(profile.personaname),
        avatar: profile.avatarfull,
      },
    });

    return isAdmin;
  } else {
    consola.info("Updating user", profile.steamid);

    const user = await prisma.user.update({
      where: { steamID: profile.steamid },
      data: {
        name: capName(profile.personaname),
        avatar: profile.avatarfull,
        // Keep admin if already admin, or grant if in env list
        isAdmin: existingUser.isAdmin || isEnvAdmin(profile.steamid),
      },
    });

    return user.isAdmin;
  }
}

async function handler(
  req: NextRequest,
  ctx: { params: { nextauth: string[] } }
) {
  return NextAuth(req, ctx, {
    providers: [
      SteamProvider(req, {
        clientSecret: process.env.STEAM_SECRET!,
        callbackUrl: new URL(
          `/api/auth/callback`,
          process.env.NEXTAUTH_URL || "http://localhost:3000"
        ),
      }),
    ],
    callbacks: {
      jwt: async ({ token, account, profile }) => {
        if (account?.provider === PROVIDER_ID) {
          token.steam = profile;

          // Register user if they don't exist and get isAdmin status
          if (profile) {
            const isAdmin = await registerUser(profile as SteamProfile);
            token.isAdmin = isAdmin; // Add isAdmin to the token
          }
        }

        return token;
      },
      session: ({ session, token }) => {
        if ("steam" in token) {
          // @ts-expect-error
          session.user.steam = {
            // @ts-expect-error
            ...token.steam,
            isAdmin: token.isAdmin, // Add isAdmin to session.user.steam
          };
        }

        return session;
      },
    },
  });
}

export { handler as GET, handler as POST };
