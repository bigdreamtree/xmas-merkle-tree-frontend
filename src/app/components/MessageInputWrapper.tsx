"use client";

import React, { useState } from "react";
import { Input, Card, CardFooter, CardBody, Button, Textarea } from "@nextui-org/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export const MessageInputWrapper = () => {
  const queryClient = useQueryClient();

  const [name, setName] = useState("");
  const [content, setContent] = useState("");

  const mutation = useMutation({
    mutationFn: ({ name, content }: { name: string; content: string }) => {
      return fetch("/api/write-message", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, content }),
      });
    },
    onSuccess: () => {
      setName("");
      setContent("");
      queryClient.invalidateQueries({ queryKey: ["messages"] });
    },
  });

  return (
    <Card className="w-full">
      <CardBody className="gap-2">
        <Input
          placeholder="name"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
          }}
        />
        <Textarea minRows={2} maxRows={5} placeholder="content" value={content} onChange={(e) => setContent(e.target.value)} />
      </CardBody>
      <CardFooter className="flex justify-end">
        <Button
          isLoading={mutation.isPending}
          color="primary"
          onClick={() => {
            try {
              mutation.mutate({ name, content });
            } catch (error) {
              console.error("메시지 전송 중 오류:", error);
            }
          }}
        >
          Post
        </Button>
      </CardFooter>
    </Card>
  );
};
