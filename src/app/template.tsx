"use client";

import axios from "axios";
import { useEffect, useState } from "react";
import { Flex, Grid, ScrollArea } from "@radix-ui/themes";
import { Navbar, useSteam } from "@/common";
import { Wizard } from "@/wizard";

// Checks if any users exist. If no, show wizard
export default function Template({ children }: { children: React.ReactNode }) {
  const [doesUsersExist, setDoesUsersExist] = useState<boolean>(true);
  const { profile } = useSteam();

  useEffect(() => {
    if (!localStorage.getItem("usersExist"))
      // Check if users exist
      axios.get("/api/users?type=count").then((res) => {
        if (res.data.usersCount === 0) {
          localStorage.setItem("usersExist", "false");
          setDoesUsersExist(false);
        } else {
          localStorage.setItem("usersExist", "true");
          setDoesUsersExist(true);
        }
      });

    if (localStorage.getItem("usersExist") === "false" && profile) {
      localStorage.setItem("usersExist", "true");
      setDoesUsersExist(true);
    }
  }, [profile]);

  return (
    <ScrollArea
      style={{
        height: "100%",
        position: "absolute",
        inset: "0",
      }}
      scrollbars="vertical"
      type="always"
    >
      <Flex align="start" py={{ initial: "4", md: "8" }} justify="center">
        {doesUsersExist === true && (
          <Grid
            gap="4"
            height="100%"
            width="100%"
            maxWidth="1400px"
            columns="300px 1084px"
            align="stretch"
            px="4"
          >
            <Navbar />
            <div
              style={{
                position: "relative",
                height: "100%",
              }}
            >
              {children}
            </div>
          </Grid>
        )}
        {doesUsersExist === false && <Wizard />}
      </Flex>
    </ScrollArea>
  );
}
