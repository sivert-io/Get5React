"use client";

import { Flex, IconButton, ScrollArea } from "@radix-ui/themes";
import React, { useEffect, useRef, useState } from "react";
import { BsChevronLeft, BsChevronRight } from "react-icons/bs";
import { useInViewport } from "react-in-viewport";
import { useDraggable } from "react-use-draggable-scroll";

function CarouselChild({
  children,
  setVisible,
  index,
}: {
  children: React.ReactNode;
  setVisible: (index: number, vis: boolean) => any;
  index: number;
}) {
  const myRef = useRef<HTMLDivElement>(null);
  const { inViewport } = useInViewport(myRef, {
    threshold: 0.9,
  });

  useEffect(() => {
    setVisible(index, inViewport);
  }, [inViewport]);

  return (
    <div
      draggable={false}
      style={{
        padding: "1px",
      }}
      ref={myRef}
    >
      {children}
    </div>
  );
}

interface Props {
  children: React.ReactNode[];
  showPagination?: boolean;
  showScrollbar?: boolean;
  showButtons?: boolean;
  scrollToIndex?: number;
}

export function Carousel({
  children,
  showButtons,
  showPagination,
  showScrollbar,
  scrollToIndex,
}: Props) {
  const [firstElementInView, setFirstElementInView] = useState(0);
  const [lastElementInView, setLastElementInView] = useState(0);
  const [childrenVisibility, setChildrenVisibility] = useState<boolean[]>([]);

  const carouselRef = useRef<HTMLDivElement>(null);
  const { events } = useDraggable(carouselRef as any);

  function updateVisibleElements(index: number, isVisible: boolean) {
    const vis = childrenVisibility;
    vis[index] = isVisible;

    let firstVisible = -1;
    let lastVisible = 0;

    vis.forEach((childVisibility, childIndex) => {
      if (childVisibility) {
        if (firstVisible === -1) firstVisible = childIndex;
        else lastVisible = childIndex;
      }
    });

    setFirstElementInView(firstVisible);
    setLastElementInView(lastVisible);
    setChildrenVisibility(vis);
  }

  const scrollToChild = (childIndex: number) => {
    setTimeout(() => {
      carouselRef.current?.children[childIndex]?.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "nearest",
      });
    }, 0);
  };

  // Scroll to requested child when prop changes
  React.useEffect(() => {
    if (typeof scrollToIndex === "number" && scrollToIndex >= 0) {
      scrollToChild(scrollToIndex);
    }
  }, [scrollToIndex]);

  return (
    <Flex position="relative">
      <Flex
        className="hideScrollbar"
        {...events}
        ref={carouselRef}
        gap="4"
        align="stretch"
        style={{
          borderRadius: "8px",
          overflowX: "scroll",
          overflowY: "hidden",
          cursor: "grab !important",
        }}
      >
        {children.map((child, index) => (
          <CarouselChild
            key={index}
            index={index}
            setVisible={updateVisibleElements}
          >
            {child}
          </CarouselChild>
        ))}
      </Flex>

      {firstElementInView > 0 && (
        <Flex position="absolute" left="-20px" height="100%" align="center">
          <IconButton
            tabIndex={-1}
            size="3"
            variant="solid"
            onClick={() => scrollToChild(firstElementInView - 1)}
          >
            <BsChevronLeft height="100%" width="auto" />
          </IconButton>
        </Flex>
      )}

      {lastElementInView < children.length - 1 && (
        <Flex position="absolute" right="-20px" height="100%" align="center">
          <IconButton
            tabIndex={-1}
            size="3"
            variant="solid"
            onClick={() => scrollToChild(lastElementInView + 1)}
          >
            <BsChevronRight height="100%" width="auto" />
          </IconButton>
        </Flex>
      )}
    </Flex>
  );
}
