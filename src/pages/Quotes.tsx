import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { useAuth } from "@/store/auth";
import { listMyQuotes } from "@/lib/quotes";
import { Loading, EmptyState, ErrorState } from "@/components/Loading";
import { formatUSD } from "@/lib/utils";

const STATUS_LABEL: Record<string, string> = {
  draft: "Draft",
  sent: "Sent",
  approved: "Approved",
  ordered: "Ordered",
  expired: "Expired",
};

export default function Quotes() {
  const { user } = useAuth();
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["my-quotes", user?.uid],
    queryFn: () => listMyQuotes(user!.uid),
    enabled: !!user,
  });

  if (isLoading) return <Loading label="Loading quotes" />;
  if (error) return <ErrorState message={(error as Error).message} retry={refetch} />;

  return (
    <div className="container-edit py-12 md:py-20">
      <div className="flex items-end justify-between mb-12">
        <div>
          <p className="eyebrow mb-3">Saved</p>
          <h1 className="display-lg">Your quotes.</h1>
        </div>
        <Link to="/catalog" className="btn-outline">New quote</Link>
      </div>

      {!data || data.length === 0 ? (
        <EmptyState
          title="No quotes yet."
          description="Configure a product and save your first quote — share it with your team or convert to an order anytime."
          action={<Link to="/catalog" className="btn-primary">Browse catalog</Link>}
        />
      ) : (
        <div className="border border-line">
          <div className="grid grid-cols-12 gap-4 px-6 py-4 border-b border-line text-xs uppercase tracking-wider text-ink-mute">
            <div className="col-span-3">Number</div>
            <div className="col-span-3">Items</div>
            <div className="col-span-2">Status</div>
            <div className="col-span-2">Created</div>
            <div className="col-span-2 text-right">Total</div>
          </div>
          {data.map((q) => (
            <Link
              key={q.id}
              to={`/quote/${q.id}`}
              className="grid grid-cols-12 gap-4 px-6 py-5 border-b border-line last:border-b-0 hover:bg-cream-100"
            >
              <div className="col-span-3 font-serif">{q.number}</div>
              <div className="col-span-3 text-sm text-ink-soft">
                {q.lines.length} line{q.lines.length === 1 ? "" : "s"} · {q.lines.reduce((a, l) => a + l.quantity, 0)} units
              </div>
              <div className="col-span-2 text-sm">
                <span className="inline-block px-2 py-1 text-xs border border-line">{STATUS_LABEL[q.status]}</span>
              </div>
              <div className="col-span-2 text-sm text-ink-mute">{new Date(q.createdAt).toLocaleDateString()}</div>
              <div className="col-span-2 text-right font-serif text-lg">{formatUSD(q.totalCents)}</div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
