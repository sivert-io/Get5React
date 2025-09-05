"use client";

import { Badge, Card, Flex, Heading, Text } from "@radix-ui/themes";
import { formatDistance } from "date-fns";
import Image from "next/image";

export type MatchStatus = "upcoming" | "finished" | "live";

export interface MatchTeam {
  name: string;
  score?: number;
  isUserTeam?: boolean;
  logoUrl?: string;
}

export interface MatchSummaryProps {
  teamA: MatchTeam;
  teamB: MatchTeam;
  scheduledAt?: Date | string;
  status: MatchStatus;
}

export function MatchCard({
  teamA,
  teamB,
  scheduledAt,
  status,
}: MatchSummaryProps) {
  const scheduledDate = scheduledAt
    ? typeof scheduledAt === "string"
      ? new Date(scheduledAt)
      : scheduledAt
    : undefined;

  const isFinished = status === "finished";
  const isLive = status === "live";
  const isUpcoming = status === "upcoming";

  const teamAWon = isFinished && (teamA.score ?? 0) > (teamB.score ?? 0);
  const teamBWon = isFinished && (teamB.score ?? 0) > (teamA.score ?? 0);

  return (
    <Flex minWidth="330px" maxWidth="330px">
      <Card style={{ width: "100%" }}>
        <Flex direction="column" gap="3">
          <Flex align="center" justify="between">
            {isLive ? (
              <Badge variant="solid" color="yellow">
                Live
              </Badge>
            ) : (
              <span />
            )}
            {scheduledDate ? (
              <Text size="1" color="gray">
                {formatDistance(scheduledDate, new Date(), {
                  addSuffix: true,
                  includeSeconds: true,
                })}
              </Text>
            ) : null}
          </Flex>

          <Flex align="center" justify="between" gap="3">
            <TeamBlock
              name={teamA.name}
              score={teamA.score}
              highlight={!!teamA.isUserTeam}
              won={teamAWon}
              lost={teamBWon}
              logoUrl={teamA.logoUrl}
              align="left"
            />
            <Heading size="3">vs</Heading>
            <TeamBlock
              name={teamB.name}
              score={teamB.score}
              highlight={!!teamB.isUserTeam}
              won={teamBWon}
              lost={teamAWon}
              logoUrl={teamB.logoUrl}
              align="right"
            />
          </Flex>
        </Flex>
      </Card>
    </Flex>
  );
}

function TeamBlock({
  name,
  score,
  highlight,
  won,
  lost,
  logoUrl,
  align,
}: {
  name: string;
  score?: number;
  highlight?: boolean;
  won?: boolean;
  lost?: boolean;
  logoUrl?: string;
  align: "left" | "right";
}) {
  const color = won ? "green" : lost ? "red" : "gray";
  const borderColor =
    color === "green"
      ? "var(--green-9)"
      : color === "red"
        ? "var(--red-9)"
        : "var(--gray-8)";

  return (
    <Flex
      align="center"
      gap="2"
      style={{ flex: 1 }}
      justify={align === "left" ? "start" : "end"}
    >
      {align === "left" && <ScoreBadge color={color} score={score} />}

      <Flex align="center" gap="2">
        <Flex
          align="center"
          justify="center"
          style={{
            width: "56px",
            height: "56px",
            borderRadius: "50%",
            overflow: "hidden",
            border: `2px solid ${borderColor}`,
          }}
          aria-label={name}
          title={name}
        >
          {logoUrl ? (
            <Image src={logoUrl} alt="Team logo" width={56} height={56} />
          ) : (
            <Flex align="center" justify="center" width="100%" height="100%">
              <Text>{name.slice(0, 2).toUpperCase()}</Text>
            </Flex>
          )}
        </Flex>
      </Flex>

      {align === "right" && <ScoreBadge color={color} score={score} />}
    </Flex>
  );
}

function ScoreBadge({
  color,
  score,
}: {
  color: "green" | "red" | "gray";
  score?: number;
}) {
  return typeof score === "number" ? (
    <Badge variant="soft" color={color}>
      {score}
    </Badge>
  ) : (
    <Badge variant="soft" color="gray">
      TBD
    </Badge>
  );
}
