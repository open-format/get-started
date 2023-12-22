import withAuth from "next-auth/middleware";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
const [AUTH_USER, AUTH_PASS] = (process.env.HTTP_BASIC_AUTH || ":").split(":");

const nextAuthMiddleware = withAuth({
  pages: {
    signIn: "/login",
    error: "/error",
  },
});

export async function middleware(req: NextRequest, res: NextResponse) {
  if (!isAuthenticated(req)) {
    return new NextResponse("Authentication required", {
      status: 401,
      headers: { "WWW-Authenticate": "Basic" },
    });
  }

  const nextAuthResponse = await nextAuthMiddleware(req, res);

  if (nextAuthResponse) {
    return nextAuthResponse;
  }

  return NextResponse.next();
}

// Step 2. Check HTTP Basic Auth header if present
function isAuthenticated(req: NextRequest) {
  if (!process.env.HTTP_BASIC_AUTH) {
    return true;
  }
  const authheader =
    req.headers.get("authorization") || req.headers.get("Authorization");

  if (!authheader) {
    return false;
  }

  const auth = Buffer.from(authheader.split(" ")[1], "base64")
    .toString()
    .split(":");
  const user = auth[0];
  const pass = auth[1];

  if (user == AUTH_USER && pass == AUTH_PASS) {
    return true;
  } else {
    return false;
  }
}

// Step 3. Configure "Matching Paths" below to protect routes with HTTP Basic Auth
export const config = {
  matcher:
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - images
     * - fonts
     */
    "/((?!api|_next/static|_next/image|favicon.ico|images|fonts).*)",
};
