"use client";

import React from "react";
import { Card, CardBody, CardHeader } from "@nextui-org/react";

export const Message = ({ name, content, createdAt }: { name: string; content: string; createdAt: string }) => {
  return (
    <Card shadow="sm" className="animate-fadeIn">
      <CardHeader className="flex justify-between px-6">
        <span>{name}</span>
        <span>{createdAt}</span>
      </CardHeader>
      <CardBody className="px-6">{content}</CardBody>
    </Card>
  );
};
