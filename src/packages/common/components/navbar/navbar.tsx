import {
  Avatar,
  Box,
  Button,
  Card,
  Flex,
  Heading,
  Popover,
  Separator,
  Skeleton,
  Text,
} from "@radix-ui/themes";
import Image from "next/image";
import Link from "next/link";
import React from "react";
import {
  BsCaretDownFill,
  BsHouseFill,
  BsListOl,
  BsPeopleFill,
  BsServer,
  BsShieldFill,
  BsSteam,
  BsTrophyFill,
} from "react-icons/bs";
import { NavLink } from "./navlink";
import { useSteam } from "@/common";

export function Navbar() {
  const { profile, signIn, signOut, isLoading } = useSteam();
  return (
    <Flex width="300px" direction="column" gap="4">
      <Flex height="36px" justify="center" align="center" gap="1">
        <Image alt="" aria-hidden src="/logo.svg" width={36} height={36} />
        <Heading size="7" as="h1">
          Get5React
        </Heading>
      </Flex>

      <Card style={{ padding: "24px" }}>
        <Flex direction="column" gap="4">
          {/* Profile */}
          <Flex height="48px" align="center" justify="center" gap="3">
            {profile ? (
              <Popover.Root>
                <Popover.Trigger>
                  <Box width={"100%"}>
                    <Card asChild style={{ padding: "12px 0" }}>
                      <button style={{ width: "100%" }}>
                        <Flex
                          align="center"
                          gap="2"
                          width="100%"
                          style={{ padding: "0 12px" }}
                        >
                          <Avatar
                            fallback={profile.personaname[0]}
                            src={profile.avatar}
                            alt="Profile picture"
                            size="2"
                          />
                          <Text
                            wrap="nowrap"
                            size="2"
                            style={{ flexGrow: 1 }}
                            truncate
                          >
                            {profile.personaname}
                          </Text>
                          <BsCaretDownFill />
                        </Flex>
                      </button>
                    </Card>
                  </Box>
                </Popover.Trigger>
                <Popover.Content
                  width="100%"
                  style={{
                    borderRadius: "8px",
                  }}
                >
                  <Flex gap="4" direction="column" style={{ padding: "0 4px" }}>
                    <Button
                      style={{ justifyContent: "start" }}
                      asChild
                      variant="ghost"
                      radius="large"
                      highContrast
                      size="3"
                    >
                      <Link href={`/players/${profile.steamid}`}>
                        My profile
                      </Link>
                    </Button>
                    <Button
                      style={{ justifyContent: "start" }}
                      onClick={signOut}
                      variant="ghost"
                      color="red"
                      radius="large"
                      size="3"
                    >
                      Sign out
                    </Button>
                  </Flex>
                </Popover.Content>
              </Popover.Root>
            ) : (
              <Skeleton loading={isLoading}>
                <Button onClick={signIn}>
                  <Flex align="center" gap="1">
                    Sign in with Steam
                    <BsSteam size={16} />
                  </Flex>
                </Button>
              </Skeleton>
            )}
          </Flex>

          <Separator
            style={{
              width: "100%",
            }}
          />

          {/* Nav */}
          <Flex direction="column" gap="4">
            <Heading size="3">Community</Heading>
            <NavLink href="/">
              <BsHouseFill />
              Home
            </NavLink>
            <NavLink href="/tournaments">
              <BsTrophyFill />
              Tournaments
            </NavLink>
            <NavLink href="/teams">
              <BsPeopleFill />
              Teams
            </NavLink>
            <NavLink href="/matches">
              <BsShieldFill />
              Matches
            </NavLink>
            <NavLink href="/leaderboard">
              <BsListOl />
              Leaderboard
            </NavLink>
            {/* <NavLink href="/players">
              <BsPersonFill />
              Players
            </NavLink> */}
            <NavLink href="/servers">
              <BsServer />
              Servers
            </NavLink>
          </Flex>

          {/* Admin */}
          {profile?.isAdmin && (
            <Flex direction="column" gap="4">
              <Heading size="3">Admin</Heading>
              <NavLink href="/admin/servers">
                <BsServer />
                Servers
              </NavLink>
              <NavLink href="/admin/tournaments">
                <BsTrophyFill />
                Tournaments
              </NavLink>
              <NavLink href="/admin/maps">
                <BsHouseFill />
                Maps
              </NavLink>
            </Flex>
          )}
        </Flex>
      </Card>
    </Flex>
  );
}
