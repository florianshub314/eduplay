import { createClient } from "@supabase/supabase-js";
import { env } from "$env/dynamic/private";

const supabaseUrl = env.VITE_SUPABASE_URL;
const supabaseAnonKey = env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Supabase-Umgebungsvariablen fehlen.");
}

export const supabaseServer = createClient(supabaseUrl, supabaseAnonKey);
