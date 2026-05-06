import { useEffect, useMemo, useState } from "react";
import type { Configuration, Product } from "@/types";
import { computeLineCents, defaultConfig, evaluateConstraints, healConfig } from "@/lib/pricing";
import { TIERS } from "@/lib/tiers";
import { useAuth } from "@/store/auth";
import { formatUSD } from "@/lib/utils";
import { Minus, Plus, AlertCircle } from "lucide-react";

interface Props {
  product: Product;
  initialConfig?: Configuration;
  onConfigChange?: (cfg: Configuration) => void;
  onAdd?: (cfg: Configuration) => void;
  ctaLabel?: string;
}

export function Configurator({ product, initialConfig, onConfigChange, onAdd, ctaLabel = "Add to quote" }: Props) {
  const { profile } = useAuth();
  const tier = profile?.tier ?? "retail";
  const [config, setConfig] = useState<Configuration>(() =>
    initialConfig ? healConfig(product, initialConfig) : defaultConfig(product)
  );

  useEffect(() => {
    onConfigChange?.(config);
  }, [config, onConfigChange]);

  const constraints = useMemo(() => evaluateConstraints(product, config), [product, config]);
  const { unitCents, lineCents, tierDiscountCents, quantity } = useMemo(
    () => computeLineCents(product, config, tier),
    [product, config, tier]
  );

  function update(attrId: string, value: string | number) {
    const next = healConfig(product, { ...config, [attrId]: value });
    setConfig(next);
  }

  return (
    <div className="space-y-8">
      {product.attributes.filter(a => a.id !== "quantity").map((attr) => {
        const dis = constraints.disabled[attr.id];
        if (attr.kind === "select") {
          return (
            <div key={attr.id}>
              <div className="flex items-baseline justify-between mb-3">
                <p className="eyebrow">{attr.label}</p>
                {dis && (
                  <span className="text-xs text-accent flex items-center gap-1">
                    <AlertCircle className="size-3" /> {dis.reasons[0]}
                  </span>
                )}
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {attr.options?.map((opt) => {
                  const isDisabled = dis?.values.has(opt.value) ?? false;
                  const isSelected = config[attr.id] === opt.value;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      disabled={isDisabled}
                      onClick={() => update(attr.id, opt.value)}
                      className={`p-3 text-sm border text-left transition-colors ${
                        isSelected
                          ? "border-ink bg-ink text-cream-50"
                          : isDisabled
                          ? "border-line text-ink-mute opacity-60 line-through cursor-not-allowed"
                          : "border-line hover:border-ink"
                      }`}
                    >
                      {opt.label}
                      {opt.priceModifier ? <div className="text-xs mt-1 num">+{formatUSD(opt.priceModifier)}/unit</div> : null}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        }
        return null;
      })}

      {/* Quantity stepper */}
      {(() => {
        const qAttr = product.attributes.find(a => a.id === "quantity");
        if (!qAttr) return null;
        const min = constraints.minimums.quantity?.value ?? qAttr.min ?? 1;
        const minReason = constraints.minimums.quantity?.reason;
        return (
          <div>
            <div className="flex items-baseline justify-between mb-3">
              <p className="eyebrow">{qAttr.label}</p>
              {minReason && <span className="text-xs text-ink-mute">Min {min} ·  {minReason}</span>}
            </div>
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => update("quantity", Math.max(min, quantity - 1))}
                className="size-10 border border-line hover:border-ink flex items-center justify-center"
                aria-label="Decrease"
              >
                <Minus className="size-4" />
              </button>
              <input
                type="number"
                value={quantity}
                min={min}
                max={qAttr.max}
                onChange={(e) => update("quantity", Math.max(min, Number(e.target.value) || min))}
                className="w-20 text-center text-2xl font-serif border-b border-line focus:border-accent bg-transparent py-2 num"
              />
              <button
                type="button"
                onClick={() => update("quantity", quantity + 1)}
                className="size-10 border border-line hover:border-ink flex items-center justify-center"
                aria-label="Increase"
              >
                <Plus className="size-4" />
              </button>
              <span className="text-sm text-ink-mute">{qAttr.unit}</span>
            </div>
          </div>
        );
      })()}

      <div className="rule" />

      <div className="space-y-2">
        <div className="flex items-baseline justify-between text-sm">
          <span className="text-ink-mute">Unit price ({TIERS[tier].label})</span>
          <span className="num">{formatUSD(unitCents)}</span>
        </div>
        {tierDiscountCents > 0 && (
          <div className="flex items-baseline justify-between text-sm text-accent">
            <span>Tier discount applied</span>
            <span className="num">−{formatUSD(tierDiscountCents)}</span>
          </div>
        )}
        <div className="flex items-baseline justify-between pt-2 border-t border-line">
          <span className="font-serif text-lg">Line total</span>
          <span className="font-serif text-3xl num">{formatUSD(lineCents)}</span>
        </div>
      </div>

      {onAdd && (
        <button onClick={() => onAdd(config)} className="btn-primary w-full">
          {ctaLabel} · {formatUSD(lineCents)}
        </button>
      )}
    </div>
  );
}
