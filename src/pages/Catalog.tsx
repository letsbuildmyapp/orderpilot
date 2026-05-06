import { Link } from "react-router-dom";
import { useState } from "react";
import { PRODUCTS } from "@/seed/products";
import { useAuth } from "@/store/auth";
import { TIERS } from "@/lib/tiers";
import { computeUnitPrice } from "@/lib/pricing";
import { defaultConfig } from "@/lib/pricing";
import { formatUSD } from "@/lib/utils";

const CATEGORIES = [
  { value: "all", label: "All" },
  { value: "single-origin", label: "Single origin" },
  { value: "blend", label: "Blends" },
  { value: "decaf", label: "Decaf" },
  { value: "cold-brew", label: "Cold brew" },
] as const;

export default function Catalog() {
  const [filter, setFilter] = useState<(typeof CATEGORIES)[number]["value"]>("all");
  const { profile } = useAuth();
  const tier = profile?.tier ?? "retail";

  const filtered = filter === "all" ? PRODUCTS : PRODUCTS.filter((p) => p.category === filter);

  return (
    <div className="container-edit py-16 md:py-24">
      <div className="grid md:grid-cols-12 gap-8 mb-12">
        <div className="md:col-span-8">
          <p className="eyebrow mb-4">The catalog</p>
          <h1 className="display-lg">Lots in rotation, configured to order.</h1>
        </div>
        <div className="md:col-span-4 md:text-right md:self-end">
          <p className="text-sm text-ink-mute">
            Pricing shown for <span className="text-ink font-medium">{TIERS[tier].label}</span>.
            {tier === "retail" && (
              <> <Link to="/signin" className="text-accent underline">Sign in</Link> for wholesale pricing.</>
            )}
          </p>
        </div>
      </div>

      <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
        {CATEGORIES.map((c) => (
          <button
            key={c.value}
            onClick={() => setFilter(c.value)}
            className={`px-4 py-2 text-sm border transition-colors whitespace-nowrap ${
              filter === c.value ? "bg-ink text-cream-50 border-ink" : "border-line text-ink-soft hover:border-ink"
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-px bg-line border border-line">
        {filtered.map((p, i) => {
          const cfg = defaultConfig(p);
          const unit = computeUnitPrice(p, cfg);
          const tierPrice = Math.round(unit * (1 - TIERS[tier].discount));
          return (
            <Link key={p.id} to={`/p/${p.slug}`} className="group bg-cream-50 p-6 hover:bg-cream-100 transition-colors flex flex-col">
              <div className="aspect-[4/5] overflow-hidden bg-cream-200 mb-4">
                <img src={p.image} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" loading="lazy" />
              </div>
              <p className="eyebrow mb-1">No. {String(i + 1).padStart(2, "0")}</p>
              <p className="font-serif text-2xl mb-1">{p.name}</p>
              <p className="text-ink-soft text-sm mb-3">{p.tagline}</p>
              <div className="mt-auto flex items-baseline justify-between pt-3 border-t border-line">
                <span className="text-xs text-ink-mute">From</span>
                <span className="font-serif text-xl">{formatUSD(tierPrice)}</span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
