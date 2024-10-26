"use client";

import React, { useRef, useEffect } from "react";
import { Message } from "./Message";
import { MessageResponse } from "../models/MessageType";
import { useInfiniteQuery } from "@tanstack/react-query";

const fetchMessages = async ({ pageParam }: { pageParam: string | undefined }): Promise<MessageResponse> => {
  const res = await fetch(`/api/messages${pageParam ? `?cursor=${pageParam}` : ""}`);
  return res.json();
};

export const MessageList = () => {
  const observerTarget = useRef(null);

  const {
    data,
    // error,
    fetchNextPage,
    hasNextPage,
    // isFetching,
    isFetchingNextPage,
    // status,
  } = useInfiniteQuery({
    initialPageParam: undefined,
    queryKey: ["messages"],
    queryFn: fetchMessages,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    refetchInterval: 3000,
  });

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 1.0 }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => {
      if (observerTarget.current) {
        observer.unobserve(observerTarget.current);
      }
    };
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  const pages = data?.pages ?? [];

  return (
    <div className="w-full flex flex-col gap-2">
      {pages.map((page) => page.messages.map((msg) => <Message key={msg.id} {...msg} />))}
      <div ref={observerTarget} style={{ height: "20px" }}></div>
    </div>
  );
};
