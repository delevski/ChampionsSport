import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import createIntlMiddleware from "next-intl/middleware";

const intlMiddleware = createIntlMiddleware({
  locales: ["he"],
  defaultLocale: "he",
});

const publicPaths = ["/he/login", "/he/register", "/he/onboarding", "/auth/callback"];

export async function middleware(request: NextRequest) {
  const intlResponse = intlMiddleware(request);

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            intlResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;
  const isPublic = publicPaths.some((p) => pathname.startsWith(p));

  if (!user && !isPublic && pathname.startsWith("/he")) {
    const url = request.nextUrl.clone();
    url.pathname = "/he/login";
    return NextResponse.redirect(url);
  }

  if (user && (pathname === "/he/login" || pathname === "/he/register")) {
    const url = request.nextUrl.clone();
    url.pathname = "/he";
    return NextResponse.redirect(url);
  }

  return intlResponse;
}

export const config = {
  matcher: ["/", "/he/:path*"],
};
