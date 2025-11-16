import { supabase } from "$lib/supabaseClient";
import { json } from "@sveltejs/kit";

export async function POST({ request }) {
  const body = await request.json();
  const { user_id, subject, title, questions } = body;

  const { data, error } = await supabase
    .from("question_sets")
    .insert([{ user_id, subject, title, questions }])
    .select()
    .single();

  if (error) {
    console.error(error);
    return json({ error: error.message }, { status: 500 });
  }

  return json({ set: data });
}
