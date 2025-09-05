"use client";

import { Header } from "@/common";
import axios from "axios";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Badge, Card, Flex, Heading, Text } from "@radix-ui/themes";
import { formatDistance } from "date-fns";

export default function TournamentDetails() {
  const params = useParams<{ id: string }>();
  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!params?.id) return;
    setLoading(true);
    axios
      .get(`/api/tournaments/${params.id}`)
      .then((res) => setData(res.data.tournament ?? null))
      .finally(() => setLoading(false));
  }, [params?.id]);

  if (loading)
    return (
      <Flex direction="column" gap="4">
        <Header>Tournament</Header>
        <Text color="gray">Loading…</Text>
      </Flex>
    );

  if (!data)
    return (
      <Flex direction="column" gap="4">
        <Header>Tournament</Header>
        <Text color="red">Not found</Text>
      </Flex>
    );

  return (
    <Flex direction="column" gap="4">
      <Header>{data.name}</Header>
      <Card>
        <Flex direction="column" gap="3" p="3">
          {data.banner ? (
            <Image
              src={data.banner}
              alt="Banner"
              width={1000}
              height={240}
              style={{
                width: "100%",
                height: 240,
                objectFit: "cover",
                borderRadius: 8,
              }}
            />
          ) : null}
          <Text color="gray">{data.description}</Text>
          <Text size="1" color="gray">
            Starts{" "}
            {formatDistance(new Date(data.startDate), new Date(), {
              addSuffix: true,
              includeSeconds: true,
            })}
          </Text>
          <Flex gap="2" align="center">
            <Badge color="gray">{data.type}</Badge>
            <Badge color="gray">{`${data.teams.length} / ${data.maxTeams} Teams`}</Badge>
          </Flex>
        </Flex>
      </Card>

      {data.matches?.length ? (
        <Flex direction="column" gap="2">
          <Heading size="4">Matches</Heading>
          {data.matches.map((m: any) => (
            <Card key={m.id}>
              <Flex p="3" justify="between">
                <Text>
                  {m.team1.name} vs {m.team2.name}
                </Text>
                <Text color="gray">{new Date(m.date).toLocaleString()}</Text>
              </Flex>
            </Card>
          ))}
        </Flex>
      ) : null}
    </Flex>
  );
}
