import { Link, useNavigate, useParams } from "react-router-dom";
import { findProduct } from "@/seed/products";
import { Configurator } from "@/components/Configurator";
import { useCart } from "@/store/cart";
import { useAuth } from "@/store/auth";
import { toast } from "sonner";
import { EmptyState } from "@/components/Loading";

export default function ProductPage() {
  const { slug } = useParams();
  const product = slug ? findProduct(slug) : undefined;
  const addLine = useCart((s) => s.addLine);
  const { profile } = useAuth();
  const tier = profile?.tier ?? "retail";
  const nav = useNavigate();

  if (!product) {
    return (
      <div className="container-edit py-24">
        <EmptyState
          title="Lot not found."
          description="That product slug isn't in our catalog right now."
          action={<Link to="/catalog" className="btn-primary">Back to catalog</Link>}
        />
      </div>
    );
  }

  return (
    <div className="container-edit py-12 md:py-20">
      <Link to="/catalog" className="text-sm text-ink-mute hover:text-accent">← Catalog</Link>

      <div className="grid md:grid-cols-12 gap-12 mt-8">
        {/* Image side */}
        <div className="md:col-span-7">
          <div className="aspect-[4/5] bg-cream-200 overflow-hidden">
            <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
          </div>
          <div className="mt-8 grid grid-cols-2 gap-8">
            <div>
              <p className="eyebrow mb-2">Origin</p>
              <p className="font-serif text-lg">{product.origin}</p>
            </div>
            <div>
              <p className="eyebrow mb-2">Notes</p>
              <p className="font-serif text-lg">{product.notes.join(" · ")}</p>
            </div>
          </div>
          <div className="mt-8 prose prose-stone">
            <p className="text-ink-soft text-lg leading-relaxed">{product.longDescription}</p>
          </div>
        </div>

        {/* Configurator side */}
        <div className="md:col-span-5 md:sticky md:top-24 md:self-start">
          <p className="eyebrow mb-3">{product.category.replace("-", " ")}</p>
          <h1 className="display-md mb-2">{product.name}</h1>
          <p className="text-ink-soft mb-8">{product.description}</p>

          <Configurator
            product={product}
            onAdd={(cfg) => {
              addLine(product.id, cfg, tier);
              toast.success(`${product.name} added to quote`, {
                action: { label: "View cart", onClick: () => nav("/cart") },
              });
            }}
          />
        </div>
      </div>
    </div>
  );
}
