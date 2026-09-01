import { hasLocale } from "next-intl";
import { getRequestConfig } from "next-intl/server";

import { routing } from "./routing";

export default getRequestConfig(
  async ({ requestLocale }) => {
    const requestedLocale = await requestLocale;


    const locale = hasLocale(
      routing.locales,
      requestedLocale,
    )
      ? requestedLocale
      : routing.defaultLocale;

    const baseMessages = (
      await import(`../../messages/${locale}.json`)
    ).default;

    const homeMessages = (
      await import(
        `../../messages/home/${locale}.json`
      )
    ).default;

    const vehicleDetailMessages = (
        await import(
            `../../messages/vehicle-detail/${locale}.json`
        )
    ).default;

    const vehicleMessages = (
      await import(
        `../../messages/vehicle/${locale}.json`
      )
    ).default;

    return {
      locale,
      messages: {
        ...baseMessages,
        ...homeMessages,
        ...vehicleMessages,
        ...vehicleDetailMessages,
    },
    };
  },
);