import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL; // Ensure these are set in your environment
if (!supabaseUrl) {
  throw new Error("REACT_APP_SUPABASE_URL is not set");
}
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;
if (!supabaseAnonKey) {
  throw new Error("REACT_APP_SUPABASE_ANON_KEY is not set");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
