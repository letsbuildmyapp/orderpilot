import { useState } from "react";
import { useAuth } from "@/store/auth";
import { TIERS, TIER_OPTIONS } from "@/lib/tiers";
import { db } from "@/lib/firebase";
import { doc, updateDoc } from "firebase/firestore";
import { toast } from "sonner";

export default function Account() {
  const { profile, refreshProfile } = useAuth();
  const [companyName, setCompanyName] = useState(profile?.companyName ?? "");
  const [tier, setTier] = useState(profile?.tier ?? "retail");
  const [busy, setBusy] = useState(false);

  if (!profile) return null;

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      await updateDoc(doc(db, "accounts", profile!.uid), { companyName, tier });
      await refreshProfile();
      toast.success("Profile updated");
    } catch (err: any) {
      toast.error(err.message || "Update failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="container-edit py-12 md:py-20 max-w-3xl">
      <p className="eyebrow mb-3">Account</p>
      <h1 className="display-md mb-12">{profile.companyName || profile.email}</h1>

      <form onSubmit={handleSave} className="space-y-8">
        <div>
          <label className="eyebrow block mb-2">Email</label>
          <p className="text-lg">{profile.email}</p>
        </div>
        <div>
          <label className="eyebrow block mb-2">Company name</label>
          <input className="input" value={companyName} onChange={(e) => setCompanyName(e.target.value)} />
        </div>
        <div>
          <label className="eyebrow block mb-3">Pricing tier</label>
          <div className="grid sm:grid-cols-2 gap-2">
            {TIER_OPTIONS.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTier(t)}
                className={`p-4 border text-left ${tier === t ? "border-ink bg-ink text-cream-50" : "border-line hover:border-ink"}`}
              >
                <div className="font-serif text-lg">{TIERS[t].label}</div>
                <div className={`text-caption mt-1 ${tier === t ? "text-cream-50" : "text-ink-mute"}`}>{(TIERS[t].discount * 100).toFixed(0)}% off list</div>
              </button>
            ))}
          </div>
          <p className="text-xs text-ink-mute mt-2">
            Demo only — in production, tier changes require admin approval. Switching tier here lets you preview tier-based pricing across the app.
          </p>
        </div>
        <button disabled={busy} type="submit" className="btn-primary">
          {busy ? "Saving…" : "Save changes"}
        </button>
      </form>
    </div>
  );
}
