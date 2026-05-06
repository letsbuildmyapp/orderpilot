import type { Product } from "@/types";

const GRIND_OPTIONS = [
  { value: "whole", label: "Whole bean" },
  { value: "espresso", label: "Espresso", priceModifier: 50 },
  { value: "filter", label: "Filter / pour-over", priceModifier: 50 },
  { value: "french", label: "French press", priceModifier: 50 },
];

const ROAST_OPTIONS = [
  { value: "light", label: "Light" },
  { value: "medium", label: "Medium" },
  { value: "medium-dark", label: "Medium-dark" },
  { value: "dark", label: "Dark" },
];

const PACK_OPTIONS = [
  { value: "12oz", label: "12 oz retail bag" },
  { value: "2lb", label: "2 lb cafe bag", percentModifier: 1.4 }, // bigger bag = higher unit
  { value: "5lb", label: "5 lb wholesale bag", percentModifier: 2.6 },
];

const VOLUME_TIERS = [
  { min: 25, discount: 0.05 },
  { min: 50, discount: 0.10 },
  { min: 100, discount: 0.15 },
];

export const PRODUCTS: Product[] = [
  {
    id: "ethiopia-yirgacheffe",
    slug: "ethiopia-yirgacheffe",
    name: "Yirgacheffe",
    tagline: "Bright, jasmine, citrus rind.",
    origin: "Ethiopia · Gedeo Zone",
    category: "single-origin",
    description:
      "A washed Heirloom from cooperatives at 1,950–2,200m. Notes of bergamot, white peach, and orange blossom.",
    longDescription:
      "Sourced through long-standing relationships with the Yirgacheffe Coffee Farmers Cooperative Union. Farmers hand-pick at peak ripeness, then wet-process at the local washing station. The cup is delicate, tea-like, and unmistakably floral.",
    image: "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=1200&q=80",
    notes: ["Bergamot", "White peach", "Orange blossom", "Black tea"],
    attributes: [
      { id: "roast", label: "Roast", kind: "select", options: ROAST_OPTIONS, defaultValue: "light" },
      { id: "grind", label: "Grind", kind: "select", options: GRIND_OPTIONS, defaultValue: "whole" },
      { id: "pack", label: "Bag size", kind: "select", options: PACK_OPTIONS, defaultValue: "12oz" },
      { id: "quantity", label: "Quantity", kind: "number", min: 1, max: 500, step: 1, defaultValue: 6, unit: " bags" },
    ],
    constraints: [
      {
        kind: "disable",
        when: { attr: "roast", equals: "dark" },
        target: { attr: "pack", values: ["5lb"] },
        reason: "Dark roast not offered in 5 lb wholesale (preserves freshness).",
      },
      {
        kind: "min",
        when: { attr: "pack", equals: "5lb" },
        target: { attr: "quantity", value: 4 },
        reason: "5 lb bags ship in cases of 4.",
      },
    ],
    pricing: [
      { kind: "base", cents: 2200 }, // $22.00 base 12oz
      { kind: "optionModifier", attr: "grind" },
      { kind: "optionPercent", attr: "pack" },
      { kind: "volumeBreak", attr: "quantity", tiers: VOLUME_TIERS },
    ],
  },
  {
    id: "colombia-huila",
    slug: "colombia-huila",
    name: "Huila",
    tagline: "Caramel, milk chocolate, red apple.",
    origin: "Colombia · Huila",
    category: "single-origin",
    description:
      "A balanced washed Caturra/Castillo from smallholders in the Acevedo municipality. Sweet, syrupy, dependable.",
    longDescription:
      "Huila is one of the most reliable origins for everyday specialty. We blend lots from 12 producers to keep the profile consistent year-round — caramel sweetness with a clean apple finish.",
    image: "https://images.unsplash.com/photo-1610632380989-680fe40816c6?w=1200&q=80",
    notes: ["Caramel", "Milk chocolate", "Red apple", "Brown sugar"],
    attributes: [
      { id: "roast", label: "Roast", kind: "select", options: ROAST_OPTIONS, defaultValue: "medium" },
      { id: "grind", label: "Grind", kind: "select", options: GRIND_OPTIONS, defaultValue: "whole" },
      { id: "pack", label: "Bag size", kind: "select", options: PACK_OPTIONS, defaultValue: "12oz" },
      { id: "quantity", label: "Quantity", kind: "number", min: 1, max: 500, step: 1, defaultValue: 6, unit: " bags" },
    ],
    constraints: [
      {
        kind: "min",
        when: { attr: "pack", equals: "5lb" },
        target: { attr: "quantity", value: 4 },
        reason: "5 lb bags ship in cases of 4.",
      },
    ],
    pricing: [
      { kind: "base", cents: 1850 },
      { kind: "optionModifier", attr: "grind" },
      { kind: "optionPercent", attr: "pack" },
      { kind: "volumeBreak", attr: "quantity", tiers: VOLUME_TIERS },
    ],
  },
  {
    id: "house-blend-paloma",
    slug: "house-blend-paloma",
    name: "Paloma House Blend",
    tagline: "Cocoa, hazelnut, dried cherry.",
    origin: "Brazil + Guatemala blend",
    category: "blend",
    description:
      "Built for milk drinks. A bittersweet espresso base that cuts cleanly through steamed milk.",
    longDescription:
      "Paloma is our flagship espresso blend — Brazilian Cerrado for body, Guatemalan Huehuetenango for clarity. Designed to pull a sweet, syrupy shot with notes of cocoa and toasted hazelnut.",
    image: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=1200&q=80",
    notes: ["Cocoa nibs", "Hazelnut", "Dried cherry", "Molasses"],
    attributes: [
      { id: "roast", label: "Roast", kind: "select", options: ROAST_OPTIONS.filter(r => r.value !== "light"), defaultValue: "medium-dark" },
      { id: "grind", label: "Grind", kind: "select", options: GRIND_OPTIONS, defaultValue: "espresso" },
      { id: "pack", label: "Bag size", kind: "select", options: PACK_OPTIONS, defaultValue: "2lb" },
      { id: "quantity", label: "Quantity", kind: "number", min: 1, max: 500, step: 1, defaultValue: 12, unit: " bags" },
    ],
    constraints: [
      {
        kind: "min",
        when: { attr: "pack", equals: "5lb" },
        target: { attr: "quantity", value: 4 },
        reason: "5 lb bags ship in cases of 4.",
      },
      {
        kind: "min",
        when: { attr: "pack", equals: "2lb" },
        target: { attr: "quantity", value: 6 },
        reason: "Cafe 2 lb bags ship in cases of 6.",
      },
    ],
    pricing: [
      { kind: "base", cents: 1750 },
      { kind: "optionModifier", attr: "grind" },
      { kind: "optionPercent", attr: "pack" },
      { kind: "volumeBreak", attr: "quantity", tiers: VOLUME_TIERS },
    ],
  },
  {
    id: "decaf-sugar-cane",
    slug: "decaf-sugar-cane",
    name: "Decaf Descanso",
    tagline: "Sugar-cane processed. Honey, fig, vanilla.",
    origin: "Colombia · Tolima",
    category: "decaf",
    description:
      "A natural EA decaf with surprising depth. The sugar-cane process keeps sweetness intact.",
    longDescription:
      "Caffeine is removed using ethyl acetate derived from local sugar cane — a gentler process that preserves more of the bean's character. Tastes like a great Colombian, just without the kick.",
    image: "https://images.unsplash.com/photo-1607681034540-2c46cc71896d?w=1200&q=80",
    notes: ["Honey", "Fig", "Vanilla", "Almond"],
    attributes: [
      { id: "roast", label: "Roast", kind: "select", options: ROAST_OPTIONS, defaultValue: "medium" },
      { id: "grind", label: "Grind", kind: "select", options: GRIND_OPTIONS, defaultValue: "whole" },
      { id: "pack", label: "Bag size", kind: "select", options: PACK_OPTIONS, defaultValue: "12oz" },
      { id: "quantity", label: "Quantity", kind: "number", min: 1, max: 500, step: 1, defaultValue: 4, unit: " bags" },
    ],
    constraints: [
      {
        kind: "disable",
        when: { attr: "roast", equals: "dark" },
        target: { attr: "pack", values: ["5lb"] },
        reason: "Dark decaf is not stable in 5 lb format.",
      },
    ],
    pricing: [
      { kind: "base", cents: 2400 },
      { kind: "optionModifier", attr: "grind" },
      { kind: "optionPercent", attr: "pack" },
      { kind: "volumeBreak", attr: "quantity", tiers: VOLUME_TIERS },
    ],
  },
  {
    id: "cold-brew-concentrate",
    slug: "cold-brew-concentrate",
    name: "Cold Brew Concentrate",
    tagline: "1:4 dilution. Smooth, low-acid, ready to pour.",
    origin: "Brazil + Ethiopia blend",
    category: "cold-brew",
    description:
      "Slow-steeped 18 hours, kegged or bottled. For cafes, restaurants, and offices that want quality without the prep.",
    longDescription:
      "Brewed in small batches with a custom blend of Brazilian Cerrado and washed Ethiopian. Available in 32 oz bottles, 64 oz growlers, or sanitary 5-gallon kegs. Refrigerate after delivery.",
    image: "https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?w=1200&q=80",
    notes: ["Dark chocolate", "Toasted nuts", "Brown sugar"],
    attributes: [
      {
        id: "format",
        label: "Format",
        kind: "select",
        options: [
          { value: "bottle", label: "32 oz bottle" },
          { value: "growler", label: "64 oz growler", priceModifier: 600 },
          { value: "keg", label: "5 gal keg", priceModifier: 5500 },
        ],
        defaultValue: "bottle",
      },
      {
        id: "delivery",
        label: "Delivery",
        kind: "select",
        options: [
          { value: "weekly", label: "Weekly" },
          { value: "biweekly", label: "Bi-weekly" },
          { value: "onetime", label: "One-time", priceModifier: 200 },
        ],
        defaultValue: "weekly",
      },
      { id: "quantity", label: "Quantity", kind: "number", min: 1, max: 200, step: 1, defaultValue: 12, unit: " units" },
    ],
    constraints: [
      {
        kind: "min",
        when: { attr: "format", equals: "keg" },
        target: { attr: "quantity", value: 2 },
        reason: "Kegs ship in pairs (one swap, one in service).",
      },
      {
        kind: "min",
        when: { attr: "format", equals: "bottle" },
        target: { attr: "quantity", value: 6 },
        reason: "Bottles ship in cases of 6.",
      },
    ],
    pricing: [
      { kind: "base", cents: 1200 },
      { kind: "optionModifier", attr: "format" },
      { kind: "optionModifier", attr: "delivery" },
      { kind: "volumeBreak", attr: "quantity", tiers: [{ min: 12, discount: 0.05 }, { min: 24, discount: 0.10 }, { min: 48, discount: 0.15 }] },
    ],
  },
];

export function findProduct(slug: string): Product | undefined {
  return PRODUCTS.find((p) => p.slug === slug || p.id === slug);
}
