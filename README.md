# ChampionsSport

פלטפורמת ניחושי מונדיאל בזמן אמת — Web (Next.js) + Mobile (Expo), עם Supabase.

## מבנה

```
apps/web      — Next.js 15, עברית RTL
apps/mobile   — Expo 53, NativeWind
packages/*    — shared, supabase types, i18n, ui-tokens
supabase/     — migrations, edge functions, seed
```

## התחלה מהירה

### 1. התקנת תלויות

```bash
pnpm install
```

### 2. Supabase

1. צור פרויקט ב-[Supabase](https://supabase.com)
2. העתק `.env.example` ל-`apps/web/.env.local` ו-`apps/mobile/.env`
3. הרץ migrations:

```bash
npx supabase link --project-ref YOUR_REF
npx supabase db push
npx supabase db execute -f supabase/seed.sql
```

4. הפעל Google OAuth ב-Supabase Dashboard → Authentication → Providers

### 3. Web

```bash
pnpm dev:web
```

פתח http://localhost:3000

### 4. Mobile

```bash
pnpm dev:mobile
```

סרוק QR עם Expo Go.

## ניקוד

| תוצאה | נקודות |
|--------|--------|
| זוכה/תיקו נכון | 3 |
| תוצאה מדויקת | +2 (סה"כ 5) |
| זוכה טורניר | 10 |
| מלך שערים | 10 |

נעילה: 5 דקות לפני תחילת משחק.

## Cron (תוצאות חיות)

Vercel Cron קורא ל-`/api/cron/sync-live` כל דקה. הגדר `CRON_SECRET` ב-Vercel.

## Deploy

- **Web:** Vercel — root `apps/web`
- **Mobile:** `eas build --profile preview` מתוך `apps/mobile`
- **DB:** Supabase Cloud (`eu-central-1` מומלץ)

## בדיקות

```bash
pnpm test
```
