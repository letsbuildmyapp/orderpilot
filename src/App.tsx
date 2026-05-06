import { useEffect } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import { Layout } from "@/components/Layout";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Tutorial } from "@/components/Tutorial";
import { useAuth } from "@/store/auth";
import { ensureSeed } from "@/seed/runSeed";

import Home from "@/pages/Home";
import Catalog from "@/pages/Catalog";
import ProductPage from "@/pages/Product";
import Cart from "@/pages/Cart";
import SignIn from "@/pages/SignIn";
import Quotes from "@/pages/Quotes";
import QuotePage from "@/pages/Quote";
import Checkout from "@/pages/Checkout";
import { Orders, OrderDetail } from "@/pages/Orders";
import Account from "@/pages/Account";
import AdminDashboard from "@/pages/admin/AdminDashboard";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, refetchOnWindowFocus: false } },
});

function AuthBoot({ children }: { children: React.ReactNode }) {
  const init = useAuth((s) => s.init);
  const user = useAuth((s) => s.user);
  useEffect(() => {
    const unsub = init();
    return () => unsub();
  }, [init]);
  return (
    <>
      {children}
      {user ? <Tutorial /> : null}
    </>
  );
}

export default function App() {
  useEffect(() => {
    // fire-and-forget seed; idempotent
    ensureSeed().catch((e) => console.warn("seed failed", e));
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthBoot>
          <Toaster position="top-center" toastOptions={{ className: "!font-sans !rounded-none !border !border-line" }} />
          <Routes>
            <Route element={<Layout />}>
              <Route index element={<Home />} />
              <Route path="catalog" element={<Catalog />} />
              <Route path="p/:slug" element={<ProductPage />} />
              <Route path="cart" element={<Cart />} />
              <Route path="signin" element={<SignIn />} />
              <Route path="quote/share" element={<QuotePage />} />
              <Route path="quote/:id" element={<QuotePage />} />

              <Route path="quotes" element={<ProtectedRoute><Quotes /></ProtectedRoute>} />
              <Route path="checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
              <Route path="orders" element={<ProtectedRoute><Orders /></ProtectedRoute>} />
              <Route path="orders/:id" element={<ProtectedRoute><OrderDetail /></ProtectedRoute>} />
              <Route path="account" element={<ProtectedRoute><Account /></ProtectedRoute>} />
              <Route path="admin" element={<ProtectedRoute adminOnly><AdminDashboard /></ProtectedRoute>} />
              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
        </AuthBoot>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
