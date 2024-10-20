import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { format } from "date-fns";
import { ko } from "date-fns/locale";

const LIMIT = 20;

export async function GET(req: NextRequest) {
  const cursor = req.nextUrl.searchParams.get("cursor");

  const messages = await prisma.message.findMany({
    take: LIMIT + 1,
    orderBy: {
      createdAt: "desc",
    },
    cursor: cursor ? { id: cursor } : undefined,
    select: {
      id: true,
      name: true,
      content: true,
      createdAt: true,
    },
  });

  let nextCursor: string | undefined = undefined;
  if (messages.length > LIMIT) {
    const nextItem = messages.pop();
    nextCursor = nextItem!.id;
  }

  const formattedMessages = messages.map((msg) => ({
    ...msg,
    createdAt: format(msg.createdAt, "yyyy.MM.dd HH:mm", {
      locale: ko,
    }),
  }));

  return NextResponse.json({
    messages: formattedMessages,
    nextCursor,
  });
}
