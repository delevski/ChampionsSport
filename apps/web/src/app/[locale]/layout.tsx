import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { QueryProvider } from "@/components/providers/QueryProvider";

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const messages = await getMessages();

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <QueryProvider>{children}</QueryProvider>
    </NextIntlClientProvider>
  );
}
