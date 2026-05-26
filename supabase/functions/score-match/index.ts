import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

Deno.serve(async (req) => {
  const { match_id } = await req.json();
  if (!match_id) {
    return new Response(JSON.stringify({ error: "match_id required" }), {
      status: 400,
    });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  await supabase.rpc("score_finished_match", { p_match_id: match_id });

  return new Response(JSON.stringify({ ok: true }), {
    headers: { "Content-Type": "application/json" },
  });
});
