"use client";

import { UserType } from "@/common";
import { Button, Flex, Skeleton, Table, Text } from "@radix-ui/themes";
import React from "react";
import { BsCaretDownFill, BsCaretUpFill } from "react-icons/bs";
import { Table as TableCore } from "@tanstack/table-core";
import { flexRender } from "@tanstack/react-table";

export function LeaderboardTable({
  table,
  loading = false,
}: {
  table: TableCore<UserType>;
  loading?: boolean;
}) {
  return (
    <Flex direction="column" gap="2">
      <Skeleton loading={loading}>
        <Table.Root variant="surface">
          <Table.Header>
            {table.getHeaderGroups().map((headerGroup) => (
              <Table.Row key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <Table.ColumnHeaderCell
                    key={header.id}
                    colSpan={header.colSpan}
                    width={`${header.getSize()}px` || "auto"}
                  >
                    <Button
                      variant="ghost"
                      style={{ width: "100%", height: "100%" }}
                      onClick={header.column.getToggleSortingHandler()}
                      radius="medium"
                    >
                      <Flex width="100%" align="center" justify="start" gap="1">
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                        {{
                          asc: <BsCaretUpFill />,
                          desc: <BsCaretDownFill />,
                        }[header.column.getIsSorted() as string] ?? null}
                      </Flex>
                    </Button>
                  </Table.ColumnHeaderCell>
                ))}
              </Table.Row>
            ))}
          </Table.Header>
          <Table.Body>
            {table.getRowModel().rows.length === 0 && !loading ? (
              <Table.Row>
                <Table.Cell colSpan={table.getAllColumns().length}>
                  <Flex align="center" justify="center" py="3">
                    <Text>No players found.</Text>
                  </Flex>
                </Table.Cell>
              </Table.Row>
            ) : (
              table.getRowModel().rows.map((row) => (
                <Table.Row key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <Table.Cell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </Table.Cell>
                  ))}
                </Table.Row>
              ))
            )}
          </Table.Body>
        </Table.Root>
      </Skeleton>
      {loading ? (
        <Skeleton width="fit-content" loading>
          <Text weight="medium" size="1">
            Showing 0 of 0 players
          </Text>
        </Skeleton>
      ) : (
        <Text weight="medium" size="1">
          Showing {table.getRowModel().rows.length} of {table.getRowCount()}{" "}
          players
        </Text>
      )}
    </Flex>
  );
}
