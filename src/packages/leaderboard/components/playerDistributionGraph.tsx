"use client";

import { ResponsiveLine, Serie } from "@nivo/line";
import { Card, Flex, Heading, Skeleton } from "@radix-ui/themes";
import React from "react";

export function PlayerDistributionGraph({
  rankDistribution,
  highestUserAmount,
  loading = false,
}: {
  rankDistribution: Serie;
  highestUserAmount: number;
  loading?: boolean;
}) {
  return (
    <Flex direction="column" gap="2">
      <Heading>Rank distribution</Heading>
      <Skeleton loading={loading}>
        <Card>
          <Flex height="512px">
            {rankDistribution.data.length === 0 && !loading ? null : (
              <ResponsiveLine
                curve="basis"
                enableArea
                areaOpacity={0.05}
                colors={["var(--accent-11)"]}
                data={[rankDistribution]}
                margin={{ top: 16, right: 16, bottom: 72, left: 64 }}
                enablePointLabel
                pointLabelYOffset={-20}
                pointSize={8}
                pointColor={{ theme: "background" }}
                pointBorderWidth={2}
                pointBorderColor={{ from: "serieColor" }}
                theme={{
                  grid: {
                    line: {
                      stroke: "var(--gray-5)",
                    },
                  },
                  text: {
                    fill: "var(--gray-9)",
                    fontWeight: 700,
                  },
                  axis: {
                    ticks: {
                      text: {
                        fill: "var(--gray-9)",
                        fontWeight: 700,
                      },
                    },
                    legend: {
                      text: {
                        fill: "var(--gray-10)",
                        fontWeight: 700,
                      },
                    },
                  },
                }}
                yScale={{
                  type: "linear",
                  min: 0,
                  max: highestUserAmount + highestUserAmount / 10,
                }}
                axisTop={null}
                axisRight={null}
                axisBottom={{
                  tickSize: 5,
                  tickPadding: 5,
                  tickRotation: 0,
                  legend: "Rating",
                  legendOffset: 60,
                  legendPosition: "middle",
                  renderTick: (tick) => (
                    <g transform={`translate(${tick.x},${tick.y + 16})`}>
                      <text
                        y={4}
                        textAnchor="middle"
                        style={{
                          fill: "var(--gray-9)", // Change this to your desired text color
                          fontSize: 12,
                        }}
                        dangerouslySetInnerHTML={{
                          __html: tick.value.split("-")[0],
                        }}
                      />
                      <text
                        y={16}
                        textAnchor="middle"
                        style={{
                          fill: "var(--gray-9)", // Change this to your desired text color
                          fontSize: 12,
                        }}
                      >
                        -
                      </text>
                      <text
                        y={28}
                        textAnchor="middle"
                        style={{
                          fill: "var(--gray-9)", // Change this to your desired text color
                          fontSize: 12,
                        }}
                        dangerouslySetInnerHTML={{
                          __html: tick.value.split("-")[1],
                        }}
                      />
                    </g>
                  ),
                }}
                axisLeft={{
                  tickSize: 5,
                  tickPadding: 5,
                  tickRotation: 0,
                  legend: "Players",
                  legendOffset: -48,
                  legendPosition: "middle",
                }}
              />
            )}
          </Flex>
        </Card>
      </Skeleton>
      {!loading && rankDistribution.data.length === 0 ? (
        <Flex align="center" justify="center">
          <Heading size="3">No players found.</Heading>
        </Flex>
      ) : null}
    </Flex>
  );
}
