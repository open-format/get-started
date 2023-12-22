// pages/api/auth/logout.ts

import type { NextApiRequest, NextApiResponse } from "next";
import { supabase } from "../../../utils/supabaseClient"; // Adjust the path as per your project structure

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    res.status(405).end(); // Method Not Allowed
    return;
  }

  // Logout using Supabase
  const { error } = await supabase.auth.signOut();

  if (error) {
    res.status(500).json({ error: error.message });
    return;
  }

  res.status(200).json({ message: "Logout successful" });
}
