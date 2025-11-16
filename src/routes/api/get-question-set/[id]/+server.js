import { supabase } from "$lib/supabaseClient";
import { json } from "@sveltejs/kit";

export async function GET({ params }) {
  const { id } = params;

  const { data, error } = await supabase
    .from("question_sets")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error(error);
    return json({ error: error.message }, { status: 500 });
  }

  return json({ set: data });
}
