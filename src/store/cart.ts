import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Configuration, QuoteLine } from "@/types";
import { computeLineCents, summarizeConfig } from "@/lib/pricing";
import { findProduct } from "@/seed/products";
import { shortId } from "@/lib/utils";
import type { PricingTier } from "@/types";

interface CartState {
  lines: QuoteLine[];
  addLine(productId: string, config: Configuration, tier: PricingTier): void;
  removeLine(id: string): void;
  updateQuantity(id: string, qty: number, tier: PricingTier): void;
  clear(): void;
  hydrateForTier(tier: PricingTier): void;
}

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      lines: [],
      addLine(productId, config, tier) {
        const product = findProduct(productId);
        if (!product) return;
        const { unitCents, lineCents, quantity } = computeLineCents(product, config, tier);
        const line: QuoteLine = {
          id: shortId(),
          productId,
          productName: product.name,
          config,
          quantity,
          unitCents,
          lineCents,
          configSummary: summarizeConfig(product, config),
        };
        set({ lines: [...get().lines, line] });
      },
      removeLine(id) {
        set({ lines: get().lines.filter((l) => l.id !== id) });
      },
      updateQuantity(id, qty, tier) {
        const lines = get().lines.map((l) => {
          if (l.id !== id) return l;
          const product = findProduct(l.productId);
          if (!product) return l;
          const newConfig = { ...l.config, quantity: qty };
          const { unitCents, lineCents, quantity } = computeLineCents(product, newConfig, tier);
          return { ...l, config: newConfig, quantity, unitCents, lineCents };
        });
        set({ lines });
      },
      clear() {
        set({ lines: [] });
      },
      hydrateForTier(tier) {
        const lines = get().lines.map((l) => {
          const product = findProduct(l.productId);
          if (!product) return l;
          const { unitCents, lineCents, quantity } = computeLineCents(product, l.config, tier);
          return { ...l, unitCents, lineCents, quantity };
        });
        set({ lines });
      },
    }),
    { name: "orderpilot-cart" }
  )
);
