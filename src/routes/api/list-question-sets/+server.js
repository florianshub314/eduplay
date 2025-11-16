import { supabase } from "$lib/supabaseClient";
import { json } from "@sveltejs/kit";

export async function POST({ request }) {
  const { user_id, subject } = await request.json();

  const { data, error } = await supabase
    .from("question_sets")
    .select("*")
    .eq("user_id", user_id)
    .eq("subject", subject)
    .order("created_at", { ascending: false });

  if (error) {
    console.error(error);
    return json({ error: error.message }, { status: 500 });
  }

  return json({ sets: data });
}
