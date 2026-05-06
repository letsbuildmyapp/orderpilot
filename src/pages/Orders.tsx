import { useQuery } from "@tanstack/react-query";
import { Link, useParams } from "react-router-dom";
import { useAuth } from "@/store/auth";
import { listMyOrders, getOrder } from "@/lib/quotes";
import { Loading, EmptyState, ErrorState } from "@/components/Loading";
import { formatUSD } from "@/lib/utils";
import { TIERS } from "@/lib/tiers";

const STATUS_LABEL: Record<string, string> = {
  pending_invoice: "Invoice pending",
  paid: "Paid",
  fulfilled: "Fulfilled",
  cancelled: "Cancelled",
};

export function Orders() {
  const { user } = useAuth();
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["my-orders", user?.uid],
    queryFn: () => listMyOrders(user!.uid),
    enabled: !!user,
  });

  if (isLoading) return <Loading label="Loading orders" />;
  if (error) return <ErrorState message={(error as Error).message} retry={refetch} />;

  return (
    <div className="container-edit py-12 md:py-20">
      <p className="eyebrow mb-3">History</p>
      <h1 className="display-lg mb-12">Your orders.</h1>

      {!data || data.length === 0 ? (
        <EmptyState
          title="No orders yet."
          description="When you check out a quote, it'll show up here with shipment status."
          action={<Link to="/catalog" className="btn-primary">Browse catalog</Link>}
        />
      ) : (
        <div className="border border-line">
          <div className="grid grid-cols-12 gap-4 px-6 py-4 border-b border-line text-xs uppercase tracking-wider text-ink-mute">
            <div className="col-span-3">Order</div>
            <div className="col-span-3">Items</div>
            <div className="col-span-2">Status</div>
            <div className="col-span-2">Date</div>
            <div className="col-span-2 text-right">Total</div>
          </div>
          {data.map((o) => (
            <Link key={o.id} to={`/orders/${o.id}`} className="grid grid-cols-12 gap-4 px-6 py-5 border-b border-line last:border-b-0 hover:bg-cream-100">
              <div className="col-span-3 font-serif">{o.number}</div>
              <div className="col-span-3 text-sm text-ink-soft">{o.lines.length} lines · {o.lines.reduce((a, l) => a + l.quantity, 0)} units</div>
              <div className="col-span-2 text-sm">
                <span className="inline-block px-2 py-1 text-xs border border-line">{STATUS_LABEL[o.status]}</span>
              </div>
              <div className="col-span-2 text-sm text-ink-mute">{new Date(o.createdAt).toLocaleDateString()}</div>
              <div className="col-span-2 text-right font-serif text-lg">{formatUSD(o.totalCents)}</div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export function OrderDetail() {
  const { id } = useParams();
  const { data: order, isLoading, error, refetch } = useQuery({
    queryKey: ["order", id],
    queryFn: () => getOrder(id!),
    enabled: !!id,
  });

  if (isLoading) return <Loading />;
  if (error) return <ErrorState message={(error as Error).message} retry={refetch} />;
  if (!order) return <ErrorState message="Order not found." />;

  return (
    <div className="container-edit py-12 md:py-20 max-w-4xl">
      <p className="eyebrow mb-3">Order · {order.number}</p>
      <h1 className="display-md mb-2">
        {order.status === "paid" ? "Thank you." : order.status === "pending_invoice" ? "Invoice queued." : STATUS_LABEL[order.status]}
      </h1>
      <p className="text-ink-mute mb-6">
        {order.paymentMethod === "card" ? "Paid by card" : "Net 30 invoice"} · {TIERS[order.tier].label}
      </p>
      {order.shippingAddress && (
        <div className="card mb-6">
          <p className="eyebrow mb-2">Shipping to</p>
          <p className="whitespace-pre-line text-ink-soft">{order.shippingAddress}</p>
        </div>
      )}

      <div className="border border-line mt-4">
        {order.lines.map((l) => (
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
        <div className="flex justify-between"><span>Subtotal</span><span>{formatUSD(order.subtotalCents)}</span></div>
        {order.tierDiscountCents > 0 && (
          <div className="flex justify-between text-accent">
            <span>{TIERS[order.tier].label}</span><span>−{formatUSD(order.tierDiscountCents)}</span>
          </div>
        )}
        <div className="rule pt-2" />
        <div className="flex justify-between font-serif text-2xl pt-2">
          <span>Total</span><span>{formatUSD(order.totalCents)}</span>
        </div>
      </div>
    </div>
  );
}
