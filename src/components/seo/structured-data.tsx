type JsonLdProps = {
  data: Record<string, unknown>;
};

function JsonLd({ data }: JsonLdProps) {
  const json = JSON.stringify(data).replace(/</g, "\\u003c");

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: json,
      }}
    />
  );
}

type BusinessStructuredDataProps = {
  locale: string;
};

export function BusinessStructuredData({
  locale,
}: BusinessStructuredDataProps) {
  const language = locale === "fr" ? "fr" : "en";
  const websiteUrl = `https://ktluxurycars.com/${language}`;

  const data = {
    "@context": "https://schema.org",
    "@type": "AutoRental",
    "@id": "https://ktluxurycars.com/#business",
    name: "KT Luxury Cars",
    alternateName: "Kettaoui Car Rental",
    url: websiteUrl,
    telephone: "+212619019549",
    currenciesAccepted: "MAD",
    areaServed: [
      {
        "@type": "City",
        name: "Marrakech",
      },
      {
        "@type": "Country",
        name: "Morocco",
      },
    ],
    address: {
      "@type": "PostalAddress",
      addressLocality: "Marrakech",
      addressCountry: "MA",
    },
    availableLanguage: [
      {
        "@type": "Language",
        name: "English",
        alternateName: "en",
      },
      {
        "@type": "Language",
        name: "French",
        alternateName: "fr",
      },
    ],
    contactPoint: {
      "@type": "ContactPoint",
      telephone: "+212619019549",
      contactType: "customer service",
      areaServed: "MA",
      availableLanguage: ["English", "French"],
    },
  };

  return <JsonLd data={data} />;
}

type VehicleStructuredDataProps = {
  locale: string;

  vehicle: {
    slug: string;
    brand: string;
    model: string;
    trim: string | null;
    year: number;
    category: string;
    transmission: string;
    fuelType: string;
    seats: number;
    doors: number;
    dailyPrice: number;
    status: string;
    descriptionEn: string | null;
    descriptionFr: string | null;
    images: Array<{
      url: string;
      isCover: boolean;
    }>;
  };
};

export function VehicleStructuredData({
  locale,
  vehicle,
}: VehicleStructuredDataProps) {
  const language = locale === "fr" ? "fr" : "en";

  const vehicleName = [
    vehicle.brand,
    vehicle.model,
    vehicle.trim,
  ]
    .filter(Boolean)
    .join(" ");

  const vehicleUrl =
    `https://ktluxurycars.com/${language}/vehicles/${vehicle.slug}`;

  const fleetUrl =
    `https://ktluxurycars.com/${language}/vehicles`;

  const homepageUrl =
    `https://ktluxurycars.com/${language}`;

  const description =
    language === "fr"
      ? vehicle.descriptionFr ??
        `Louez la ${vehicleName} à Marrakech avec livraison privée et assistance directe.`
      : vehicle.descriptionEn ??
        `Rent the ${vehicleName} in Marrakech with private delivery and direct assistance.`;

  const images = vehicle.images.map((image) => image.url);

  const data = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Vehicle",
        "@id": `${vehicleUrl}#vehicle`,
        name: vehicleName,
        url: vehicleUrl,
        description,
        inLanguage: language,
        image: images,
        vehicleModelDate: String(vehicle.year),
        vehicleConfiguration: vehicle.trim ?? undefined,
        vehicleTransmission: vehicle.transmission,
        fuelType: vehicle.fuelType,
        vehicleSeatingCapacity: vehicle.seats,
        numberOfDoors: vehicle.doors,
        bodyType: vehicle.category,
        brand: {
          "@type": "Brand",
          name: vehicle.brand,
        },
        model: vehicle.model,
        offers: {
          "@type": "OfferForLease",
          url: vehicleUrl,
          price: vehicle.dailyPrice,
          priceCurrency: "MAD",
          availability:
            vehicle.status === "AVAILABLE"
              ? "https://schema.org/InStock"
              : "https://schema.org/OutOfStock",
          priceSpecification: {
            "@type": "UnitPriceSpecification",
            price: vehicle.dailyPrice,
            priceCurrency: "MAD",
            unitText: "DAY",
          },
          offeredBy: {
            "@id": "https://ktluxurycars.com/#business",
          },
        },
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${vehicleUrl}#breadcrumbs`,
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: language === "fr" ? "Accueil" : "Home",
            item: homepageUrl,
          },
          {
            "@type": "ListItem",
            position: 2,
            name: language === "fr" ? "Véhicules" : "Vehicles",
            item: fleetUrl,
          },
          {
            "@type": "ListItem",
            position: 3,
            name: vehicleName,
            item: vehicleUrl,
          },
        ],
      },
    ],
  };

  return <JsonLd data={data} />;
}