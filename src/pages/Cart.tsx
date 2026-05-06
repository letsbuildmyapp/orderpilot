import { Link, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { useCart } from "@/store/cart";
import { useAuth } from "@/store/auth";
import { TIERS } from "@/lib/tiers";
import { formatUSD } from "@/lib/utils";
import { EmptyState } from "@/components/Loading";
import { Trash2 } from "lucide-react";
import { saveQuote } from "@/lib/quotes";
import { toast } from "sonner";

export default function Cart() {
  const { lines, removeLine, updateQuantity, hydrateForTier, clear } = useCart();
  const { user, profile } = useAuth();
  const tier = profile?.tier ?? "retail";
  const nav = useNavigate();

  // Re-price when tier changes (login/logout)
  useEffect(() => {
    hydrateForTier(tier);
  }, [tier, hydrateForTier]);

  const subtotal = lines.reduce((acc, l) => acc + l.unitCents * l.quantity, 0);
  const discount = Math.round(subtotal * TIERS[tier].discount);
  const total = subtotal - discount;

  if (lines.length === 0) {
    return (
      <div className="container-edit py-24">
        <EmptyState
          title="Your quote is empty."
          description="Pick a lot from the catalog and configure to start a quote."
          action={<Link to="/catalog" className="btn-primary">Browse catalog</Link>}
        />
      </div>
    );
  }

  async function handleSave() {
    if (!user || !profile) {
      nav(`/signin?next=/cart`);
      return;
    }
    try {
      const quote = await saveQuote({ user, profile, lines, status: "draft" });
      toast.success("Quote saved", {
        action: { label: "View quote", onClick: () => nav(`/quote/${quote.id}`) },
      });
      clear();
      nav(`/quote/${quote.id}`);
    } catch (e: any) {
      toast.error(e.message || "Could not save quote");
    }
  }

  function handleCheckout() {
    if (!user) {
      nav(`/signin?next=/checkout`);
      return;
    }
    nav("/checkout");
  }

  return (
    <div className="container-edit py-12 md:py-20">
      <p className="eyebrow mb-3">Quote builder</p>
      <h1 className="display-lg mb-12">Your draft quote.</h1>

      <div className="grid lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-px bg-line border border-line">
          {lines.map((l) => (
            <div key={l.id} className="bg-cream-50 p-6 grid grid-cols-12 gap-4 items-start">
              <div className="col-span-12 md:col-span-7">
                <p className="font-serif text-xl">{l.productName}</p>
                <p className="text-sm text-ink-mute">{l.configSummary}</p>
              </div>
              <div className="col-span-6 md:col-span-2 flex items-center gap-2">
                <input
                  type="number"
                  min={1}
                  value={l.quantity}
                  onChange={(e) => updateQuantity(l.id, Math.max(1, Number(e.target.value) || 1), tier)}
                  className="w-16 border border-line p-2 text-center bg-transparent"
                />
              </div>
              <div className="col-span-4 md:col-span-2 text-right font-serif text-lg">{formatUSD(l.lineCents)}</div>
              <div className="col-span-2 md:col-span-1 text-right">
                <button onClick={() => removeLine(l.id)} aria-label="Remove" className="text-ink-mute hover:text-accent">
                  <Trash2 className="size-4 inline" />
                </button>
              </div>
            </div>
          ))}
        </div>

        <aside className="lg:col-span-1">
          <div className="card sticky top-24 space-y-4">
            <p className="eyebrow">Summary</p>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span>Subtotal</span><span>{formatUSD(subtotal)}</span></div>
              {discount > 0 && (
                <div className="flex justify-between text-accent">
                  <span>{TIERS[tier].label}</span>
                  <span>−{formatUSD(discount)}</span>
                </div>
              )}
              <div className="rule pt-2" />
              <div className="flex justify-between font-serif text-2xl pt-2">
                <span>Total</span><span>{formatUSD(total)}</span>
              </div>
              <p className="text-xs text-ink-mute">Shipping calculated at checkout. Net-30 available for approved accounts.</p>
            </div>
            <div className="space-y-2">
              <button onClick={handleCheckout} className="btn-primary w-full">Checkout</button>
              <button onClick={handleSave} className="btn-outline w-full">Save quote</button>
              <button onClick={clear} className="btn-ghost w-full text-xs">Clear quote</button>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
