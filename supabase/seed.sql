-- World Cup 2026 mock seed data for development

INSERT INTO tournaments (slug, name_he, api_football_league_id, season, status, tournament_lock_at)
VALUES ('world-cup-2026', 'מונדיאל 2026', 1, '2026', 'upcoming', '2026-06-11 00:00:00+00')
ON CONFLICT (slug) DO NOTHING;

DO $$
DECLARE
  t_id UUID;
  br_id UUID; ar_id UUID; fr_id UUID; de_id UUID;
  m1_id UUID; m2_id UUID; m3_id UUID;
BEGIN
  SELECT id INTO t_id FROM tournaments WHERE slug = 'world-cup-2026';

  INSERT INTO teams (tournament_id, api_team_id, name, name_he, logo_url) VALUES
    (t_id, 6, 'Brazil', 'ברזיל', 'https://media.api-sports.io/football/teams/6.png'),
    (t_id, 26, 'Argentina', 'ארגנטינה', 'https://media.api-sports.io/football/teams/26.png'),
    (t_id, 2, 'France', 'צרפת', 'https://media.api-sports.io/football/teams/2.png'),
    (t_id, 25, 'Germany', 'גרמניה', 'https://media.api-sports.io/football/teams/25.png')
  ON CONFLICT DO NOTHING;

  SELECT id INTO br_id FROM teams WHERE tournament_id = t_id AND api_team_id = 6;
  SELECT id INTO ar_id FROM teams WHERE tournament_id = t_id AND api_team_id = 26;
  SELECT id INTO fr_id FROM teams WHERE tournament_id = t_id AND api_team_id = 2;
  SELECT id INTO de_id FROM teams WHERE tournament_id = t_id AND api_team_id = 25;

  INSERT INTO players (tournament_id, api_player_id, name, team_id, goals) VALUES
    (t_id, 1001, 'Kylian Mbappé', fr_id, 0),
    (t_id, 1002, 'Lionel Messi', ar_id, 0),
    (t_id, 1003, 'Neymar Jr', br_id, 0),
    (t_id, 1004, 'Jamal Musiala', de_id, 0)
  ON CONFLICT DO NOTHING;

  INSERT INTO matches (tournament_id, api_fixture_id, home_team_id, away_team_id, kickoff_at, lock_at, status, stage, group_name) VALUES
    (t_id, 900001, br_id, ar_id, now() + interval '2 days', now() + interval '2 days' - interval '5 minutes', 'scheduled', 'group', 'A'),
    (t_id, 900002, fr_id, de_id, now() + interval '3 days', now() + interval '3 days' - interval '5 minutes', 'scheduled', 'group', 'B'),
    (t_id, 900003, br_id, fr_id, now() - interval '1 day', now() - interval '1 day' - interval '5 minutes', 'finished', 'group', 'A')
  ON CONFLICT (api_fixture_id) DO NOTHING;

  SELECT id INTO m3_id FROM matches WHERE api_fixture_id = 900003;
  UPDATE matches SET home_score = 2, away_score = 1 WHERE id = m3_id;
END $$;
