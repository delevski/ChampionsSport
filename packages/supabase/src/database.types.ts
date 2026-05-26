export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          username: string | null;
          avatar_url: string | null;
          total_points: number;
          exact_predictions: number;
          total_predictions: number;
          failed_predictions: number;
          exact_streak: number;
          global_rank: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          username?: string | null;
          avatar_url?: string | null;
          total_points?: number;
          exact_predictions?: number;
          total_predictions?: number;
          failed_predictions?: number;
          exact_streak?: number;
          global_rank?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["profiles"]["Insert"]>;
      };
      tournaments: {
        Row: {
          id: string;
          slug: string;
          name_he: string;
          api_football_league_id: number | null;
          season: string | null;
          status: string;
          winner_team_id: string | null;
          top_scorer_player_id: string | null;
          tournament_lock_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          slug: string;
          name_he: string;
          api_football_league_id?: number | null;
          season?: string | null;
          status?: string;
          winner_team_id?: string | null;
          top_scorer_player_id?: string | null;
          tournament_lock_at?: string | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["tournaments"]["Insert"]>;
      };
      teams: {
        Row: {
          id: string;
          tournament_id: string;
          api_team_id: number;
          name: string;
          name_he: string | null;
          logo_url: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          tournament_id: string;
          api_team_id: number;
          name: string;
          name_he?: string | null;
          logo_url?: string | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["teams"]["Insert"]>;
      };
      players: {
        Row: {
          id: string;
          tournament_id: string;
          api_player_id: number;
          name: string;
          team_id: string | null;
          photo_url: string | null;
          goals: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          tournament_id: string;
          api_player_id: number;
          name: string;
          team_id?: string | null;
          photo_url?: string | null;
          goals?: number;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["players"]["Insert"]>;
      };
      matches: {
        Row: {
          id: string;
          tournament_id: string;
          api_fixture_id: number;
          home_team_id: string;
          away_team_id: string;
          kickoff_at: string;
          lock_at: string;
          status: string;
          home_score: number | null;
          away_score: number | null;
          stage: string;
          round: string | null;
          group_name: string | null;
          is_locked: boolean;
          last_synced_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          tournament_id: string;
          api_fixture_id: number;
          home_team_id: string;
          away_team_id: string;
          kickoff_at: string;
          lock_at?: string;
          status?: string;
          home_score?: number | null;
          away_score?: number | null;
          stage?: string;
          round?: string | null;
          group_name?: string | null;
          is_locked?: boolean;
          last_synced_at?: string | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["matches"]["Insert"]>;
      };
      predictions: {
        Row: {
          id: string;
          user_id: string;
          match_id: string;
          tournament_id: string;
          home_score: number;
          away_score: number;
          points_awarded: number | null;
          is_exact: boolean | null;
          is_winner_correct: boolean | null;
          submitted_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          match_id: string;
          tournament_id: string;
          home_score: number;
          away_score: number;
          points_awarded?: number | null;
          is_exact?: boolean | null;
          is_winner_correct?: boolean | null;
          submitted_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["predictions"]["Insert"]>;
      };
      tournament_predictions: {
        Row: {
          id: string;
          user_id: string;
          tournament_id: string;
          winner_team_id: string | null;
          top_scorer_player_id: string | null;
          points_awarded: number | null;
          submitted_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          tournament_id: string;
          winner_team_id?: string | null;
          top_scorer_player_id?: string | null;
          points_awarded?: number | null;
          submitted_at?: string;
        };
        Update: Partial<
          Database["public"]["Tables"]["tournament_predictions"]["Insert"]
        >;
      };
      groups: {
        Row: {
          id: string;
          name: string;
          avatar_url: string | null;
          invite_code: string;
          admin_id: string;
          is_locked: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          avatar_url?: string | null;
          invite_code: string;
          admin_id: string;
          is_locked?: boolean;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["groups"]["Insert"]>;
      };
      group_members: {
        Row: {
          group_id: string;
          user_id: string;
          role: string;
          joined_at: string;
        };
        Insert: {
          group_id: string;
          user_id: string;
          role?: string;
          joined_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["group_members"]["Insert"]>;
      };
      activity_feed: {
        Row: {
          id: string;
          group_id: string | null;
          user_id: string;
          type: string;
          payload: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          group_id?: string | null;
          user_id: string;
          type: string;
          payload?: Json;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["activity_feed"]["Insert"]>;
      };
      match_events: {
        Row: {
          id: string;
          match_id: string;
          minute: number | null;
          type: string;
          player_id: string | null;
          team_id: string | null;
          detail: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          match_id: string;
          minute?: number | null;
          type: string;
          player_id?: string | null;
          team_id?: string | null;
          detail?: string | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["match_events"]["Insert"]>;
      };
    };
    Views: {
      global_leaderboard: {
        Row: {
          user_id: string;
          username: string | null;
          avatar_url: string | null;
          tournament_id: string;
          total_points: number;
          exact_predictions: number;
          failed_predictions: number;
          earliest_prediction_at: string | null;
          rank: number;
        };
      };
      group_leaderboard: {
        Row: {
          group_id: string;
          user_id: string;
          username: string | null;
          avatar_url: string | null;
          tournament_id: string;
          total_points: number;
          exact_predictions: number;
          failed_predictions: number;
          earliest_prediction_at: string | null;
          rank: number;
        };
      };
    };
    Functions: {
      upsert_match_prediction: {
        Args: {
          p_match_id: string;
          p_home_score: number;
          p_away_score: number;
        };
        Returns: string;
      };
      upsert_tournament_prediction: {
        Args: {
          p_tournament_id: string;
          p_winner_team_id: string;
          p_top_scorer_player_id: string;
        };
        Returns: string;
      };
      create_group: {
        Args: { p_name: string };
        Returns: string;
      };
      join_group_by_code: {
        Args: { p_code: string };
        Returns: string;
      };
      leave_group: {
        Args: { p_group_id: string };
        Returns: null;
      };
      kick_member: {
        Args: { p_group_id: string; p_user_id: string };
        Returns: null;
      };
      delete_group: {
        Args: { p_group_id: string };
        Returns: null;
      };
      lock_expired_matches: {
        Args: Record<string, never>;
        Returns: null;
      };
      score_finished_match: {
        Args: { p_match_id: string };
        Returns: null;
      };
    };
  };
};
