import { Link, NavLink } from "react-router-dom";
import { useAuth } from "@/store/auth";
import { useCart } from "@/store/cart";
import { ShoppingBag, User as UserIcon } from "lucide-react";

export function Header() {
  const { user, profile, signOut } = useAuth();
  const lines = useCart((s) => s.lines);
  const cartCount = lines.reduce((acc, l) => acc + l.quantity, 0);

  return (
    <header className="border-b border-line bg-cream-50 sticky top-0 z-30">
      <div className="container-edit flex items-center justify-between h-16">
        <Link to="/" data-tour="brand" className="font-serif text-xl">
          OrderPilot<span className="text-accent">.</span>
        </Link>
        <nav className="hidden md:flex items-center gap-8 text-sm">
          <NavLink to="/catalog" data-tour="nav-catalog" className={({ isActive }) => isActive ? "text-accent" : "hover:text-accent"}>Catalog</NavLink>
          <NavLink to="/quotes" data-tour="nav-quotes" className={({ isActive }) => isActive ? "text-accent" : "hover:text-accent"}>Quotes</NavLink>
          <NavLink to="/orders" data-tour="nav-orders" className={({ isActive }) => isActive ? "text-accent" : "hover:text-accent"}>Orders</NavLink>
          {profile?.isAdmin && (
            <NavLink to="/admin" data-tour="nav-admin" className={({ isActive }) => isActive ? "text-accent" : "hover:text-accent"}>Admin</NavLink>
          )}
        </nav>
        <div className="flex items-center gap-4">
          <Link to="/cart" className="relative p-2 hover:text-accent inline-flex items-center justify-center min-w-[44px] min-h-[44px]" aria-label="Cart">
            <ShoppingBag className="size-5" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-accent text-cream-50 text-xs rounded-full size-5 flex items-center justify-center font-semibold leading-none num">
                {cartCount}
              </span>
            )}
          </Link>
          {user ? (
            <div className="flex items-center gap-3 text-sm">
              <Link to="/account" className="hidden sm:flex items-center gap-2 hover:text-accent">
                <UserIcon className="size-4" />
                {profile?.companyName || profile?.email?.split("@")[0]}
              </Link>
              <button onClick={() => signOut()} className="text-ink-mute hover:text-accent text-sm min-h-[44px] px-2">Sign out</button>
            </div>
          ) : (
            <Link to="/signin" className="btn-outline !px-4 text-sm">Sign in</Link>
          )}
        </div>
      </div>
    </header>
  );
}
