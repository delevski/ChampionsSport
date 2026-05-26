-- ChampionsSport initial schema

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE,
  avatar_url TEXT,
  total_points INT NOT NULL DEFAULT 0,
  exact_predictions INT NOT NULL DEFAULT 0,
  total_predictions INT NOT NULL DEFAULT 0,
  failed_predictions INT NOT NULL DEFAULT 0,
  exact_streak INT NOT NULL DEFAULT 0,
  global_rank INT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_profiles_username ON profiles(username);
CREATE INDEX idx_profiles_global_rank ON profiles(global_rank);

CREATE TABLE tournaments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  name_he TEXT NOT NULL,
  api_football_league_id INT,
  season TEXT,
  status TEXT NOT NULL DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'live', 'finished')),
  winner_team_id UUID,
  top_scorer_player_id UUID,
  tournament_lock_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tournament_id UUID NOT NULL REFERENCES tournaments(id) ON DELETE CASCADE,
  api_team_id INT NOT NULL,
  name TEXT NOT NULL,
  name_he TEXT,
  logo_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (tournament_id, api_team_id)
);

CREATE TABLE players (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tournament_id UUID NOT NULL REFERENCES tournaments(id) ON DELETE CASCADE,
  api_player_id INT NOT NULL,
  name TEXT NOT NULL,
  team_id UUID REFERENCES teams(id),
  photo_url TEXT,
  goals INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (tournament_id, api_player_id)
);

ALTER TABLE tournaments
  ADD CONSTRAINT fk_winner_team FOREIGN KEY (winner_team_id) REFERENCES teams(id),
  ADD CONSTRAINT fk_top_scorer FOREIGN KEY (top_scorer_player_id) REFERENCES players(id);

CREATE TABLE matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tournament_id UUID NOT NULL REFERENCES tournaments(id) ON DELETE CASCADE,
  api_fixture_id INT UNIQUE NOT NULL,
  home_team_id UUID NOT NULL REFERENCES teams(id),
  away_team_id UUID NOT NULL REFERENCES teams(id),
  kickoff_at TIMESTAMPTZ NOT NULL,
  lock_at TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'live', 'finished', 'postponed')),
  home_score INT,
  away_score INT,
  stage TEXT NOT NULL DEFAULT 'group' CHECK (stage IN ('group', 'knockout')),
  round TEXT,
  group_name TEXT,
  is_locked BOOLEAN NOT NULL DEFAULT false,
  last_synced_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_matches_kickoff ON matches(kickoff_at);
CREATE INDEX idx_matches_status ON matches(status);
CREATE INDEX idx_matches_tournament ON matches(tournament_id);

CREATE TABLE predictions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  match_id UUID NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
  tournament_id UUID NOT NULL REFERENCES tournaments(id) ON DELETE CASCADE,
  home_score INT NOT NULL CHECK (home_score >= 0 AND home_score <= 20),
  away_score INT NOT NULL CHECK (away_score >= 0 AND away_score <= 20),
  points_awarded INT,
  is_exact BOOLEAN,
  is_winner_correct BOOLEAN,
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, match_id)
);

CREATE INDEX idx_predictions_match ON predictions(match_id);
CREATE INDEX idx_predictions_user ON predictions(user_id);

CREATE TABLE tournament_predictions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  tournament_id UUID NOT NULL REFERENCES tournaments(id) ON DELETE CASCADE,
  winner_team_id UUID REFERENCES teams(id),
  top_scorer_player_id UUID REFERENCES players(id),
  points_awarded INT,
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, tournament_id)
);

CREATE TABLE groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  avatar_url TEXT,
  invite_code TEXT UNIQUE NOT NULL,
  admin_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  is_locked BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_groups_invite ON groups(invite_code);

CREATE TABLE group_members (
  group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('admin', 'member')),
  joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (group_id, user_id)
);

