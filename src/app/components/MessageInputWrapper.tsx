"use client";

import React from "react";
import { Input, Divider } from "@nextui-org/react";

export const MessageInputWrapper = () => {
  return (
    <div>
      <div className="flex justify-between">
        <Input placeholder="name" />
        <Input placeholder="content" />
      </div>
      <Divider />
    </div>
  );
};
