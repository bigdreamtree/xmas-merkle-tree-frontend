import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const { name, content } = await request.json();
    console.log(name, content);
    // Validate input
    if (!name || !content) {
      return NextResponse.json({ success: false, error: "Name and content are required" }, { status: 400 });
    }

    // Save to database
    await prisma.message.create({
      data: {
        name,
        content,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error saving message:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
