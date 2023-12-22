import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import type { NextApiRequest, NextApiResponse } from "next";
// @todo import for Database types
// import type { Database } from '@/lib/database.types'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (!req.url) {
    res.status(400).send("Bad Request: URL is undefined");
    return;
  }

  const requestUrl = new URL(req.url, `http://${req.headers.host}`);
  const code = requestUrl.searchParams.get("code");

  if (code) {
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
    await supabase.auth.exchangeCodeForSession(code);
  }

  // URL to redirect to after sign in process completes
  res.redirect(requestUrl.origin);
}
