"use client";

import { Header, RankCard, StatCard, getPlayerColor, getUser } from "@/common";
import {
  Avatar,
  Badge,
  Box,
  Card,
  Flex,
  Heading,
  IconButton,
  Text,
  Tooltip,
  useThemeContext,
  Skeleton,
} from "@radix-ui/themes";
import axios from "axios";
import Link from "next/link";
import { useEffect, useState } from "react";
import { BsStars, BsSteam } from "react-icons/bs";

export default function Page({ params }: { params: { id: string } }) {
  const [user, setUser] = useState<getUser | undefined>(undefined);
  const accentColor = useThemeContext().accentColor;

  useEffect(() => {
    axios.get(`/api/user?id=${params.id}`).then((res) => {
      setUser(res.data.user);
    });
  }, []);

  return (
    <Flex direction="column" gap="4">
      <Header>Player</Header>
      {user === undefined && (
        <Skeleton loading>
          <Card>
            <Flex style={{ minHeight: 96 }} />
          </Card>
        </Skeleton>
      )}
      {user === null && <Text>User does not exist</Text>}
      {user && (
        <Card>
          <Flex align="center" justify="between">
            <Flex align="center" gap="2">
              <Avatar
                fallback={user.name[0]}
                src={user.avatar}
                alt="avatar"
                size="4"
              />
              <Heading
                color={
                  user.isAdmin ? accentColor : getPlayerColor(user.position)
                }
              >
                {user.name}
              </Heading>

              {user.isAdmin && (
                <Tooltip content="This user manages the site">
                  <Badge color={accentColor} size="1">
                    Administrator
                  </Badge>
                </Tooltip>
              )}
              {user.isBanned && user.bannedReason && (
                <Tooltip content={user.bannedReason}>
                  <Badge color="red" size="1">
                    BANNED
                  </Badge>
                </Tooltip>
              )}
              {user.team && (
                <Link href={`/team/${user.teamId}`}>
                  <Badge size="1">{user.team.name}</Badge>
                </Link>
              )}

              <Tooltip content="Leaderboard position">
                <Badge color={getPlayerColor(user.position) || "gray"} size="1">
                  <Flex align="center" gap="1">
                    <BsStars />
                    {user.position}
                  </Flex>
                </Badge>
              </Tooltip>
            </Flex>
            <Flex align="center" gap="5">
              <IconButton asChild size="3" variant="outline">
                <Link
                  target="_blank"
                  href={`https://steamcommunity.com/profiles/${params.id}`}
                >
                  <BsSteam />
                </Link>
              </IconButton>
            </Flex>
          </Flex>
        </Card>
      )}
      {user ? (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "16px",
          }}
        >
          <StatCard
            label="ELO Rating"
            value={<RankCard rating={user.rating} />}
          />
          <StatCard label="Matches played" value="54" />
          <StatCard label="Winrate" value="44 %" />
          <StatCard label="Kills" value="493" />
          <StatCard label="Deaths" value="318" />
          <StatCard label="Headshot %" value="64 %" />
          <StatCard label="Refrag attempt %" value="77 %" />
          <StatCard label="Refrag success %" value="48 %" />
        </div>
      ) : (
        <Flex gap="2" direction="column">
          {Array.from({ length: 2 }).map((_, i) => (
            <Skeleton loading key={i}>
              <Card>
                <Flex style={{ minHeight: 120 }} />
              </Card>
            </Skeleton>
          ))}
        </Flex>
      )}
      {user ? (
        <Flex direction="column" gap="2">
          <Heading>Map statistics</Heading>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: "16px",
            }}
          >
            <StatCard label="Dust 2" value="64 %" />
            <StatCard label="Inferno" value="54 %" />
            <StatCard label="Mirage" value="44 %" />
            <StatCard label="Nuke" value="39 %" />
            <StatCard label="Overpass" value="N/A" />
            <StatCard label="Vertigo" value="N/A" />
            <StatCard label="Ancient" value="N/A" />
            <StatCard label="Anubis" value="N/A" />
          </div>
        </Flex>
      ) : (
        <Skeleton loading>
          <Card>
            <Flex style={{ minHeight: 160 }} />
          </Card>
        </Skeleton>
      )}
    </Flex>
  );
}
