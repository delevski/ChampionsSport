// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyClient = import("@supabase/supabase-js").SupabaseClient<any, "public", any>;

export const rpc = {
  upsertMatchPrediction: (
    client: AnyClient,
    args: { p_match_id: string; p_home_score: number; p_away_score: number }
  ) => client.rpc("upsert_match_prediction", args),

  upsertTournamentPrediction: (
    client: AnyClient,
    args: {
      p_tournament_id: string;
      p_winner_team_id: string;
      p_top_scorer_player_id: string;
    }
  ) => client.rpc("upsert_tournament_prediction", args),

  createGroup: (client: AnyClient, args: { p_name: string }) =>
    client.rpc("create_group", args),

  joinGroupByCode: (client: AnyClient, args: { p_code: string }) =>
    client.rpc("join_group_by_code", args),

  leaveGroup: (client: AnyClient, args: { p_group_id: string }) =>
    client.rpc("leave_group", args),

  kickMember: (
    client: AnyClient,
    args: { p_group_id: string; p_user_id: string }
  ) => client.rpc("kick_member", args),

  deleteGroup: (client: AnyClient, args: { p_group_id: string }) =>
    client.rpc("delete_group", args),
};
