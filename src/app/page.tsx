"use client";

import {
  Header,
  RankIcon,
  getPlayerColor,
  Carousel,
  MatchCard,
  useSteam,
} from "@/common";
import axios from "axios";
import { useEffect, useMemo, useState } from "react";
import { Badge, Card, Flex, Grid, Heading, Text } from "@radix-ui/themes";
import Image from "next/image";
// import { fakeTournaments } from "@/fakeData";
import { formatDistance } from "date-fns";
import { getTypeName } from "@/tournament";
import Link from "next/link";

type Tournament = {
  id: number;
  name: string;
  description: string;
  banner: string;
  type: string;
  startDate: string;
  endDate?: string;
  maxTeams: number;
  teams: any[];
  maxRating: number;
};
const [placeholder] = [
  {
    id: 0,
    name: "Featured Tournament",
    description: "",
    banner: "/banner_example.png",
    type: "SingleElimination",
    startDate: new Date().toISOString(),
    maxTeams: 16,
    teams: [],
    maxRating: 0,
  } as Tournament,
];
let fakeTourney: Tournament = placeholder;
const isRunning = (t: Tournament) => {
  const now = new Date();
  const start = new Date(t.startDate);
  const end = new Date(t.endDate ?? t.startDate);
  return start <= now && end >= now;
};

type MatchWithTeams = {
  id: number;
  date: string;
  team1: { id: number; name: string };
  team2: { id: number; name: string };
  team1Id: number;
  team2Id: number;
  team1Score: number;
  team2Score: number;
  winnerId: number;
  Tournament?: { id: number; name: string } | null;
};

