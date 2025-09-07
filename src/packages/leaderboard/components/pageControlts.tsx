"use client";

import { UserType } from "@/common";
import { Flex, IconButton, Select, Text, TextField } from "@radix-ui/themes";
import { Table } from "@tanstack/react-table";
import { useState } from "react";
import { BsCaretLeftFill, BsCaretRightFill } from "react-icons/bs";

export function PageControls({ table }: { table: Table<UserType> }) {
  const [isFoucsed, setIsFoucsed] = useState(false);
  const [pageInput, setPageInput] = useState<string>(
    String(table.getState().pagination.pageIndex + 1)
  );
  return (
    <Flex align="center" gap="4">
      <Flex gap="2" align="center">
        <Text>Items per page:</Text>
        <Select.Root
          value={table.getState().pagination.pageSize.toString()}
          onValueChange={(e) => {
            table.setPageSize(Number(e));
          }}
        >
          <Select.Trigger />
          <Select.Content>
            <Select.Group>
              {[10, 20, 30, 40, 50].map((pageSize) => (
                <Select.Item key={pageSize} value={pageSize.toString()}>
                  {pageSize}
                </Select.Item>
              ))}
            </Select.Group>
          </Select.Content>
        </Select.Root>
      </Flex>

      <TextField.Root
        placeholder="Filter name"
        onChange={(e) =>
          table.getFlatHeaders()[2].column.setFilterValue(e.target.value)
        }
        value={
          (table.getFlatHeaders()[2].column.getFilterValue() ?? "") as string
        }
      />
      <Flex justify="center" align="center" gap="3">
        <IconButton
          onClick={table.previousPage}
          disabled={!table.getCanPreviousPage()}
          variant="soft"
        >
          <BsCaretLeftFill />
        </IconButton>
        <Flex align="center" gap="2">
          <TextField.Root
            type="number"
            style={{
              width: "64px",
            }}
            value={
              !isFoucsed
                ? String(table.getState().pagination.pageIndex + 1)
                : pageInput
            }
            onFocus={() => setIsFoucsed(true)}
            onBlur={() => {
              setIsFoucsed(false);
              const page = pageInput ? Number(pageInput) - 1 : 0;
              table.setPageIndex(page);
            }}
            onChange={(e) => setPageInput(e.target.value)}
            className="border p-1 rounded w-16"
          />
          <Text>of {table.getPageCount()}</Text>
        </Flex>
        <IconButton
          onClick={table.nextPage}
          disabled={!table.getCanNextPage()}
          variant="soft"
        >
          <BsCaretRightFill />
        </IconButton>
      </Flex>
    </Flex>
  );
}
