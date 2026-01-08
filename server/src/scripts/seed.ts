import { CreateInventoryLevelInput, ExecArgs } from "@medusajs/framework/types";
import {
  ContainerRegistrationKeys,
  Modules,
  ProductStatus,
} from "@medusajs/framework/utils";
import {
  createApiKeysWorkflow,
  createInventoryLevelsWorkflow,
  createProductCategoriesWorkflow,
  createProductsWorkflow,
  createRegionsWorkflow,
  createSalesChannelsWorkflow,
  createShippingOptionsWorkflow,
  createShippingProfilesWorkflow,
  createStockLocationsWorkflow,
  createTaxRegionsWorkflow,
  linkSalesChannelsToApiKeyWorkflow,
  linkSalesChannelsToStockLocationWorkflow,
  updateStoresWorkflow,
} from "@medusajs/medusa/core-flows";
import {
  createWorkflow,
  transform,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk";
import { updateStoresStep } from "@medusajs/medusa/core-flows";

const updateStoreCurrencies = createWorkflow(
  "update-store-currencies",
  (input: {
    supported_currencies: { currency_code: string; is_default?: boolean }[];
    store_id: string;
  }) => {
    const normalizedInput = transform({ input }, (data) => {
      return {
        selector: { id: data.input.store_id },
        update: {
          supported_currencies: data.input.supported_currencies.map(
            (currency) => {
              return {
                currency_code: currency.currency_code,
                is_default: currency.is_default ?? false,
              };
            }
          ),
        },
      };
    });

    const stores = updateStoresStep(normalizedInput);
    return new WorkflowResponse(stores);
  }
);

// Fish product data
const fishProducts = [
  // SEA FISH - PREMIUM
  {
    title: "Seer Fish",
    subtitle: "வஞ்சிரம் (Vanjaram)",
    handle: "seer-fish",
    description: "Premium Seer Fish caught fresh from the Bay of Bengal. Known for its firm texture and rich taste, perfect for frying and grilling. High in Omega-3 fatty acids and protein.",
    category: "Sea Fish - Premium",
    price: 75000, // ₹750 in paise
    weight: 1000,
    thumbnail: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&h=600&fit=crop",
  },
  {
    title: "King Fish",
    subtitle: "நெய்மீன் (Neymeen)",
    handle: "king-fish",
    description: "Premium King Fish with excellent taste and texture. A favorite for special occasions. Best for frying and making steaks.",
    category: "Sea Fish - Premium",
    price: 82000,
    weight: 1000,
    thumbnail: "https://images.unsplash.com/photo-1510130387422-82bed34b37e9?w=800&h=600&fit=crop",
  },
  {
    title: "Pomfret White",
    subtitle: "வெள்ளை வாவல் (Vellai Vaaval)",
    handle: "pomfret-white",
    description: "White Pomfret is one of the most sought-after fish for its delicate flavor and tender meat. Perfect for frying and grilling.",
    category: "Sea Fish - Premium",
    price: 65000,
    weight: 1000,
    thumbnail: "https://images.unsplash.com/photo-1534043464124-3be32fe000c9?w=800&h=600&fit=crop",
  },
  {
    title: "Pomfret Black",
    subtitle: "கருப்பு வாவல் (Karuppu Vaaval)",
    handle: "pomfret-black",
    description: "Black Pomfret with rich flavor. Great for curry and frying. Available year-round.",
    category: "Sea Fish - Premium",
    price: 50000,
    weight: 1000,
    thumbnail: "https://images.unsplash.com/photo-1534043464124-3be32fe000c9?w=800&h=600&fit=crop",
  },
  {
    title: "Red Snapper",
    subtitle: "சங்கரா மீன் (Sankara Meen)",
    handle: "red-snapper",
    description: "Fresh Red Snapper with beautiful red skin and sweet, nutty flavor. Excellent for curry and frying.",
    category: "Sea Fish - Premium",
    price: 52000,
    weight: 1000,
    thumbnail: "https://images.unsplash.com/photo-1559628376-f3fe5f782a2e?w=800&h=600&fit=crop",
  },
  {
    title: "Barramundi",
    subtitle: "கொடுவா (Koduva)",
    handle: "barramundi",
    description: "Sea Bass / Barramundi with mild, buttery flavor. Great for grilling and curry preparations.",
    category: "Sea Fish - Premium",
    price: 60000,
    weight: 1000,
    thumbnail: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&h=600&fit=crop",
  },
  {
    title: "Indian Salmon",
    subtitle: "காலா மீன் (Kaala Meen)",
    handle: "indian-salmon",
    description: "Indian Salmon with rich taste. Seasonal availability. Best for frying and curry.",
    category: "Sea Fish - Premium",
    price: 45000,
    weight: 1000,
    thumbnail: "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=800&h=600&fit=crop",
  },
  // SEA FISH - REGULAR
  {
    title: "Mackerel",
    subtitle: "அயிலா (Ayila)",
    handle: "mackerel",
    description: "Fresh Mackerel, a staple in South Indian cuisine. Rich in omega-3 and perfect for everyday cooking. Budget-friendly option.",
    category: "Sea Fish - Regular",
    price: 18000,
    weight: 1000,
    thumbnail: "https://images.unsplash.com/photo-1544551763-77ef2d0cfc6c?w=800&h=600&fit=crop",
  },
  {
    title: "Sardine",
    subtitle: "மத்தி (Mathi)",
    handle: "sardine",
    description: "Fresh Sardines, packed with nutrition. A budget-friendly option with great taste. High in calcium and protein.",
    category: "Sea Fish - Regular",
    price: 12000,
    weight: 1000,
    thumbnail: "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=800&h=600&fit=crop",
  },
  {
    title: "Anchovy",
    subtitle: "நெத்திலி (Nethili)",
    handle: "anchovy",
    description: "Small, flavorful anchovies. A staple for South Indian households. Great for frying and making dry preparations.",
    category: "Sea Fish - Regular",
    price: 15000,
    weight: 1000,
    thumbnail: "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=800&h=600&fit=crop",
  },
  {
    title: "Trevally",
    subtitle: "பாரை (Paarai)",
    handle: "trevally",
    description: "Fresh Trevally with firm flesh. Great for curry and frying. Available year-round.",
    category: "Sea Fish - Regular",
    price: 32000,
    weight: 1000,
    thumbnail: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&h=600&fit=crop",
  },
  {
    title: "Ribbon Fish",
    subtitle: "வாளை (Vaalai)",
    handle: "ribbon-fish",
    description: "Long, silver Ribbon Fish. Best for frying. Unique taste and texture.",
    category: "Sea Fish - Regular",
    price: 28000,
    weight: 1000,
    thumbnail: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&h=600&fit=crop",
  },
  {
    title: "Silver Belly",
    subtitle: "காரை (Kaarai)",
    handle: "silver-belly",
    description: "Small Silver Belly fish. Budget-friendly and great for frying. High in calcium.",
    category: "Sea Fish - Regular",
    price: 12000,
    weight: 1000,
    thumbnail: "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=800&h=600&fit=crop",
  },
  {
    title: "Sole Fish",
    subtitle: "நாக்கு மீன் (Naakku Meen)",
    handle: "sole-fish",
    description: "Flat Sole Fish with delicate flavor. Perfect for frying. Tender white flesh.",
    category: "Sea Fish - Regular",
    price: 32000,
    weight: 1000,
    thumbnail: "https://images.unsplash.com/photo-1534043464124-3be32fe000c9?w=800&h=600&fit=crop",
  },
  {
    title: "Croaker",
    subtitle: "கோரா (Kora)",
    handle: "croaker",
    description: "Fresh Croaker fish. Good for frying and curry. Mild flavor.",
    category: "Sea Fish - Regular",
    price: 25000,
    weight: 1000,
    thumbnail: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&h=600&fit=crop",
  },
  // PRAWNS
  {
    title: "Tiger Prawns",
    subtitle: "புலி இறால் (Puli Iraal)",
    handle: "tiger-prawns",
    description: "Large Tiger Prawns with firm texture and sweet taste. Perfect for grilling and special dishes. Premium quality.",
    category: "Prawns",
    price: 78000,
    weight: 1000,
    thumbnail: "https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?w=800&h=600&fit=crop",
  },
  {
    title: "White Prawns",
    subtitle: "வெள்ளை இறால் (Vellai Iraal)",
    handle: "white-prawns",
    description: "Medium-sized white prawns, perfect for everyday cooking and curries. Fresh and delicious.",
    category: "Prawns",
    price: 48000,
    weight: 1000,
    thumbnail: "https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?w=800&h=600&fit=crop",
  },
  {
    title: "Brown Prawns",
    subtitle: "பழுப்பு இறால் (Pazhuppu Iraal)",
    handle: "brown-prawns",
    description: "Fresh Brown Prawns. Great for curry and frying. Good value for money.",
    category: "Prawns",
    price: 42000,
    weight: 1000,
    thumbnail: "https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?w=800&h=600&fit=crop",
  },
  {
    title: "Flower Prawns",
    subtitle: "பூ இறால் (Poo Iraal)",
    handle: "flower-prawns",
    description: "Large Flower Prawns with distinctive markings. Excellent for grilling and butter preparations.",
    category: "Prawns",
    price: 65000,
    weight: 1000,
    thumbnail: "https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?w=800&h=600&fit=crop",
  },
  {
    title: "Small Prawns",
    subtitle: "சிறிய இறால் (Chiriya Iraal)",
    handle: "small-prawns",
    description: "Small-sized prawns, perfect for rice dishes and quick fries. Budget-friendly.",
    category: "Prawns",
    price: 28000,
    weight: 1000,
    thumbnail: "https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?w=800&h=600&fit=crop",
  },
  // CRABS
  {
    title: "Mud Crab",
    subtitle: "சதுப்பு நண்டு (Sathuppu Nandu)",
    handle: "mud-crab",
    description: "Large Mud Crabs with sweet, succulent meat. A delicacy for crab lovers. Great for curry and pepper preparations.",
    category: "Crabs",
    price: 65000,
    weight: 1000,
    thumbnail: "https://images.unsplash.com/photo-1510130387422-82bed34b37e9?w=800&h=600&fit=crop",
  },
  {
    title: "Blue Swimmer Crab",
    subtitle: "நீல நண்டு (Neela Nandu)",
    handle: "blue-swimmer-crab",
    description: "Blue Swimmer Crabs with delicate sweet meat. Perfect for rasam and curry dishes.",
    category: "Crabs",
    price: 50000,
    weight: 1000,
    thumbnail: "https://images.unsplash.com/photo-1510130387422-82bed34b37e9?w=800&h=600&fit=crop",
  },
  {
    title: "Green Crab",
    subtitle: "பச்சை நண்டு (Pachai Nandu)",
    handle: "green-crab",
    description: "Fresh Green Crabs. Great for traditional crab curry. Good meat content.",
    category: "Crabs",
    price: 45000,
    weight: 1000,
    thumbnail: "https://images.unsplash.com/photo-1510130387422-82bed34b37e9?w=800&h=600&fit=crop",
  },
  // SQUID & CUTTLEFISH
  {
    title: "Squid",
    subtitle: "ஊசி கணவாய் (Oosi Kanavai)",
    handle: "squid",
    description: "Fresh Squid with tender texture. Perfect for stir-fries and grilling. Clean and ready to cook.",
    category: "Squid",
    price: 38000,
    weight: 1000,
    thumbnail: "https://images.unsplash.com/photo-1604909052743-94e838986d24?w=800&h=600&fit=crop",
  },
  {
    title: "Cuttlefish",
    subtitle: "கணவாய் (Kanavai)",
    handle: "cuttlefish",
    description: "Fresh Cuttlefish. Great for curry and frying. Tender when cooked right.",
    category: "Squid",
    price: 35000,
    weight: 1000,
    thumbnail: "https://images.unsplash.com/photo-1604909052743-94e838986d24?w=800&h=600&fit=crop",
  },
  {
    title: "Baby Squid",
    subtitle: "குட்டி கணவாய் (Kutti Kanavai)",
    handle: "baby-squid",
    description: "Small, tender Baby Squid. Perfect for quick frying. Seasonal availability.",
    category: "Squid",
    price: 45000,
    weight: 1000,
    thumbnail: "https://images.unsplash.com/photo-1604909052743-94e838986d24?w=800&h=600&fit=crop",
  },
  // RIVER FISH
  {
    title: "Rohu",
    subtitle: "கெண்டை (Kendai)",
    handle: "rohu",
    description: "Fresh Rohu from local farms. A popular choice for traditional fish curry. Farm fresh quality.",
    category: "River Fish",
    price: 22000,
    weight: 1000,
    thumbnail: "https://images.unsplash.com/photo-1534043464124-3be32fe000c9?w=800&h=600&fit=crop",
  },
  {
    title: "Catla",
    subtitle: "கட்லா (Katla)",
    handle: "catla",
    description: "Fresh Catla fish. Great for curry preparations. Farm raised with care.",
    category: "River Fish",
    price: 22000,
    weight: 1000,
    thumbnail: "https://images.unsplash.com/photo-1534043464124-3be32fe000c9?w=800&h=600&fit=crop",
  },
  {
    title: "Tilapia",
    subtitle: "திலாபியா (Tilapia)",
    handle: "tilapia",
    description: "Fresh Tilapia. Mild flavor, great for frying and curry. Budget-friendly option.",
    category: "River Fish",
    price: 16000,
    weight: 1000,
    thumbnail: "https://images.unsplash.com/photo-1534043464124-3be32fe000c9?w=800&h=600&fit=crop",
  },
  {
    title: "Murrel",
    subtitle: "விரால் (Viral)",
    handle: "murrel",
    description: "Fresh Murrel / Snakehead fish. Premium river fish. Excellent for curry and frying.",
    category: "River Fish",
    price: 45000,
    weight: 1000,
    thumbnail: "https://images.unsplash.com/photo-1534043464124-3be32fe000c9?w=800&h=600&fit=crop",
  },
  // DRIED FISH
  {
    title: "Dried Sardine",
    subtitle: "மத்தி கருவாடு (Mathi Karuvadu)",
    handle: "dried-sardine",
    description: "Sun-dried Sardines. Traditional dried fish. Great for frying and making kulambu.",
    category: "Dried Fish",
    price: 50000,
    weight: 1000,
    thumbnail: "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=800&h=600&fit=crop",
  },
  {
    title: "Dried Anchovy",
    subtitle: "நெத்திலி கருவாடு (Nethili Karuvadu)",
    handle: "dried-anchovy",
    description: "Dried Anchovies. Perfect for frying and making chutney. Long shelf life.",
    category: "Dried Fish",
    price: 60000,
    weight: 1000,
    thumbnail: "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=800&h=600&fit=crop",
  },
  {
    title: "Dried Prawns",
    subtitle: "இறால் கருவாடு (Iraal Karuvadu)",
    handle: "dried-prawns",
    description: "Sun-dried Prawns. Adds great flavor to dishes. Premium quality dried seafood.",
    category: "Dried Fish",
    price: 90000,
    weight: 1000,
    thumbnail: "https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?w=800&h=600&fit=crop",
  },
];

export default async function seedDemoData({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER);
  const link = container.resolve(ContainerRegistrationKeys.LINK);
  const query = container.resolve(ContainerRegistrationKeys.QUERY);
  const fulfillmentModuleService = container.resolve(Modules.FULFILLMENT);
  const salesChannelModuleService = container.resolve(Modules.SALES_CHANNEL);
  const storeModuleService = container.resolve(Modules.STORE);

  logger.info("🐟 Starting FreshCatch seed data...");

  // India region
  const countries = ["in"];

  logger.info("Setting up store...");
  const [store] = await storeModuleService.listStores();

  await updateStoresWorkflow(container).run({
    input: {
      selector: { id: store.id },
      update: {
        name: "FreshCatch",
        supported_locales: [
          { locale_code: "en-IN" },
          { locale_code: "ta-IN" },
        ],
      },
    },
  });

  let defaultSalesChannel = await salesChannelModuleService.listSalesChannels({
    name: "FreshCatch Webshop",
  });

  if (!defaultSalesChannel.length) {
    const { result: salesChannelResult } = await createSalesChannelsWorkflow(
      container
    ).run({
      input: {
        salesChannelsData: [
          {
            name: "FreshCatch Webshop",
            description: "Fresh fish delivery storefront",
          },
        ],
      },
    });
    defaultSalesChannel = salesChannelResult;
  }

  await updateStoreCurrencies(container).run({
    input: {
      store_id: store.id,
      supported_currencies: [
        {
          currency_code: "inr",
          is_default: true,
        },
      ],
    },
  });

  await updateStoresWorkflow(container).run({
    input: {
      selector: { id: store.id },
      update: {
        default_sales_channel_id: defaultSalesChannel[0].id,
      },
    },
  });

  logger.info("Checking for existing India region...");
  const regionModuleService = container.resolve(Modules.REGION);
  let existingRegions = await regionModuleService.listRegions({ name: "India" });
  let region;

  if (existingRegions.length > 0) {
    logger.info("India region already exists, skipping creation...");
    region = existingRegions[0];
  } else {
    logger.info("Creating India region...");
    const { result: regionResult } = await createRegionsWorkflow(container).run({
      input: {
        regions: [
          {
            name: "India",
            currency_code: "inr",
            countries,
            payment_providers: ["pp_system_default"],
          },
        ],
      },
    });
    region = regionResult[0];
  }

  logger.info("Creating tax region...");
  try {
    await createTaxRegionsWorkflow(container).run({
      input: countries.map((country_code) => ({
        country_code,
        provider_id: "tp_system",
        default_tax_rate: {
          rate: 5, // 5% GST for fish
          name: "GST",
        },
      })),
    });
  } catch (e: any) {
    if (e.message?.includes("already")) {
      logger.info("Tax region already exists, skipping...");
    } else {
      throw e;
    }
  }

  logger.info("Creating stock location...");
  const stockLocationModuleService = container.resolve(Modules.STOCK_LOCATION);
  let existingLocations = await stockLocationModuleService.listStockLocations({ name: "Chennai Fish Warehouse" });
  let stockLocation;

  if (existingLocations.length > 0) {
    logger.info("Stock location already exists, skipping...");
    stockLocation = existingLocations[0];
  } else {
    const { result: stockLocationResult } = await createStockLocationsWorkflow(
      container
    ).run({
      input: {
        locations: [
          {
            name: "Chennai Fish Warehouse",
            address: {
              city: "Chennai",
              country_code: "IN",
              province: "Tamil Nadu",
              address_1: "Kasimedu Fishing Harbour",
              postal_code: "600081",
            },
          },
        ],
      },
    });
    stockLocation = stockLocationResult[0];

    await updateStoresWorkflow(container).run({
      input: {
        selector: { id: store.id },
        update: {
          default_location_id: stockLocation.id,
        },
      },
    });

    try {
      await link.create({
        [Modules.STOCK_LOCATION]: {
          stock_location_id: stockLocation.id,
        },
        [Modules.FULFILLMENT]: {
          fulfillment_provider_id: "manual_manual",
        },
      });
    } catch (e) {
      logger.info("Stock location link already exists, skipping...");
    }
  }

  logger.info("Setting up fulfillment...");
  const shippingProfiles = await fulfillmentModuleService.listShippingProfiles({
    type: "default",
  });
  let shippingProfile = shippingProfiles.length ? shippingProfiles[0] : null;

  if (!shippingProfile) {
    const { result: shippingProfileResult } =
      await createShippingProfilesWorkflow(container).run({
        input: {
          data: [
            {
              name: "Fish Delivery Profile",
              type: "default",
            },
          ],
        },
      });
    shippingProfile = shippingProfileResult[0];
  }

  let fulfillmentSets = await fulfillmentModuleService.listFulfillmentSets({ name: "Chennai Delivery" });
  let fulfillmentSet;

  if (fulfillmentSets.length > 0) {
    logger.info("Fulfillment set already exists, skipping...");
    fulfillmentSet = fulfillmentSets[0];
  } else {
    fulfillmentSet = await fulfillmentModuleService.createFulfillmentSets({
      name: "Chennai Delivery",
      type: "shipping",
      service_zones: [
        {
          name: "Chennai Metro",
          geo_zones: [
            {
              country_code: "in",
              type: "country",
            },
          ],
        },
      ],
    });

    try {
      await link.create({
        [Modules.STOCK_LOCATION]: {
          stock_location_id: stockLocation.id,
        },
        [Modules.FULFILLMENT]: {
          fulfillment_set_id: fulfillmentSet.id,
        },
      });
    } catch (e) {
      logger.info("Fulfillment link already exists, skipping...");
    }
  }

  // Check if shipping options already exist
  const existingShippingOptions = await fulfillmentModuleService.listShippingOptions({});
  if (existingShippingOptions.length === 0 && fulfillmentSet.service_zones?.length > 0) {
    await createShippingOptionsWorkflow(container).run({
      input: [
        {
          name: "Sunrise Delivery (6-8 AM)",
          price_type: "flat",
          provider_id: "manual_manual",
          service_zone_id: fulfillmentSet.service_zones[0].id,
          shipping_profile_id: shippingProfile!.id,
          type: {
            label: "Sunrise",
            description: "Early morning delivery for fresh cooking",
            code: "sunrise",
          },
          prices: [
            {
              currency_code: "inr",
              amount: 0,
            },
            {
              region_id: region.id,
              amount: 0,
            },
          ],
          rules: [
            {
              attribute: "enabled_in_store",
              value: "true",
              operator: "eq",
            },
            {
              attribute: "is_return",
              value: "false",
              operator: "eq",
            },
          ],
        },
        {
          name: "Morning Delivery (8 AM - 12 PM)",
          price_type: "flat",
          provider_id: "manual_manual",
          service_zone_id: fulfillmentSet.service_zones[0].id,
          shipping_profile_id: shippingProfile!.id,
          type: {
            label: "Morning",
            description: "Standard morning delivery",
            code: "morning",
          },
          prices: [
            {
              currency_code: "inr",
              amount: 0,
            },
            {
              region_id: region.id,
              amount: 0,
            },
          ],
          rules: [
            {
              attribute: "enabled_in_store",
              value: "true",
              operator: "eq",
            },
            {
              attribute: "is_return",
              value: "false",
              operator: "eq",
            },
          ],
        },
        {
          name: "Evening Delivery (4-7 PM)",
          price_type: "flat",
          provider_id: "manual_manual",
          service_zone_id: fulfillmentSet.service_zones[0].id,
          shipping_profile_id: shippingProfile!.id,
          type: {
            label: "Evening",
            description: "Evening delivery slot",
            code: "evening",
          },
          prices: [
            {
              currency_code: "inr",
              amount: 3000,
            },
            {
              region_id: region.id,
              amount: 3000,
            },
          ],
          rules: [
            {
              attribute: "enabled_in_store",
              value: "true",
              operator: "eq",
            },
            {
              attribute: "is_return",
              value: "false",
              operator: "eq",
            },
          ],
        },
      ],
    });
  } else {
    logger.info("Shipping options already exist, skipping...");
  }

  try {
    await linkSalesChannelsToStockLocationWorkflow(container).run({
      input: {
        id: stockLocation.id,
        add: [defaultSalesChannel[0].id],
      },
    });
  } catch (e) {
    logger.info("Sales channel link already exists, skipping...");
  }

  logger.info("Checking for publishable API key...");
  const apiKeyModuleService = container.resolve(Modules.API_KEY);
  let existingApiKeys = await apiKeyModuleService.listApiKeys({ title: "FreshCatch Storefront" });
  let publishableApiKey;

  if (existingApiKeys.length > 0) {
    logger.info("API key already exists, skipping...");
    publishableApiKey = existingApiKeys[0];
  } else {
    const { result: publishableApiKeyResult } = await createApiKeysWorkflow(
      container
    ).run({
      input: {
        api_keys: [
          {
            title: "FreshCatch Storefront",
            type: "publishable",
            created_by: "",
          },
        ],
      },
    });
    publishableApiKey = publishableApiKeyResult[0];

    try {
      await linkSalesChannelsToApiKeyWorkflow(container).run({
        input: {
          id: publishableApiKey.id,
          add: [defaultSalesChannel[0].id],
        },
      });
    } catch (e) {
      logger.info("API key link already exists, skipping...");
    }
  }

  logger.info("Checking for product categories...");
  const productModuleService = container.resolve(Modules.PRODUCT);
  let existingCategories = await productModuleService.listProductCategories({});
  let categoryResult;

  if (existingCategories.length > 0) {
    logger.info("Categories already exist, using existing...");
    categoryResult = existingCategories;
  } else {
    const { result } = await createProductCategoriesWorkflow(
      container
    ).run({
      input: {
        product_categories: [
          {
            name: "Sea Fish - Premium",
            handle: "sea-fish-premium",
            is_active: true,
            metadata: { tamil_name: "கடல் மீன் - பிரீமியம்" },
          },
          {
            name: "Sea Fish - Regular",
            handle: "sea-fish-regular",
            is_active: true,
            metadata: { tamil_name: "கடல் மீன்" },
          },
          {
            name: "Prawns",
            handle: "prawns",
            is_active: true,
            metadata: { tamil_name: "இறால்" },
          },
          {
            name: "Crabs",
            handle: "crabs",
            is_active: true,
            metadata: { tamil_name: "நண்டு" },
          },
          {
            name: "Squid",
            handle: "squid",
            is_active: true,
            metadata: { tamil_name: "கணவாய்" },
          },
          {
            name: "River Fish",
            handle: "river-fish",
            is_active: true,
            metadata: { tamil_name: "ஆற்று மீன்" },
          },
          {
            name: "Dried Fish",
            handle: "dried-fish",
            is_active: true,
            metadata: { tamil_name: "கருவாடு" },
          },
        ],
      },
    });
    categoryResult = result;
  }

  logger.info("Checking for existing products...");
  const existingProducts = await productModuleService.listProducts({});

  if (existingProducts.length > 0) {
    logger.info(`Found ${existingProducts.length} existing products, skipping product creation...`);
  } else {
    logger.info("Creating fish products...");

    const productsToCreate = fishProducts.map((fish) => {
      const category = categoryResult.find((cat: any) => cat.name === fish.category);

      return {
        title: fish.title,
        subtitle: fish.subtitle,
        handle: fish.handle,
        description: fish.description,
        category_ids: category ? [category.id] : [],
        weight: fish.weight,
        status: ProductStatus.PUBLISHED,
        shipping_profile_id: shippingProfile!.id,
        thumbnail: fish.thumbnail,
        images: [{ url: fish.thumbnail }],
        options: [
          {
            title: "Cleaning",
            values: ["Whole", "Cleaned", "Cut Pieces", "Fillet"],
          },
          {
            title: "Quantity",
            values: ["500g", "1kg", "2kg"],
          },
        ],
        variants: [
          // 500g variants
          {
            title: "500g / Whole",
            sku: `${fish.handle.toUpperCase()}-500G-WHOLE`,
            options: { Cleaning: "Whole", Quantity: "500g" },
            prices: [{ amount: Math.round(fish.price * 0.5), currency_code: "inr" }],
          },
          {
            title: "500g / Cleaned",
            sku: `${fish.handle.toUpperCase()}-500G-CLEANED`,
            options: { Cleaning: "Cleaned", Quantity: "500g" },
            prices: [{ amount: Math.round(fish.price * 0.5) + 1000, currency_code: "inr" }],
          },
          // 1kg variants
          {
            title: "1kg / Whole",
            sku: `${fish.handle.toUpperCase()}-1KG-WHOLE`,
            options: { Cleaning: "Whole", Quantity: "1kg" },
            prices: [{ amount: fish.price, currency_code: "inr" }],
          },
          {
            title: "1kg / Cleaned",
            sku: `${fish.handle.toUpperCase()}-1KG-CLEANED`,
            options: { Cleaning: "Cleaned", Quantity: "1kg" },
            prices: [{ amount: fish.price + 2000, currency_code: "inr" }],
          },
          {
            title: "1kg / Cut Pieces",
            sku: `${fish.handle.toUpperCase()}-1KG-CUT`,
            options: { Cleaning: "Cut Pieces", Quantity: "1kg" },
            prices: [{ amount: fish.price + 3000, currency_code: "inr" }],
          },
          {
            title: "1kg / Fillet",
            sku: `${fish.handle.toUpperCase()}-1KG-FILLET`,
            options: { Cleaning: "Fillet", Quantity: "1kg" },
            prices: [{ amount: fish.price + 5000, currency_code: "inr" }],
          },
          // 2kg variants
          {
            title: "2kg / Whole",
            sku: `${fish.handle.toUpperCase()}-2KG-WHOLE`,
            options: { Cleaning: "Whole", Quantity: "2kg" },
            prices: [{ amount: fish.price * 2, currency_code: "inr" }],
          },
          {
            title: "2kg / Cleaned",
            sku: `${fish.handle.toUpperCase()}-2KG-CLEANED`,
            options: { Cleaning: "Cleaned", Quantity: "2kg" },
            prices: [{ amount: fish.price * 2 + 4000, currency_code: "inr" }],
          },
        ],
        sales_channels: [{ id: defaultSalesChannel[0].id }],
      };
    });

    await createProductsWorkflow(container).run({
      input: {
        products: productsToCreate,
      },
    });
  }

  logger.info("Setting up inventory...");
  try {
    const { data: inventoryItems } = await query.graph({
      entity: "inventory_item",
      fields: ["id"],
    });

    if (inventoryItems.length > 0) {
      const inventoryLevels: CreateInventoryLevelInput[] = [];
      for (const inventoryItem of inventoryItems) {
        inventoryLevels.push({
          location_id: stockLocation.id,
          stocked_quantity: 100000, // 100kg stock each
          inventory_item_id: inventoryItem.id,
        });
      }

      await createInventoryLevelsWorkflow(container).run({
        input: {
          inventory_levels: inventoryLevels,
        },
      });
    }
  } catch (e: any) {
    if (e.message?.includes("already")) {
      logger.info("Inventory levels already exist, skipping...");
    } else {
      logger.warn(`Inventory setup warning: ${e.message}`);
    }
  }

  logger.info("✅ FreshCatch seed completed!");
  logger.info(`📦 Fish products: ${fishProducts.length} configured`);
  logger.info(`🔑 Publishable API Key: ${publishableApiKey.token || publishableApiKey.id}`);
  logger.info("🚀 You can now start the server and access the storefront!");
}
