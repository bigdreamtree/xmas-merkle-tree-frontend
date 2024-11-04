import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// This function can be marked `async` if using `await` inside
export function middleware(request: NextRequest) {
  // Extract the path parameter after /tree/
  const path = request.nextUrl.pathname.replace("/tree/", "");

  // Create response with the path cookie
  const response = NextResponse.next();

  // Set cookie with the path value if path exists
  if (path) {
    response.cookies.set("target_handle", path, {
      httpOnly: true,
    });
  }

  return response;
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: "/tree/:path*",
};
