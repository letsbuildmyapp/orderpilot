import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "@/store/cart";
import { useAuth } from "@/store/auth";
import { TIERS } from "@/lib/tiers";
import { formatUSD } from "@/lib/utils";
import { createOrder } from "@/lib/quotes";
import type { PaymentMethod } from "@/types";
import { toast } from "sonner";
import { CreditCard, FileText, Lock } from "lucide-react";

export default function Checkout() {
  const { lines, clear } = useCart();
  const { user, profile } = useAuth();
  const nav = useNavigate();
  const [method, setMethod] = useState<PaymentMethod>("card");
  const [address, setAddress] = useState("");
  const [busy, setBusy] = useState(false);

  if (!user || !profile) {
    nav("/signin?next=/checkout");
    return null;
  }
  if (lines.length === 0) {
    nav("/cart");
    return null;
  }

  const subtotal = lines.reduce((acc, l) => acc + l.unitCents * l.quantity, 0);
  const discount = Math.round(subtotal * TIERS[profile.tier].discount);
  const total = subtotal - discount;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      // In production this calls a Cloud Function to create a Stripe Checkout
      // session and redirects to Stripe. Here we simulate the flow end-to-end
      // and create the order on completion.
      if (method === "card") {
        toast.info("Redirecting to Stripe (test mode)…");
        await new Promise((r) => setTimeout(r, 900));
      }
      const order = await createOrder({
        user: user!,
        profile: profile!,
        lines,
        paymentMethod: method,
        shippingAddress: address,
      });
      clear();
      toast.success(method === "card" ? "Payment successful" : "Invoice request submitted");
      nav(`/orders/${order.id}`);
    } catch (err: any) {
      toast.error(err.message || "Checkout failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="container-edit py-12 md:py-20 max-w-4xl">
      <p className="eyebrow mb-3">Checkout</p>
      <h1 className="display-md mb-12">Confirm and pay.</h1>

      <form onSubmit={handleSubmit} className="grid lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-10">
          <section>
            <p className="eyebrow mb-4">Ship to</p>
            <textarea
              required
              rows={3}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Company name, street, city, state, zip"
              className="w-full bg-transparent border border-line p-3 text-sm focus:border-ink"
            />
          </section>

          <section>
            <p className="eyebrow mb-4">Payment method</p>
            <div className="space-y-3">
              <label className={`flex items-start gap-3 border p-4 cursor-pointer ${method === "card" ? "border-ink" : "border-line"}`}>
                <input type="radio" checked={method === "card"} onChange={() => setMethod("card")} className="mt-1" />
                <div className="flex-1">
                  <p className="flex items-center gap-2 font-medium"><CreditCard className="size-4" /> Card (Stripe Checkout · test mode)</p>
                  <p className="text-xs text-ink-mute mt-1">You'll be redirected to Stripe. Use test card 4242 4242 4242 4242.</p>
                </div>
              </label>
              <label className={`flex items-start gap-3 border p-4 cursor-pointer ${method === "net30" ? "border-ink" : "border-line"}`}>
                <input type="radio" checked={method === "net30"} onChange={() => setMethod("net30")} className="mt-1" />
                <div className="flex-1">
                  <p className="flex items-center gap-2 font-medium"><FileText className="size-4" /> Request invoice (Net 30)</p>
                  <p className="text-xs text-ink-mute mt-1">Available to approved B2B accounts. Order ships, invoice is due in 30 days.</p>
                </div>
              </label>
            </div>
          </section>
        </div>

        <aside className="lg:col-span-1">
          <div className="card sticky top-24 space-y-4">
            <p className="eyebrow">Summary</p>
            <div className="space-y-1 text-sm max-h-48 overflow-auto">
              {lines.map((l) => (
                <div key={l.id} className="flex justify-between gap-4">
                  <span className="truncate">{l.productName} × {l.quantity}</span>
                  <span>{formatUSD(l.lineCents)}</span>
                </div>
              ))}
            </div>
            <div className="rule" />
            <div className="space-y-1 text-sm">
              <div className="flex justify-between"><span>Subtotal</span><span>{formatUSD(subtotal)}</span></div>
              {discount > 0 && (
                <div className="flex justify-between text-accent">
                  <span>{TIERS[profile.tier].label}</span>
                  <span>−{formatUSD(discount)}</span>
                </div>
              )}
            </div>
            <div className="flex justify-between font-serif text-2xl pt-2 border-t border-line">
              <span>Total</span><span>{formatUSD(total)}</span>
            </div>
            <button type="submit" disabled={busy} className="btn-primary w-full">
              <Lock className="size-4" />
              {busy ? "Processing…" : method === "card" ? `Pay ${formatUSD(total)}` : "Submit invoice request"}
            </button>
            <p className="text-caption text-ink-mute text-center">
              This is a portfolio demo. No real charges are made.
            </p>
          </div>
        </aside>
      </form>
    </div>
  );
}
