import type {
  Configuration,
  ConstraintRule,
  PriceRule,
  PricingTier,
  Product,
} from "@/types";
import { TIERS } from "./tiers";

/**
 * Compute the unit price (cents) for a product given the configuration.
 * Returns the unit price BEFORE the tier discount. Quantity is left
 * to the caller (so tier discounts can be applied at the line level).
 */
export function computeUnitPrice(product: Product, config: Configuration): number {
  let unit = 0;
  for (const rule of product.pricing) {
    switch (rule.kind) {
      case "base":
        unit += rule.cents;
        break;
      case "perUnit": {
        // not used at unit-price level; perUnit applies at line-quantity calc
        break;
      }
      case "optionModifier": {
        const v = config[rule.attr];
        const attr = product.attributes.find((a) => a.id === rule.attr);
        const opt = attr?.options?.find((o) => o.value === v);
        if (opt?.priceModifier) unit += opt.priceModifier;
        break;
      }
      case "optionPercent": {
        const v = config[rule.attr];
        const attr = product.attributes.find((a) => a.id === rule.attr);
        const opt = attr?.options?.find((o) => o.value === v);
        if (opt?.percentModifier) unit = Math.round(unit * (1 + opt.percentModifier));
        break;
      }
      case "volumeBreak":
        // applied at line level
        break;
    }
  }
  return Math.max(0, unit);
}

/** Quantity is read from the configuration attr defined as quantity. */
export function getQuantity(product: Product, config: Configuration): number {
  // Convention: a numeric attr with id "quantity" or any number attr.
  const qtyAttr = product.attributes.find((a) => a.id === "quantity");
  if (qtyAttr) {
    const v = Number(config[qtyAttr.id] ?? qtyAttr.defaultValue);
    return Math.max(1, v);
  }
  return 1;
}

export function computeLineCents(
  product: Product,
  config: Configuration,
  tier: PricingTier
): { unitCents: number; lineCents: number; tierDiscountCents: number; quantity: number } {
  const quantity = getQuantity(product, config);
  let unitCents = computeUnitPrice(product, config);

  // volume breaks adjust unit price per total quantity
  for (const rule of product.pricing) {
    if (rule.kind === "volumeBreak" && rule.attr === "quantity") {
      const sorted = [...rule.tiers].sort((a, b) => b.min - a.min);
      const match = sorted.find((t) => quantity >= t.min);
      if (match) unitCents = Math.round(unitCents * (1 - match.discount));
    }
  }

  const grossLine = unitCents * quantity;
  const tierMeta = TIERS[tier];
  const tierDiscountCents = Math.round(grossLine * tierMeta.discount);
  const lineCents = grossLine - tierDiscountCents;

  return { unitCents, lineCents, tierDiscountCents, quantity };
}

export interface ConstraintResult {
  /** disabled options keyed by attr id */
  disabled: Record<string, { values: Set<string>; reasons: string[] }>;
  /** min values for numeric attrs */
  minimums: Record<string, { value: number; reason: string }>;
}

export function evaluateConstraints(
  product: Product,
  config: Configuration
): ConstraintResult {
  const disabled: ConstraintResult["disabled"] = {};
  const minimums: ConstraintResult["minimums"] = {};

  for (const rule of product.constraints) {
    const whenVal = config[rule.when.attr];
    const matchVals = Array.isArray(rule.when.equals) ? rule.when.equals : [rule.when.equals];
    if (!matchVals.includes(String(whenVal))) continue;

    if (rule.kind === "disable") {
      const cur = disabled[rule.target.attr] ?? { values: new Set<string>(), reasons: [] };
      rule.target.values.forEach((v) => cur.values.add(v));
      cur.reasons.push(rule.reason);
      disabled[rule.target.attr] = cur;
    } else if (rule.kind === "min") {
      const existing = minimums[rule.target.attr];
      if (!existing || rule.target.value > existing.value) {
        minimums[rule.target.attr] = { value: rule.target.value, reason: rule.reason };
      }
    }
  }

  return { disabled, minimums };
}

/** Heal a config by replacing disabled values with the first allowed option. */
export function healConfig(product: Product, config: Configuration): Configuration {
  const result: Configuration = { ...config };
  // iterate up to 3 times to converge
  for (let i = 0; i < 3; i++) {
    const { disabled, minimums } = evaluateConstraints(product, result);
    let changed = false;
    for (const attr of product.attributes) {
      if (attr.kind === "select") {
        const cur = String(result[attr.id]);
        const dis = disabled[attr.id]?.values;
        if (dis && dis.has(cur)) {
          const next = attr.options?.find((o) => !dis.has(o.value));
          if (next) {
            result[attr.id] = next.value;
            changed = true;
          }
        }
      }
      if (attr.kind === "number") {
        const min = minimums[attr.id]?.value;
        const cur = Number(result[attr.id] ?? attr.defaultValue);
        if (min !== undefined && cur < min) {
          result[attr.id] = min;
          changed = true;
        }
      }
    }
    if (!changed) break;
  }
  return result;
}

export function defaultConfig(product: Product): Configuration {
  const c: Configuration = {};
  for (const a of product.attributes) {
    c[a.id] = a.defaultValue;
  }
  return healConfig(product, c);
}

export function summarizeConfig(product: Product, config: Configuration): string {
  return product.attributes
    .filter((a) => a.id !== "quantity")
    .map((a) => {
      const v = config[a.id];
      if (a.kind === "select") {
        const opt = a.options?.find((o) => o.value === v);
        return `${a.label}: ${opt?.label ?? v}`;
      }
      return `${a.label}: ${v}${a.unit ?? ""}`;
    })
    .join(" • ");
}

// re-export PriceRule type-friendly check (avoid unused import warnings)
export type { PriceRule };
