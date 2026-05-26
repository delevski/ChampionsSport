import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  await supabase.rpc("lock_expired_matches");

  const apiKey = Deno.env.get("API_FOOTBALL_KEY");
  if (!apiKey) {
    return new Response(JSON.stringify({ ok: true, synced: 0 }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const { data: matches } = await supabase
    .from("matches")
    .select("id, api_fixture_id, status, home_score, away_score")
    .in("status", ["scheduled", "live"]);

  let synced = 0;

  for (const match of matches ?? []) {
    const res = await fetch(
      `https://v3.football.api-sports.io/fixtures?id=${match.api_fixture_id}`,
      { headers: { "x-apisports-key": apiKey } }
    );
    const json = await res.json();
    const fixture = json.response?.[0];
    if (!fixture) continue;

    const statusMap: Record<string, string> = {
      NS: "scheduled",
      "1H": "live",
      HT: "live",
      "2H": "live",
      FT: "finished",
    };
    const status = statusMap[fixture.fixture.status.short] ?? "scheduled";

    await supabase
      .from("matches")
      .update({
        home_score: fixture.goals.home,
        away_score: fixture.goals.away,
        status,
        last_synced_at: new Date().toISOString(),
      })
      .eq("id", match.id);

    if (status === "finished") {
      await supabase.rpc("score_finished_match", { p_match_id: match.id });
    }
    synced++;
  }

  return new Response(JSON.stringify({ ok: true, synced }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
