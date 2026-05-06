import { auth, db } from "@/lib/firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import type { AccountProfile, Quote, QuoteLine } from "@/types";
import { TIERS } from "@/lib/tiers";
import { findProduct } from "./products";
import { computeLineCents, defaultConfig, summarizeConfig } from "@/lib/pricing";
import { shortId } from "@/lib/utils";

const SEED_FLAG = "orderpilot_seed_v1";

const SEED_USERS: Array<{
  email: string;
  password: string;
  tier: AccountProfile["tier"];
  isAdmin: boolean;
  companyName?: string;
}> = [
  { email: "cafe@orderpilot.test", password: "demo1234", tier: "cafe", isAdmin: false, companyName: "Aperture Coffee Bar" },
  { email: "restaurant@orderpilot.test", password: "demo1234", tier: "restaurant", isAdmin: false, companyName: "Loam & Larder" },
  { email: "wholesale@orderpilot.test", password: "demo1234", tier: "wholesale", isAdmin: false, companyName: "Northstar Distribution" },
  { email: "admin@orderpilot.test", password: "demo1234", tier: "wholesale", isAdmin: true, companyName: "OrderPilot HQ" },
];

async function ensureUser(u: typeof SEED_USERS[number]) {
  let uid: string | null = null;
  try {
    const cred = await createUserWithEmailAndPassword(auth, u.email, u.password);
    uid = cred.user.uid;
  } catch (e: any) {
    if (e.code === "auth/email-already-in-use") {
      const cred = await signInWithEmailAndPassword(auth, u.email, u.password);
      uid = cred.user.uid;
    } else {
      throw e;
    }
  }
  if (!uid) return null;

  const ref = doc(db, "accounts", uid);
  const profile: AccountProfile = {
    uid,
    email: u.email,
    companyName: u.companyName,
    tier: u.tier,
    isAdmin: u.isAdmin,
    createdAt: Date.now(),
  };
  const snap = await getDoc(ref);
  if (!snap.exists()) await setDoc(ref, profile);
  else await setDoc(ref, { ...(snap.data() as AccountProfile), tier: u.tier, isAdmin: u.isAdmin, companyName: u.companyName });

  return uid;
}

async function createSampleQuote(uid: string, email: string, companyName: string, tier: AccountProfile["tier"]) {
  const productIds = ["ethiopia-yirgacheffe", "house-blend-paloma"];
  const lines: QuoteLine[] = productIds.map((pid) => {
    const product = findProduct(pid)!;
    const cfg = defaultConfig(product);
    const { unitCents, lineCents, quantity } = computeLineCents(product, cfg, tier);
    return {
      id: shortId(),
      productId: pid,
      productName: product.name,
      config: cfg,
      quantity,
      unitCents,
      lineCents,
      configSummary: summarizeConfig(product, cfg),
    };
  });
  const subtotalCents = lines.reduce((acc, l) => acc + l.unitCents * l.quantity, 0);
  const tierDiscountCents = Math.round(subtotalCents * TIERS[tier].discount);
  const totalCents = subtotalCents - tierDiscountCents;

  const id = "seed-" + uid.slice(0, 8);
  const quote: Quote = {
    id,
    number: `Q-SEED-${uid.slice(0, 5).toUpperCase()}`,
    ownerUid: uid,
    ownerEmail: email,
    companyName,
    tier,
    lines,
    subtotalCents,
    tierDiscountCents,
    totalCents,
    status: "sent",
    notes: "Seed quote",
    shareToken: shortId() + shortId(),
    createdAt: Date.now() - 86400000 * 3,
    updatedAt: Date.now() - 86400000 * 3,
  };
  await setDoc(doc(db, "quotes", id), quote);
}

export async function ensureSeed() {
  if (typeof window === "undefined") return;
  if (localStorage.getItem(SEED_FLAG) === "done") return;

  // Only seed against emulator. If no emulator and no real config, skip.
  const useEmulator =
    import.meta.env.VITE_USE_EMULATOR === "true" ||
    (import.meta.env.DEV && !import.meta.env.VITE_FIREBASE_API_KEY);
  if (!useEmulator) {
    localStorage.setItem(SEED_FLAG, "done");
    return;
  }

  console.log("[orderpilot] seeding emulator…");
  try {
    for (const u of SEED_USERS) {
      const uid = await ensureUser(u);
      if (uid && !u.isAdmin) {
        await createSampleQuote(uid, u.email, u.companyName ?? "", u.tier);
      }
    }
    await signOut(auth).catch(() => {});
    localStorage.setItem(SEED_FLAG, "done");
    console.log("[orderpilot] seed complete");
  } catch (e) {
    console.warn("[orderpilot] seed error", e);
  }
}
