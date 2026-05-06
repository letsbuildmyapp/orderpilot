import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/store/auth";
import { toast } from "sonner";

export default function SignIn() {
  const [tab, setTab] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("cafe@orderpilot.test");
  const [password, setPassword] = useState("demo1234");
  const [companyName, setCompanyName] = useState("");
  const [busy, setBusy] = useState(false);
  const { signIn, signUp, signInGoogle } = useAuth();
  const nav = useNavigate();
  const [params] = useSearchParams();
  const next = params.get("next") || "/";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      if (tab === "signin") await signIn(email, password);
      else await signUp(email, password, companyName);
      toast.success(tab === "signin" ? "Welcome back" : "Account created");
      nav(next);
    } catch (err: any) {
      toast.error(err.code || err.message || "Auth failed");
    } finally {
      setBusy(false);
    }
  }

  async function handleGoogle() {
    setBusy(true);
    try {
      await signInGoogle();
      nav(next);
    } catch (err: any) {
      toast.error(err.message || "Google sign-in failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="container-edit py-16 md:py-24">
      <div className="max-w-md mx-auto">
        <p className="eyebrow mb-3">Account</p>
        <h1 className="display-md mb-2">{tab === "signin" ? "Welcome back." : "Create an account."}</h1>
        <p className="text-ink-mute mb-8">
          B2B accounts unlock cafe, restaurant, and wholesale pricing tiers.
        </p>

        <div className="flex gap-1 mb-8 border-b border-line">
          {(["signin", "signup"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-3 text-sm border-b-2 -mb-px ${
                tab === t ? "border-ink text-ink" : "border-transparent text-ink-mute"
              }`}
            >
              {t === "signin" ? "Sign in" : "Create account"}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {tab === "signup" && (
            <div>
              <label className="eyebrow block mb-2">Company</label>
              <input className="input" value={companyName} onChange={(e) => setCompanyName(e.target.value)} placeholder="e.g. Brooklyn Roasters Co." />
            </div>
          )}
          <div>
            <label className="eyebrow block mb-2">Email</label>
            <input type="email" required className="input" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div>
            <label className="eyebrow block mb-2">Password</label>
            <input type="password" required minLength={6} className="input" value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          <button disabled={busy} type="submit" className="btn-primary w-full">
            {busy ? "Working…" : tab === "signin" ? "Sign in" : "Create account"}
          </button>
        </form>

        <div className="my-6 flex items-center gap-3 text-xs text-ink-mute">
          <div className="rule flex-1" /> or <div className="rule flex-1" />
        </div>
        <button onClick={handleGoogle} disabled={busy} className="btn-outline w-full">
          Continue with Google
        </button>

        <p className="text-xs text-ink-mute mt-8 text-center">
          Demo accounts: <code>cafe@orderpilot.test</code>, <code>restaurant@orderpilot.test</code>, <code>wholesale@orderpilot.test</code>, <code>admin@orderpilot.test</code> — all with password <code>demo1234</code>.
        </p>

        <div className="mt-8 text-center">
          <Link to="/" className="text-sm text-ink-mute hover:text-accent">← Back home</Link>
        </div>
      </div>
    </div>
  );
}
