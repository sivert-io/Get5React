"use client";

import { Header, UserType } from "@/common";
import { Flex } from "@radix-ui/themes";
import {
  PaginationState,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import axios from "axios";
import { useEffect, useState } from "react";
import { Serie } from "@nivo/line";
import {
  LeaderboardTable,
  PageControls,
  PlayerDistributionGraph,
  getRatingGroups,
  tableColumns,
} from "@/leaderboard";

export default function Leaderboard() {
  const [players, setPlayers] = useState<UserType[]>([]);
  const [rankDistribution, setRankDistribution] = useState<Serie>({
    data: [],
    id: "Rank distribution",
  });
  const [highestNumber, setHighestNumber] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  const table = useReactTable({
    columns: tableColumns,
    data: players,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onPaginationChange: setPagination,
    state: {
      pagination,
    },
  });

  useEffect(() => {
    axios
      .get("/api/users")
      .then((res) => {
        const users: UserType[] = res.data.users ?? [];

        const sorted = users.sort((a, b) => a.position - b.position);
        setPlayers(sorted);

        const distribution = getRatingGroups(sorted);
        setRankDistribution({
          id: "Rank distribution",
          data: distribution,
        });

        if (distribution.length > 0) {
          setHighestNumber(distribution.sort((a, b) => b.y - a.y)[0].y);
        } else {
          setHighestNumber(0);
        }
      })
      .catch(() => {
        setPlayers([]);
        setRankDistribution({ id: "Rank distribution", data: [] });
        setHighestNumber(0);
      })
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <Flex direction="column" gap="4" height="100%" pb="8">
      <Flex align="center" justify="between">
        <Header>Leaderboard</Header>
        <PageControls table={table} />
      </Flex>

      <LeaderboardTable table={table} loading={isLoading} />

      <PlayerDistributionGraph
        highestUserAmount={highestNumber}
        rankDistribution={rankDistribution}
        loading={isLoading}
      />
    </Flex>
  );
}
