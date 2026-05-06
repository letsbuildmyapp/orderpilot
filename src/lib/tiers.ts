import type { PricingTier, TierDiscount } from "@/types";

export const TIERS: Record<PricingTier, TierDiscount> = {
  retail: { tier: "retail", discount: 0, label: "Retail" },
  cafe: { tier: "cafe", discount: 0.12, label: "Cafe (12% off)" },
  restaurant: { tier: "restaurant", discount: 0.18, label: "Restaurant (18% off)" },
  wholesale: { tier: "wholesale", discount: 0.28, label: "Wholesale (28% off)" },
};

export const TIER_OPTIONS: PricingTier[] = ["retail", "cafe", "restaurant", "wholesale"];
