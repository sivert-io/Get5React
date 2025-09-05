"use client";

import { Prisma } from "@prisma/client";
import { Badge, Card, Flex, FlexProps, Heading, Text } from "@radix-ui/themes";
import Image from "next/image";
import React from "react";
import { formatDistance } from "date-fns";
import { getTypeName } from "../utils/name";
import { RankIcon, getPlayerColor } from "@/common";
import { useTournamentPreview } from "@/tournamentPreview";

type Tournament = Prisma.TournamentGetPayload<{
  include: { teams: true };
}>;

export function TournamentCard({
  data,
  props,
  variant = "default",
}: {
  data: Tournament;
  props?: FlexProps & React.RefAttributes<HTMLDivElement>;
  variant?: "default" | "compact";
}) {
  const { showTournamentPreview, setTournamentData } = useTournamentPreview();

  const {
    banner,
    description,
    isActive,
    isOpen,
    maxRating,
    maxTeams,
    name,
    startDate,
    teams,
    type,
  } = data;

  if (variant === "compact") {
    return (
      <Flex
        width="100%"
        height="100%"
        minWidth="300px"
        maxWidth="300px"
        {...props}
      >
        <Card
          asChild
          style={{
            userSelect: "none",
            padding: 0,
          }}
        >
          <button
            onClick={() => {
              setTournamentData(data);
              showTournamentPreview();
            }}
          >
            <Flex direction="column" gap="2" height="100%" width="100%" p="3">
              {/* Title and status */}
              <Flex justify="between" align="start">
                <Heading size="3" style={{ lineHeight: 1.1 }}>
                  {name}
                </Heading>
                {!isActive ? (
                  <Badge variant="solid" color="red">
                    Ended
                  </Badge>
                ) : (
                  <Badge variant="solid" color={isOpen ? "green" : "red"}>
                    {isOpen ? "Open" : "Closed"}
                  </Badge>
                )}
              </Flex>

              {/* Meta */}
              <Flex align="center" gap="2">
                <Badge color="gray">{getTypeName(type)}</Badge>
                <Badge color="gray">{`${teams.length} / ${maxTeams} Teams`}</Badge>
                <Text size="1" color="gray">
                  {formatDistance(startDate, new Date(), {
                    addSuffix: true,
                    includeSeconds: true,
                  })}
                </Text>
              </Flex>

              {/* Optional thumbnail (dimmed) */}
              {banner ? (
                <Image
                  draggable={false}
                  src={banner}
                  alt="Tournament banner"
                  style={{
                    objectFit: "cover",
                    objectPosition: "center",
                    width: "100%",
                    height: "96px",
                    borderRadius: 6,
                    filter: "grayscale(40%) contrast(90%) brightness(80%)",
                  }}
                  width={294}
                  height={96}
                />
              ) : null}

              {/* Description (truncated) */}
              <Text
                size="1"
                color="gray"
                style={{
                  display: "-webkit-box",
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                }}
              >
                {description}
              </Text>

              {/* Rank cap */}
              {maxRating !== 0 && (
                <Badge color={getPlayerColor(maxRating * 1000)}>
                  <Flex align="center" gap="1">
                    <RankIcon />
                    {`${maxRating}K`}
                  </Flex>
                </Badge>
              )}
            </Flex>
          </button>
        </Card>
      </Flex>
    );
  }

  return (
    <Flex
      width="100%"
      height="100%"
      minWidth="330px"
      maxWidth="330px"
      {...props}
    >
      <Card
        asChild
        style={{
          userSelect: "none",
          padding: 0,
        }}
      >
        <button
          onClick={() => {
            setTournamentData(data);
            showTournamentPreview();
          }}
        >
          <Flex direction="column" gap="2" height="100%" width="100%">
            {/* Banner */}
            <Image
              draggable={false}
              src={banner}
              alt="Tournament Banner Display"
              style={{
                objectFit: "cover",
                objectPosition: "center",
                width: "100%",
                height: "120px",
                filter: "grayscale(30%) contrast(90%) brightness(85%)",
              }}
              width={350}
              height={120}
            />

            {/* Main Content */}
            <Flex
              gap="4"
              direction="column"
              justify="between"
              flexGrow="1"
              p="4"
            >
              <Flex gap="2" direction="column">
                {/* Title + date */}
                <Flex direction="column" gap="1">
                  <Heading size="4">{name}</Heading>
                  <Text color="gray" size="1">
                    {formatDistance(startDate, new Date(), {
                      addSuffix: true,
                      includeSeconds: true,
                    })}
                  </Text>
                </Flex>

                {/* Description */}
                <Text
                  size="1"
                  color="gray"
                  style={{
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                  }}
                >
                  {description}
                </Text>
              </Flex>

              {/* Tags */}
              <Flex align="center" gap="2">
                <Badge color="gray">{getTypeName(type)}</Badge>
                <Badge color="gray">{`${teams.length} / ${maxTeams} Teams`}</Badge>
                {maxRating !== 0 && (
                  <Badge color={getPlayerColor(maxRating * 1000)}>
                    <Flex align="center" gap="1">
                      <RankIcon />
                      {`${maxRating}K`}
                    </Flex>
                  </Badge>
                )}
              </Flex>
            </Flex>

            {/* Open/Closed */}
            <Flex position="absolute" top="2" right="2">
              {!isActive ? (
                <Badge variant="solid" color="red">
                  Ended
                </Badge>
              ) : (
                <Badge variant="solid" color={isOpen ? "green" : "red"}>
                  {isOpen ? "Open" : "Closed"}
                </Badge>
              )}
            </Flex>
          </Flex>
        </button>
      </Card>
    </Flex>
  );
}
