import type { MetadataRoute } from "next";

import { prisma } from "@/lib/prisma";

const baseUrl = "https://ktluxurycars.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const vehicles = await prisma.vehicle.findMany({
    where: {
      visible: true,
    },
    select: {
      slug: true,
      updatedAt: true,
    },
    orderBy: {
      updatedAt: "desc",
    },
  });

  const homepageAlternates = {
    languages: {
      en: `${baseUrl}/en`,
      fr: `${baseUrl}/fr`,
    },
  };

  const fleetAlternates = {
    languages: {
      en: `${baseUrl}/en/vehicles`,
      fr: `${baseUrl}/fr/vehicles`,
    },
  };

  const pages: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}/en`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
      alternates: homepageAlternates,
    },
    {
      url: `${baseUrl}/fr`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
      alternates: homepageAlternates,
    },
    {
      url: `${baseUrl}/en/vehicles`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
      alternates: fleetAlternates,
    },
    {
      url: `${baseUrl}/fr/vehicles`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
      alternates: fleetAlternates,
    },
  ];

  const vehiclePages: MetadataRoute.Sitemap = vehicles.flatMap(
    (vehicle) => {
      const englishUrl = `${baseUrl}/en/vehicles/${vehicle.slug}`;
      const frenchUrl = `${baseUrl}/fr/vehicles/${vehicle.slug}`;

      const alternates = {
        languages: {
          en: englishUrl,
          fr: frenchUrl,
        },
      };

      return [
        {
          url: englishUrl,
          lastModified: vehicle.updatedAt,
          changeFrequency: "weekly" as const,
          priority: 0.8,
          alternates,
        },
        {
          url: frenchUrl,
          lastModified: vehicle.updatedAt,
          changeFrequency: "weekly" as const,
          priority: 0.8,
          alternates,
        },
      ];
    },
  );

  return [...pages, ...vehiclePages];
}