export default function Home() {
  const { profile } = useSteam();
  const [matches, setMatches] = useState<MatchWithTeams[]>([]);
  const [isLoadingMatches, setIsLoadingMatches] = useState(true);
  const [scrollIndex, setScrollIndex] = useState<number | undefined>(undefined);

  const userTeamId = useMemo(() => profile?.teamId ?? null, [profile]);
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [isLoadingTournaments, setIsLoadingTournaments] = useState(true);

  useEffect(() => {
    if (!profile?.steamid) {
      setIsLoadingMatches(false);
      setMatches([]);
      return;
    }

    setIsLoadingMatches(true);
    axios
      .get(`/api/matches?steamId=${profile.steamid}&limit=10`)
      .then((res) => setMatches(res.data.matches ?? []))
      .catch(() => setMatches([]))
      .finally(() => setIsLoadingMatches(false));
  }, [profile?.steamid]);

  // Fetch tournaments
  useEffect(() => {
    setIsLoadingTournaments(true);
    axios
      .get("/api/tournaments")
      .then((res) => {
        const ts: Tournament[] = (res.data.tournaments ?? []).map(
          (t: any) =>
            ({
              id: t.id,
              name: t.name,
              description: t.description,
              banner: t.banner,
              type: t.type,
              startDate: t.startDate,
              maxTeams: t.maxTeams,
              teams: t.teams ?? [],
              maxRating: t.maxRating,
              // keep endDate internally for running calc
              endDate: t.endDate,
            }) as any
        );
        setTournaments(ts);
        const running = ts.find((t) => isRunning(t));
        const upcoming = ts
          .filter((t) => new Date(t.startDate) > new Date())
          .sort((a, b) => +new Date(a.startDate) - +new Date(b.startDate))[0];
        fakeTourney = running || upcoming || placeholder;
      })
      .catch(() => {
        setTournaments([]);
        fakeTourney = placeholder;
      })
      .finally(() => setIsLoadingTournaments(false));
  }, []);

  // Decide which match to focus: live > upcoming > most recent
  useEffect(() => {
    if (matches.length === 0) {
      setScrollIndex(undefined);
      return;
    }
    const now = new Date();
    const liveIdx = matches.findIndex(
      (m) => !m.winnerId && new Date(m.date) <= now
    );
    if (liveIdx >= 0) {
      setScrollIndex(liveIdx);
      return;
    }
    const upcomingIdx = matches.findIndex((m) => new Date(m.date) > now);
    if (upcomingIdx >= 0) {
      setScrollIndex(upcomingIdx);
      return;
    }
    setScrollIndex(0);
  }, [matches]);

  return (
    <Flex direction="column" gap="4">
      <Header>Home</Header>
      {/* Your tournaments / matches */}
      <Flex direction="column" gap="2">
        <Heading size="4">Your matches</Heading>
        {isLoadingMatches ? (
          <Text color="gray">Loading matches…</Text>
        ) : matches.length === 0 ? (
          <Text color="gray">No recent matches.</Text>
        ) : (
          <Carousel scrollToIndex={scrollIndex}>
            {matches.map((m) => {
              const isFinished = typeof m.winnerId === "number";
              const status = isFinished
                ? "finished"
                : new Date(m.date) > new Date()
                  ? "upcoming"
                  : "live";
              const isUserTeamA =
                userTeamId != null && m.team1Id === userTeamId;
              const isUserTeamB =
                userTeamId != null && m.team2Id === userTeamId;
              return (
                <MatchCard
                  key={m.id}
                  status={status}
                  scheduledAt={m.date}
                  teamA={{
                    name: m.team1.name,
                    score: isFinished ? m.team1Score : undefined,
                    isUserTeam: isUserTeamA,
                    logoUrl: (m.team1 as any).logo,
                  }}
                  teamB={{
                    name: m.team2.name,
                    score: isFinished ? m.team2Score : undefined,
                    isUserTeam: isUserTeamB,
                    logoUrl: (m.team2 as any).logo,
                  }}
                />
              );
            })}
          </Carousel>
        )}
      </Flex>
      {/* Featured running tournament */}
      {isLoadingTournaments ? null : tournaments.length > 0 &&
        fakeTourney.id !== 0 ? (
        <Card asChild>
          <Link href={`/tournaments/${fakeTourney.id}`}>
            <Grid columns="2" gap="4" height="300px">
              <Card
                style={{
                  position: "relative",
                }}
              >
                <Image
                  src={fakeTourney.banner}
                  alt=""
                  style={{
                    position: "absolute",
                    width: "100%",
                    height: "100%",
                    inset: 0,
                  }}
                  width={534}
                  height={300}
                />
              </Card>
              <Flex direction="column" justify="between">
                <Flex direction="column" gap="4">
                  <Flex direction="column" gap="1">
                    <Heading>{fakeTourney.name}</Heading>
                    <Heading size="4" color="gray">
                      {formatDistance(
                        new Date(fakeTourney.startDate),
                        new Date(),
                        {
                          addSuffix: true,
                          includeSeconds: true,
                        }
                      )}
                    </Heading>
                  </Flex>
                  <Text>{fakeTourney.description}</Text>

                  <Flex align="center" gap="2">
                    <Badge color="gray">{getTypeName(fakeTourney.type)}</Badge>
                    <Badge color="gray">{`${fakeTourney.teams.length} / ${fakeTourney.maxTeams} Teams`}</Badge>
                    {fakeTourney.maxRating !== 0 && (
                      <Badge
                        color={getPlayerColor(fakeTourney.maxRating * 1000)}
                      >
                        <Flex align="center" gap="1">
                          <RankIcon />
                          {`${fakeTourney.maxRating}K`}
                        </Flex>
                      </Badge>
                    )}
                  </Flex>
                </Flex>
              </Flex>
            </Grid>
          </Link>
        </Card>
      ) : null}

      {/* Upcoming tournaments */}
      <Flex direction="column" gap="2">
        <Heading size="4">Upcoming tournaments</Heading>
        {isLoadingTournaments ? (
          <Text color="gray">Loading…</Text>
        ) : (
          <Carousel>
            {tournaments
              .filter((t) => new Date(t.startDate) > new Date())
              .sort((a, b) => +new Date(a.startDate) - +new Date(b.startDate))
              .slice(0, 10)
              .map((t) => (
                <Card key={t.id} asChild>
                  <Link href={`/tournaments/${t.id}`}>
                    <Flex direction="column" gap="2" width="330px">
                      <Image
                        src={t.banner}
                        alt=""
                        style={{
                          objectFit: "cover",
                          width: "330px",
                          height: "120px",
                        }}
                        width={330}
                        height={120}
                      />
                      <Flex direction="column" gap="1" p="3">
                        <Heading size="3">{t.name}</Heading>
                        <Text size="1" color="gray">
                          {formatDistance(new Date(t.startDate), new Date(), {
                            addSuffix: true,
                            includeSeconds: true,
                          })}
                        </Text>
                        <Flex align="center" gap="2">
                          <Badge color="gray">{getTypeName(t.type)}</Badge>
                          <Badge color="gray">{`${t.teams.length} / ${t.maxTeams} Teams`}</Badge>
                        </Flex>
                      </Flex>
                    </Flex>
                  </Link>
                </Card>
              ))}
          </Carousel>
        )}
      </Flex>
    </Flex>
  );
}
