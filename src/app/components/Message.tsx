"use client";

import React from "react";
import { Card, CardBody, CardHeader } from "@nextui-org/react";

export const Message = ({ name, content, createdAt }: { name: string; content: string; createdAt: string }) => {
  return (
    <Card>
      <CardHeader className="flex justify-between">
        <span>{name}</span>
        <span>{createdAt}</span>
      </CardHeader>
      <CardBody>{content}</CardBody>
    </Card>
  );
};
