import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  transpilePackages: [
    "@championsport/shared",
    "@championsport/supabase",
    "@championsport/i18n",
    "@championsport/ui-tokens",
  ],
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "media.api-sports.io" },
      { protocol: "https", hostname: "*.supabase.co" },
    ],
  },
};

export default withNextIntl(nextConfig);
