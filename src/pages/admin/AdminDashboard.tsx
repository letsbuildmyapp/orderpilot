import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { listAllOrders, listAllQuotes, updateOrderStatus, updateQuoteStatus } from "@/lib/quotes";
import { Loading, EmptyState, ErrorState } from "@/components/Loading";
import { formatUSD } from "@/lib/utils";
import { TIERS } from "@/lib/tiers";
import { useState } from "react";
import { toast } from "sonner";
import type { OrderStatus, QuoteStatus } from "@/types";

export default function AdminDashboard() {
  const [tab, setTab] = useState<"quotes" | "orders">("quotes");
  const qc = useQueryClient();

  const quotesQ = useQuery({ queryKey: ["admin-quotes"], queryFn: listAllQuotes });
  const ordersQ = useQuery({ queryKey: ["admin-orders"], queryFn: listAllOrders });

  async function setQuoteStatus(id: string, s: QuoteStatus) {
    await updateQuoteStatus(id, s);
    qc.invalidateQueries({ queryKey: ["admin-quotes"] });
    toast.success(`Quote → ${s}`);
  }
  async function setOrderStatus(id: string, s: OrderStatus) {
    await updateOrderStatus(id, s);
    qc.invalidateQueries({ queryKey: ["admin-orders"] });
    toast.success(`Order → ${s}`);
  }

  return (
    <div className="container-edit py-12 md:py-20">
      <p className="eyebrow mb-3">Operations</p>
      <h1 className="display-lg mb-12">Admin.</h1>

      <div data-tour="admin-tabs" className="flex gap-1 mb-8 border-b border-line">
        {(["quotes", "orders"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-3 text-sm border-b-2 -mb-px ${tab === t ? "border-ink" : "border-transparent text-ink-mute"}`}
          >
            {t === "quotes" ? "Quotes" : "Orders"}
          </button>
        ))}
      </div>

      {tab === "quotes" ? (
        quotesQ.isLoading ? <Loading /> :
        quotesQ.error ? <ErrorState message={(quotesQ.error as Error).message} /> :
        !quotesQ.data?.length ? <EmptyState title="No quotes" description="When customers save quotes, you can manage them here." /> :
        <div className="border border-line">
          <div className="grid grid-cols-12 gap-4 px-4 py-3 border-b border-line text-xs uppercase tracking-wider text-ink-mute">
            <div className="col-span-2">Quote</div>
            <div className="col-span-3">Customer</div>
            <div className="col-span-2">Tier</div>
            <div className="col-span-1">Status</div>
            <div className="col-span-2 text-right">Total</div>
            <div className="col-span-2 text-right">Actions</div>
          </div>
          {quotesQ.data.map((q) => (
            <div key={q.id} className="grid grid-cols-12 gap-4 px-4 py-4 border-b border-line last:border-b-0 items-center">
              <Link to={`/quote/${q.id}`} className="col-span-2 font-serif hover:text-accent">{q.number}</Link>
              <div className="col-span-3 text-sm">
                <div>{q.companyName || q.customerName || q.ownerEmail}</div>
                <div className="text-xs text-ink-mute">{q.ownerEmail}</div>
              </div>
              <div className="col-span-2 text-xs">{TIERS[q.tier].label}</div>
              <div className="col-span-1 text-xs">{q.status}</div>
              <div className="col-span-2 text-right font-serif">{formatUSD(q.totalCents)}</div>
              <div className="col-span-2 text-right space-x-1">
                {q.status !== "approved" && q.status !== "ordered" && (
                  <button onClick={() => setQuoteStatus(q.id, "approved")} className="text-xs underline hover:text-accent">Approve</button>
                )}
                {q.status === "draft" && (
                  <button onClick={() => setQuoteStatus(q.id, "sent")} className="text-xs underline hover:text-accent">Send</button>
                )}
                {q.status !== "expired" && (
                  <button onClick={() => setQuoteStatus(q.id, "expired")} className="text-xs underline hover:text-accent">Expire</button>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        ordersQ.isLoading ? <Loading /> :
        ordersQ.error ? <ErrorState message={(ordersQ.error as Error).message} /> :
        !ordersQ.data?.length ? <EmptyState title="No orders" description="Orders from card or net-30 checkout show up here." /> :
        <div className="border border-line">
          <div className="grid grid-cols-12 gap-4 px-4 py-3 border-b border-line text-xs uppercase tracking-wider text-ink-mute">
            <div className="col-span-2">Order</div>
            <div className="col-span-3">Customer</div>
            <div className="col-span-2">Method</div>
            <div className="col-span-1">Status</div>
            <div className="col-span-2 text-right">Total</div>
            <div className="col-span-2 text-right">Actions</div>
          </div>
          {ordersQ.data.map((o) => (
            <div key={o.id} className="grid grid-cols-12 gap-4 px-4 py-4 border-b border-line last:border-b-0 items-center">
              <Link to={`/orders/${o.id}`} className="col-span-2 font-serif hover:text-accent">{o.number}</Link>
              <div className="col-span-3 text-sm">
                <div>{o.companyName || o.ownerEmail}</div>
                <div className="text-xs text-ink-mute">{o.ownerEmail}</div>
              </div>
              <div className="col-span-2 text-xs">{o.paymentMethod}</div>
              <div className="col-span-1 text-xs">{o.status}</div>
              <div className="col-span-2 text-right font-serif">{formatUSD(o.totalCents)}</div>
              <div className="col-span-2 text-right space-x-1">
                {o.status === "pending_invoice" && (
                  <button onClick={() => setOrderStatus(o.id, "paid")} className="text-xs underline hover:text-accent">Mark paid</button>
                )}
                {o.status === "paid" && (
                  <button onClick={() => setOrderStatus(o.id, "fulfilled")} className="text-xs underline hover:text-accent">Fulfill</button>
                )}
                {o.status !== "cancelled" && o.status !== "fulfilled" && (
                  <button onClick={() => setOrderStatus(o.id, "cancelled")} className="text-xs underline hover:text-accent">Cancel</button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
