"use client";

import { Carousel, Header } from "@/common";
import { TournamentCard } from "@/tournament";
import { Button, Flex, Heading, Text } from "@radix-ui/themes";
import { BsArrowRight } from "react-icons/bs";
import axios from "axios";
import { useEffect, useMemo, useState } from "react";

function TournamentCategory({
  data,
  label,
  href,
  maxTournaments = 6,
}: {
  href: string;
  label: string;
  data: any[];
  maxTournaments?: number;
}) {
  return (
    <Flex direction="column" gap="2">
      <Flex justify="between" width="100%" align="end">
        <Heading size="5">{label}</Heading>
        {data.length > maxTournaments && (
          <Button variant="ghost">
            View all
            <BsArrowRight />
          </Button>
        )}
      </Flex>
      <Carousel showButtons>
        {data.slice(0, maxTournaments).map((tournament) => (
          <TournamentCard
            key={tournament.id}
            data={tournament}
            variant="compact"
          />
        ))}
      </Carousel>
    </Flex>
  );
}

export default function Tournaments() {
  const [tournaments, setTournaments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get("/api/tournaments")
      .then((res) => setTournaments(res.data.tournaments ?? []))
      .finally(() => setLoading(false));
  }, []);

  const now = new Date();
  const running = useMemo(
    () =>
      tournaments.filter(
        (t) => new Date(t.startDate) <= now && new Date(t.endDate) >= now
      ),
    [tournaments]
  );
  const upcoming = useMemo(
    () =>
      tournaments
        .filter((t) => new Date(t.startDate) > now)
        .sort((a, b) => +new Date(a.startDate) - +new Date(b.startDate)),
    [tournaments]
  );
  const ended = useMemo(
    () =>
      tournaments
        .filter((t) => new Date(t.endDate) < now)
        .sort((a, b) => +new Date(b.endDate) - +new Date(a.endDate)),
    [tournaments]
  );

  return (
    <Flex direction="column" gap="4" height="100%" pb="8">
      <Header>Tournaments</Header>

      {loading ? (
        <Text color="gray">Loading…</Text>
      ) : (
        <Flex direction="column" gap="64px">
          <TournamentCategory href="running" label="Running" data={running} />
          <TournamentCategory
            href="upcoming"
            label="Upcoming"
            data={upcoming}
          />
          <TournamentCategory href="ended" label="Ended" data={ended} />
        </Flex>
      )}
    </Flex>
  );
}
