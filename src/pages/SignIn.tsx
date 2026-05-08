import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "@/store/auth";
import { toast } from "sonner";
import { ArrowRight, Loader2, Coffee, UtensilsCrossed, Boxes, ShieldCheck } from "lucide-react";

const DEMO_PASSWORD = "demo1234";

const DEMO_LOGINS = [
  {
    email: "cafe@orderpilot.test",
    password: DEMO_PASSWORD,
    label: "Cafe",
    description: "12% wholesale tier",
    icon: Coffee,
    color: "from-amber-500 to-orange-500",
  },
  {
    email: "restaurant@orderpilot.test",
    password: DEMO_PASSWORD,
    label: "Restaurant",
    description: "18% wholesale tier",
    icon: UtensilsCrossed,
    color: "from-rose-500 to-pink-500",
  },
  {
    email: "wholesale@orderpilot.test",
    password: DEMO_PASSWORD,
    label: "Wholesale",
    description: "28% wholesale tier",
    icon: Boxes,
    color: "from-emerald-500 to-teal-500",
  },
  {
    email: "admin@orderpilot.test",
    password: DEMO_PASSWORD,
    label: "Admin",
    description: "Quote & order management",
    icon: ShieldCheck,
    color: "from-indigo-500 to-violet-500",
  },
];

export default function SignIn() {
  const { signIn, signUp } = useAuth();
  const nav = useNavigate();
  const [params] = useSearchParams();
  const next = params.get("next") || "/";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await signIn(email, password);
      toast.success("Welcome back");
      nav(next);
    } catch (err: any) {
      toast.error(err.code || err.message || "Auth failed");
    } finally {
      setLoading(false);
    }
  }

  async function onDemoLogin(d: (typeof DEMO_LOGINS)[number]) {
    setEmail(d.email);
    setPassword(d.password);
    setDemoLoading(d.email);
    try {
      try {
        await signIn(d.email, d.password);
      } catch {
        await signUp(d.email, d.password, "Demo");
      }
      toast.success(`Signed in as ${d.label}`);
      nav(next);
    } catch (err: any) {
      toast.error(err.code || err.message || "Sign-in failed");
    } finally {
      setDemoLoading(null);
    }
  }

  return (
    <div className="relative flex min-h-screen flex-col">
      <header className="relative z-10 flex items-center justify-between px-6 py-5 sm:px-10">
        <Link to="/" className="flex items-center gap-2 font-semibold">
          <div className="h-7 w-7 rounded-md bg-accent grid place-items-center text-cream-50 font-serif italic text-sm">O</div>
          <span className="tracking-tight">OrderPilot</span>
        </Link>
        <span className="text-xs text-ink-mute">
          Need help?{" "}
          <a href="mailto:hello@letsbuildmyapp.com?subject=OrderPilot%20support" className="text-ink underline-offset-4 hover:underline">
            Contact support
          </a>
        </span>
      </header>

      <main className="relative z-10 flex flex-1 items-center justify-center px-6 py-10">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="w-full max-w-[440px]"
        >
          <div className="border border-line bg-cream-50 p-8 shadow-2xl">
            <div className="space-y-1.5">
              <h1 className="display-md">Sign in to OrderPilot</h1>
              <p className="text-sm text-ink-mute">
                New here?{" "}
                <Link to="/signup" className="font-medium text-accent underline-offset-4 hover:underline">
                  Create an account
                </Link>
              </p>
            </div>

            <div className="my-6 grid gap-2">
              <div className="mb-1 flex items-center justify-between">
                <span className="eyebrow">// one-click demo logins</span>
                <span className="text-[10px] text-ink-mute">No password needed</span>
              </div>
              {DEMO_LOGINS.map((d) => (
                <button
                  key={d.email}
                  type="button"
                  onClick={() => onDemoLogin(d)}
                  disabled={demoLoading !== null || loading}
                  className="group flex items-center gap-3 border border-line bg-cream-50 hover:bg-cream-100 p-3 text-left transition-colors disabled:opacity-50 disabled:pointer-events-none"
                >
                  <div className={`flex h-9 w-9 items-center justify-center rounded-sm bg-gradient-to-br ${d.color} text-white shadow-sm`}>
                    <d.icon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-semibold text-ink">{d.label}</div>
                    <div className="truncate text-xs text-ink-mute">{d.description}</div>
                  </div>
                  {demoLoading === d.email ? (
                    <Loader2 className="size-4 animate-spin text-ink-mute" />
                  ) : (
                    <ArrowRight className="size-4 text-ink-mute transition-transform group-hover:translate-x-0.5" />
                  )}
                </button>
              ))}
            </div>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="rule w-full" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-cream-50 px-3 text-ink-mute uppercase tracking-wider">or sign in with email</span>
              </div>
            </div>

            <form onSubmit={onSubmit} className="space-y-4">
              <div>
                <label className="eyebrow block mb-2">Email</label>
                <input type="email" required autoComplete="email" className="input" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@company.com" />
              </div>
              <div>
                <label className="eyebrow block mb-2">Password</label>
                <input type="password" required minLength={6} autoComplete="current-password" className="input" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
              </div>
              <button disabled={loading} type="submit" className="btn-primary w-full">
                {loading ? <Loader2 className="size-4 animate-spin" /> : "Sign in"}
              </button>
            </form>
          </div>
        </motion.div>
      </main>

      <footer className="relative z-10 px-6 pb-8 text-center text-xs text-ink-mute sm:px-10">
        <a href="https://letsbuildmyapp.com" target="_blank" rel="noreferrer" className="font-medium text-ink underline-offset-4 hover:underline">
          Let&apos;s Build My App
        </a>
      </footer>
    </div>
  );
}
