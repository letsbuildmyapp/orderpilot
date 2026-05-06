export type PricingTier = "retail" | "cafe" | "restaurant" | "wholesale";

export interface TierDiscount {
  tier: PricingTier;
  /** discount as a percentage off list (0-1) */
  discount: number;
  label: string;
}

export type AttributeKind = "select" | "number";

export interface AttributeOption {
  value: string;
  label: string;
  /** unit price modifier in cents (added to base) */
  priceModifier?: number;
  /** percentage modifier on running subtotal (e.g. 0.1 = +10%) */
  percentModifier?: number;
}

export interface AttributeDef {
  id: string;
  label: string;
  kind: AttributeKind;
  options?: AttributeOption[]; // for select
  min?: number; // for number
  max?: number;
  step?: number;
  defaultValue: string | number;
  /** unit label (e.g. "lb") */
  unit?: string;
}

export type ConstraintRule =
  | {
      kind: "disable";
      when: { attr: string; equals: string | string[] };
      target: { attr: string; values: string[] };
      reason: string;
    }
  | {
      kind: "min";
      when: { attr: string; equals: string | string[] };
      target: { attr: string; value: number };
      reason: string;
    };

export type PriceRule =
  | { kind: "base"; cents: number }
  | { kind: "perUnit"; attr: string; centsPerUnit: number } // multiply by quantity attr
  | { kind: "optionModifier"; attr: string } // applies the priceModifier of selected option per unit
  | { kind: "optionPercent"; attr: string } // applies percentModifier
  | { kind: "volumeBreak"; attr: string; tiers: { min: number; discount: number }[] };

export interface Product {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  origin: string;
  description: string;
  longDescription: string;
  image: string;
  notes: string[]; // tasting notes
  attributes: AttributeDef[];
  constraints: ConstraintRule[];
  pricing: PriceRule[];
  category: "single-origin" | "blend" | "decaf" | "cold-brew";
}

export interface Configuration {
  [attrId: string]: string | number;
}

export interface QuoteLine {
  id: string;
  productId: string;
  productName: string;
  config: Configuration;
  quantity: number;
  unitCents: number;
  lineCents: number;
  configSummary: string;
}

export type QuoteStatus = "draft" | "sent" | "approved" | "ordered" | "expired";

export interface Quote {
  id: string;
  number: string;
  ownerUid: string;
  ownerEmail: string;
  customerName?: string;
  companyName?: string;
  tier: PricingTier;
  lines: QuoteLine[];
  subtotalCents: number;
  tierDiscountCents: number;
  totalCents: number;
  status: QuoteStatus;
  notes?: string;
  shareToken: string;
  createdAt: number;
  updatedAt: number;
}

export type OrderStatus = "pending_invoice" | "paid" | "fulfilled" | "cancelled";
export type PaymentMethod = "card" | "net30";

export interface Order {
  id: string;
  number: string;
  quoteId?: string;
  ownerUid: string;
  ownerEmail: string;
  companyName?: string;
  tier: PricingTier;
  lines: QuoteLine[];
  subtotalCents: number;
  tierDiscountCents: number;
  totalCents: number;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  shippingAddress?: string;
  createdAt: number;
}

export interface AccountProfile {
  uid: string;
  email: string;
  displayName?: string;
  companyName?: string;
  tier: PricingTier;
  isAdmin: boolean;
  createdAt: number;
}
