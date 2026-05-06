import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import { getQuote, getQuoteByShareToken, updateQuoteStatus } from "@/lib/quotes";
import { Loading, ErrorState } from "@/components/Loading";
import { useAuth } from "@/store/auth";
import { useCart } from "@/store/cart";
import { formatUSD } from "@/lib/utils";
import { TIERS } from "@/lib/tiers";
import { toast } from "sonner";
import { Copy, Check } from "lucide-react";
import { useState } from "react";

export default function QuotePage() {
  const { id } = useParams();
  const [search] = [new URLSearchParams(window.location.search)];
  const shareToken = search.get("t");
  const { user, profile } = useAuth();
  const nav = useNavigate();
  const qc = useQueryClient();
  const [copied, setCopied] = useState(false);

  const { data: quote, isLoading, error, refetch } = useQuery({
    queryKey: ["quote", id, shareToken],
    queryFn: async () => {
      if (shareToken) return getQuoteByShareToken(shareToken);
      if (id) return getQuote(id);
      return null;
    },
  });

  if (isLoading) return <Loading label="Loading quote" />;
  if (error) return <ErrorState message={(error as Error).message} retry={refetch} />;
  if (!quote) return <ErrorState message="Quote not found." />;

  const isOwner = user?.uid === quote.ownerUid;
  const canEdit = isOwner || profile?.isAdmin;

  function copyShareLink() {
    const url = `${window.location.origin}/quote/share?t=${quote!.shareToken}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
    toast.success("Share link copied");
  }

  async function handleStatus(s: NonNullable<typeof quote>["status"]) {
    await updateQuoteStatus(quote!.id, s);
    qc.invalidateQueries({ queryKey: ["quote", id] });
    toast.success(`Marked ${s}`);
  }

  function reorderToCart() {
    const cart = useCart.getState();
    cart.clear();
    quote!.lines.forEach((l) => {
      cart.addLine(l.productId, l.config, profile?.tier ?? "retail");
    });
    nav("/cart");
  }

  return (
    <div className="container-edit py-12 md:py-20 max-w-4xl">
      <div className="flex items-baseline justify-between mb-2">
        <p className="eyebrow">Quote · {quote.number}</p>
        <span className="text-xs text-ink-mute">{new Date(quote.createdAt).toLocaleDateString()}</span>
      </div>
      <h1 className="display-md mb-2">{quote.companyName || quote.customerName || quote.ownerEmail}</h1>
      <p className="text-ink-mute mb-2">{TIERS[quote.tier].label} pricing · status: <span className="text-ink">{quote.status}</span></p>

      <div className="flex gap-2 my-6 flex-wrap">
        <button onClick={copyShareLink} className="btn-outline text-xs !py-2 !px-3">
          {copied ? <Check className="size-3" /> : <Copy className="size-3" />}
          Copy share link
        </button>
        {canEdit && (
          <>
            <button onClick={reorderToCart} className="btn-outline text-xs !py-2 !px-3">Re-order to cart</button>
            {quote.status === "draft" && (
              <button onClick={() => handleStatus("sent")} className="btn-outline text-xs !py-2 !px-3">Mark sent</button>
            )}
            {profile?.isAdmin && quote.status === "sent" && (
              <button onClick={() => handleStatus("approved")} className="btn-outline text-xs !py-2 !px-3">Approve</button>
            )}
          </>
        )}
        {isOwner && quote.status !== "ordered" && (
          <button onClick={reorderToCart} className="btn-primary text-xs !py-2 !px-3">Convert to order</button>
        )}
      </div>

      <div className="border border-line mt-8">
        {quote.lines.map((l) => (
          <div key={l.id} className="grid grid-cols-12 gap-4 p-6 border-b border-line last:border-b-0">
            <div className="col-span-7">
              <p className="font-serif text-xl">{l.productName}</p>
              <p className="text-sm text-ink-mute">{l.configSummary}</p>
            </div>
            <div className="col-span-2 text-sm text-ink-mute">{l.quantity} ×</div>
            <div className="col-span-3 text-right font-serif text-lg">{formatUSD(l.lineCents)}</div>
          </div>
        ))}
      </div>

      <div className="mt-8 ml-auto max-w-sm space-y-2 text-sm">
        <div className="flex justify-between"><span>Subtotal</span><span>{formatUSD(quote.subtotalCents)}</span></div>
        {quote.tierDiscountCents > 0 && (
          <div className="flex justify-between text-accent">
            <span>{TIERS[quote.tier].label}</span>
            <span>−{formatUSD(quote.tierDiscountCents)}</span>
          </div>
        )}
        <div className="rule pt-2" />
        <div className="flex justify-between font-serif text-2xl pt-2">
          <span>Total</span><span>{formatUSD(quote.totalCents)}</span>
        </div>
      </div>
    </div>
  );
}
