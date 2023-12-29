import { Context, Next } from "hono";
import { getCookie } from "hono/cookie";

// Middleware to check for a specific cookie
export async function checkCookieMiddleware(c: Context, next: Next) {
  const token = getCookie(c, "accessToken"); // Replace 'accessToken' with your cookie name

  if (!token) {
    // If the cookie is not present, send an unauthorized response
    return c.json({ error: "Unauthorized: No token provided" }, 401);
  }

  // If the cookie is present, proceed to the next middleware or route handler
  await next();
}
