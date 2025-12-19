import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyJWT } from "@/lib/auth/jwt";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  /* -------------------------
     Protected Routes
  -------------------------- */
  const isAdminRoute = pathname.startsWith("/admin/dashboard");
  const isAdminApiRoute = pathname.startsWith("/api/admin");

  if (isAdminRoute || isAdminApiRoute) {
    const token = request.cookies.get("admin_token")?.value;

    // No token → redirect to admin login
    if (!token) {
      if (isAdminApiRoute) {
        return NextResponse.json(
          { message: "Unauthorized" },
          { status: 401 }
        );
      }

      return NextResponse.redirect(
        new URL("/admin", request.url)
      );
    }

    try {
      // Verify JWT
      verifyJWT(token);
      return NextResponse.next();
    } catch (error) {
      // Invalid or expired token
      if (isAdminApiRoute) {
        return NextResponse.json(
          { message: "Invalid token" },
          { status: 401 }
        );
      }

      return NextResponse.redirect(
        new URL("/admin", request.url)
      );
    }
  }

  return NextResponse.next();
}

/* -------------------------
   Matcher Configuration
-------------------------- */
export const config = {
  matcher: [
    "/admin/dashboard/:path*",
    "/api/admin/:path*",
  ],
};