CREATE TABLE activity_feed (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID REFERENCES groups(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  payload JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_activity_group ON activity_feed(group_id, created_at DESC);

CREATE TABLE match_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id UUID NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
  minute INT,
  type TEXT NOT NULL,
  player_id UUID REFERENCES players(id),
  team_id UUID REFERENCES teams(id),
  detail TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', NEW.raw_user_meta_data->>'picture')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE OR REPLACE FUNCTION set_match_lock_at()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.lock_at IS NULL OR NEW.lock_at = NEW.kickoff_at THEN
    NEW.lock_at := NEW.kickoff_at - INTERVAL '5 minutes';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER matches_set_lock_at
  BEFORE INSERT OR UPDATE ON matches
  FOR EACH ROW EXECUTE FUNCTION set_match_lock_at();

CREATE OR REPLACE FUNCTION enforce_prediction_lock()
RETURNS TRIGGER AS $$
DECLARE
  v_lock_at TIMESTAMPTZ;
  v_is_locked BOOLEAN;
BEGIN
  SELECT lock_at, is_locked INTO v_lock_at, v_is_locked
  FROM matches WHERE id = NEW.match_id;

  IF v_is_locked OR now() >= v_lock_at THEN
    RAISE EXCEPTION 'Predictions are locked for this match';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER predictions_lock_check
  BEFORE INSERT OR UPDATE ON predictions
  FOR EACH ROW EXECUTE FUNCTION enforce_prediction_lock();

CREATE OR REPLACE FUNCTION generate_invite_code()
RETURNS TEXT AS $$
DECLARE
  chars TEXT := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  result TEXT := '';
  i INT;
BEGIN
  FOR i IN 1..8 LOOP
    result := result || substr(chars, floor(random() * length(chars) + 1)::int, 1);
  END LOOP;
  RETURN result;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION upsert_match_prediction(
  p_match_id UUID,
  p_home_score INT,
  p_away_score INT
)
RETURNS UUID AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_tournament_id UUID;
  v_prediction_id UUID;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  SELECT tournament_id INTO v_tournament_id FROM matches WHERE id = p_match_id;
  IF v_tournament_id IS NULL THEN
    RAISE EXCEPTION 'Match not found';
  END IF;

  INSERT INTO predictions (user_id, match_id, tournament_id, home_score, away_score, submitted_at)
  VALUES (v_user_id, p_match_id, v_tournament_id, p_home_score, p_away_score, now())
  ON CONFLICT (user_id, match_id)
  DO UPDATE SET
    home_score = EXCLUDED.home_score,
    away_score = EXCLUDED.away_score,
    submitted_at = now()
  RETURNING id INTO v_prediction_id;

  RETURN v_prediction_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION upsert_tournament_prediction(
  p_tournament_id UUID,
  p_winner_team_id UUID,
  p_top_scorer_player_id UUID
)
RETURNS UUID AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_lock_at TIMESTAMPTZ;
  v_prediction_id UUID;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  SELECT tournament_lock_at INTO v_lock_at FROM tournaments WHERE id = p_tournament_id;
  IF v_lock_at IS NOT NULL AND now() >= v_lock_at THEN
    RAISE EXCEPTION 'Tournament predictions are locked';
  END IF;

  INSERT INTO tournament_predictions (user_id, tournament_id, winner_team_id, top_scorer_player_id, submitted_at)
  VALUES (v_user_id, p_tournament_id, p_winner_team_id, p_top_scorer_player_id, now())
  ON CONFLICT (user_id, tournament_id)
  DO UPDATE SET
    winner_team_id = EXCLUDED.winner_team_id,
    top_scorer_player_id = EXCLUDED.top_scorer_player_id,
    submitted_at = now()
  RETURNING id INTO v_prediction_id;

  RETURN v_prediction_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION create_group(p_name TEXT)
RETURNS UUID AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_group_id UUID;
  v_code TEXT;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  LOOP
    v_code := generate_invite_code();
    EXIT WHEN NOT EXISTS (SELECT 1 FROM groups WHERE invite_code = v_code);
  END LOOP;

  INSERT INTO groups (name, invite_code, admin_id)
  VALUES (p_name, v_code, v_user_id)
  RETURNING id INTO v_group_id;

  INSERT INTO group_members (group_id, user_id, role)
  VALUES (v_group_id, v_user_id, 'admin');

  INSERT INTO activity_feed (group_id, user_id, type, payload)
  VALUES (v_group_id, v_user_id, 'group_created', jsonb_build_object('name', p_name));

  RETURN v_group_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION join_group_by_code(p_code TEXT)
RETURNS UUID AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_group_id UUID;
  v_is_locked BOOLEAN;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  SELECT id, is_locked INTO v_group_id, v_is_locked
  FROM groups WHERE invite_code = upper(trim(p_code));

  IF v_group_id IS NULL THEN
    RAISE EXCEPTION 'Invalid invite code';
  END IF;
  IF v_is_locked THEN
    RAISE EXCEPTION 'Group is locked';
  END IF;

  INSERT INTO group_members (group_id, user_id, role)
  VALUES (v_group_id, v_user_id, 'member')
  ON CONFLICT DO NOTHING;

  INSERT INTO activity_feed (group_id, user_id, type, payload)
  VALUES (v_group_id, v_user_id, 'member_joined', '{}');

  RETURN v_group_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION leave_group(p_group_id UUID)
RETURNS VOID AS $$
BEGIN
  DELETE FROM group_members WHERE group_id = p_group_id AND user_id = auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION kick_member(p_group_id UUID, p_user_id UUID)
RETURNS VOID AS $$
DECLARE
  v_admin_id UUID;
BEGIN
  SELECT admin_id INTO v_admin_id FROM groups WHERE id = p_group_id;
  IF v_admin_id IS NULL OR v_admin_id != auth.uid() THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;
  DELETE FROM group_members WHERE group_id = p_group_id AND user_id = p_user_id AND user_id != v_admin_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION delete_group(p_group_id UUID)
RETURNS VOID AS $$
DECLARE
  v_admin_id UUID;
BEGIN
  SELECT admin_id INTO v_admin_id FROM groups WHERE id = p_group_id;
  IF v_admin_id IS NULL OR v_admin_id != auth.uid() THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;
  DELETE FROM groups WHERE id = p_group_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION score_finished_match(p_match_id UUID)
RETURNS VOID AS $$
DECLARE
  v_home_score INT;
  v_away_score INT;
  pred RECORD;
  v_points INT;
  v_is_exact BOOLEAN;
  v_is_winner BOOLEAN;
  v_is_failed BOOLEAN;
BEGIN
  SELECT home_score, away_score
  INTO v_home_score, v_away_score
  FROM matches
  WHERE id = p_match_id AND status = 'finished'
    AND home_score IS NOT NULL AND away_score IS NOT NULL;

  IF NOT FOUND THEN
    RETURN;
  END IF;

  FOR pred IN
    SELECT * FROM predictions
    WHERE match_id = p_match_id AND points_awarded IS NULL
  LOOP
    v_is_winner := (
      CASE
        WHEN pred.home_score > pred.away_score AND v_home_score > v_away_score THEN true
        WHEN pred.away_score > pred.home_score AND v_away_score > v_home_score THEN true
        WHEN pred.home_score = pred.away_score AND v_home_score = v_away_score THEN true
        ELSE false
      END
    );
    v_is_exact := pred.home_score = v_home_score AND pred.away_score = v_away_score;
    v_points := CASE WHEN v_is_winner THEN 3 ELSE 0 END + CASE WHEN v_is_exact THEN 2 ELSE 0 END;
    v_is_failed := NOT v_is_winner;

    UPDATE predictions SET
      points_awarded = v_points,
      is_exact = v_is_exact,
      is_winner_correct = v_is_winner
    WHERE id = pred.id;

    UPDATE profiles SET
      total_points = total_points + v_points,
      exact_predictions = exact_predictions + CASE WHEN v_is_exact THEN 1 ELSE 0 END,
      total_predictions = total_predictions + 1,
      failed_predictions = failed_predictions + CASE WHEN v_is_failed THEN 1 ELSE 0 END,
      exact_streak = CASE WHEN v_is_exact THEN exact_streak + 1 ELSE 0 END
    WHERE id = pred.user_id;

    IF v_is_exact THEN
      INSERT INTO activity_feed (user_id, type, payload)
      VALUES (pred.user_id, 'exact_score', jsonb_build_object('match_id', p_match_id, 'points', v_points));
    END IF;
  END LOOP;

  WITH ranked AS (
    SELECT id, ROW_NUMBER() OVER (
      ORDER BY total_points DESC, exact_predictions DESC, failed_predictions ASC
    ) AS rn
    FROM profiles
  )
  UPDATE profiles p SET global_rank = r.rn FROM ranked r WHERE p.id = r.id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION lock_expired_matches()
RETURNS VOID AS $$
BEGIN
  UPDATE matches SET is_locked = true
  WHERE is_locked = false AND now() >= lock_at;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE VIEW global_leaderboard AS
SELECT
  p.id AS user_id,
  p.username,
  p.avatar_url,
  t.id AS tournament_id,
  p.total_points,
  p.exact_predictions,
  p.failed_predictions,
  (SELECT MIN(pr.submitted_at) FROM predictions pr WHERE pr.user_id = p.id) AS earliest_prediction_at,
  ROW_NUMBER() OVER (
    ORDER BY p.total_points DESC, p.exact_predictions DESC, p.failed_predictions ASC,
      (SELECT MIN(pr.submitted_at) FROM predictions pr WHERE pr.user_id = p.id) ASC NULLS LAST
  )::INT AS rank
FROM profiles p
CROSS JOIN tournaments t
WHERE t.slug = 'world-cup-2026';

CREATE OR REPLACE VIEW group_leaderboard AS
SELECT
  gm.group_id,
  p.id AS user_id,
  p.username,
  p.avatar_url,
  t.id AS tournament_id,
  p.total_points,
  p.exact_predictions,
  p.failed_predictions,
  (SELECT MIN(pr.submitted_at) FROM predictions pr WHERE pr.user_id = p.id) AS earliest_prediction_at,
  ROW_NUMBER() OVER (
    PARTITION BY gm.group_id
    ORDER BY p.total_points DESC, p.exact_predictions DESC, p.failed_predictions ASC,
      (SELECT MIN(pr.submitted_at) FROM predictions pr WHERE pr.user_id = p.id) ASC NULLS LAST
  )::INT AS rank
FROM group_members gm
JOIN profiles p ON p.id = gm.user_id
CROSS JOIN tournaments t
WHERE t.slug = 'world-cup-2026';

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE tournaments ENABLE ROW LEVEL SECURITY;
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE players ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE tournament_predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_feed ENABLE ROW LEVEL SECURITY;
ALTER TABLE match_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY profiles_select ON profiles FOR SELECT USING (true);
CREATE POLICY profiles_update ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY tournaments_select ON tournaments FOR SELECT USING (true);
CREATE POLICY teams_select ON teams FOR SELECT USING (true);
CREATE POLICY players_select ON players FOR SELECT USING (true);
CREATE POLICY matches_select ON matches FOR SELECT USING (true);
CREATE POLICY match_events_select ON match_events FOR SELECT USING (true);
CREATE POLICY predictions_select ON predictions FOR SELECT USING (true);
CREATE POLICY predictions_insert ON predictions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY predictions_update ON predictions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY tp_select ON tournament_predictions FOR SELECT USING (true);
CREATE POLICY tp_insert ON tournament_predictions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY tp_update ON tournament_predictions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY groups_select ON groups FOR SELECT USING (
  EXISTS (SELECT 1 FROM group_members gm WHERE gm.group_id = groups.id AND gm.user_id = auth.uid())
);
CREATE POLICY groups_update ON groups FOR UPDATE USING (admin_id = auth.uid());
CREATE POLICY gm_select ON group_members FOR SELECT USING (
  EXISTS (SELECT 1 FROM group_members gm2 WHERE gm2.group_id = group_members.group_id AND gm2.user_id = auth.uid())
);
CREATE POLICY activity_select ON activity_feed FOR SELECT USING (
  group_id IS NULL OR EXISTS (
    SELECT 1 FROM group_members gm WHERE gm.group_id = activity_feed.group_id AND gm.user_id = auth.uid()
  )
);

ALTER PUBLICATION supabase_realtime ADD TABLE matches;
ALTER PUBLICATION supabase_realtime ADD TABLE predictions;
ALTER PUBLICATION supabase_realtime ADD TABLE activity_feed;
ALTER PUBLICATION supabase_realtime ADD TABLE profiles;
