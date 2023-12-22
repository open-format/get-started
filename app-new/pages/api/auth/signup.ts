import { supabase } from "../../../utils/supabaseClient";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    res.status(405).end(); // Method Not Allowed
    return;
  }

  const { email, password } = req.body;
  const response = await supabase.auth.signUp({
    email,
    password,
  });

  const { data, error } = response;
  const user = data?.user;

  if (error) {
    res.status(400).json({ error: error.message });
    return;
  }

  res.status(200).json({ message: "Signup successful", user });
}
