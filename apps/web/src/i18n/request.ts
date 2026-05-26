import { getRequestConfig } from "next-intl/server";
import { getMessages } from "@championsport/i18n";

export default getRequestConfig(async () => {
  const locale = "he";
  return {
    locale,
    messages: getMessages(locale),
  };
});
