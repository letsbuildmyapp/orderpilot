import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { PRODUCTS } from "@/seed/products";
import { ArrowUpRight } from "lucide-react";

export default function Home() {
  return (
    <div>
      {/* Hero — split editorial */}
      <section className="container-edit pt-12 md:pt-24 pb-16">
        <div className="grid md:grid-cols-12 gap-8 md:gap-16 items-end">
          <div className="md:col-span-7">
            <p className="eyebrow mb-6">Issue 03 · Spring '26 · Wholesale</p>
            <motion.h1
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="display-xl"
            >
              Coffee, <em className="italic">configured</em>.<br />
              Quotes that <em className="italic">close</em>.
            </motion.h1>
          </div>
          <div className="md:col-span-5 md:pb-4">
            <p className="text-ink-soft text-lg leading-relaxed">
              OrderPilot is a B2B ordering platform for specialty roasters. Cafes, restaurants, and offices configure products, get instant tier-based pricing, save quotes, and check out on card or net-30.
            </p>
            <div className="mt-8 flex gap-3">
              <Link to="/catalog" className="btn-primary">Browse catalog <ArrowUpRight className="size-4" /></Link>
              <Link to="/signin" className="btn-ghost">Sign in</Link>
            </div>
          </div>
        </div>
      </section>

      {/* Big image break */}
      <section className="relative">
        <div className="aspect-[16/7] w-full overflow-hidden bg-cream-200">
          <img
            src="https://images.unsplash.com/photo-1442550528053-c431ecb55509?w=2200&q=80"
            alt="Roastery"
            className="w-full h-full object-cover"
            loading="lazy"
          />
        </div>
        <div className="container-edit -mt-12 md:-mt-20 relative z-10">
          <div className="bg-cream-50 border border-line p-6 md:p-10 max-w-2xl">
            <p className="eyebrow mb-3">Vol. I · Provenance</p>
            <p className="display-md">
              Every lot, traceable to the washing station. Every shipment, configured to your service style.
            </p>
          </div>
        </div>
      </section>

      {/* Featured products */}
      <section className="container-edit mt-24">
        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="eyebrow mb-2">The catalog</p>
            <h2 className="display-lg">Five lots in rotation.</h2>
          </div>
          <Link to="/catalog" className="hidden md:inline-flex text-sm hover:text-accent">View all →</Link>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-px bg-line border border-line">
          {PRODUCTS.slice(0, 6).map((p, i) => (
            <Link
              key={p.id}
              to={`/p/${p.slug}`}
              className="group bg-cream-50 p-6 hover:bg-cream-100 transition-colors flex flex-col"
            >
              <div className="aspect-[4/5] overflow-hidden bg-cream-200 mb-4">
                <img src={p.image} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" loading="lazy" />
              </div>
              <p className="eyebrow mb-1">No. {String(i + 1).padStart(2, "0")} · {p.origin}</p>
              <p className="font-serif text-2xl mb-1">{p.name}</p>
              <p className="text-ink-soft text-sm">{p.tagline}</p>
              <div className="flex flex-wrap gap-1 mt-3">
                {p.notes.slice(0, 3).map((n) => (
                  <span key={n} className="text-caption uppercase tracking-[0.08em] text-ink-mute border border-line px-2 py-1">{n}</span>
                ))}
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="container-edit mt-32">
        <div className="grid md:grid-cols-12 gap-8">
          <div className="md:col-span-4">
            <p className="eyebrow mb-3">The flow</p>
            <h2 className="display-lg">From spec to ship in four steps.</h2>
          </div>
          <ol className="md:col-span-8 space-y-px bg-line border border-line">
            {[
              ["01", "Configure", "Pick roast, grind, bag size, frequency. Constraints stop you ordering what we can't ship."],
              ["02", "Price live", "Your tier price (cafe, restaurant, wholesale) calculates as you change attributes."],
              ["03", "Save or send", "Save the quote, share a link with your team, or convert it to an order."],
              ["04", "Pay your way", "Stripe checkout for first orders. Net-30 invoicing once approved."],
            ].map(([n, t, d]) => (
              <li key={n} className="bg-cream-50 p-6 grid grid-cols-12 gap-4">
                <span className="col-span-2 font-serif text-3xl text-accent">{n}</span>
                <div className="col-span-10">
                  <p className="font-serif text-xl mb-1">{t}</p>
                  <p className="text-ink-soft text-sm">{d}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>
    </div>
  );
}
