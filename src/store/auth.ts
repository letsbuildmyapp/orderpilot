import { create } from "zustand";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
  type User,
} from "firebase/auth";
import { auth, db, googleProvider } from "@/lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import type { AccountProfile, PricingTier } from "@/types";

interface AuthState {
  user: User | null;
  profile: AccountProfile | null;
  loading: boolean;
  init(): () => void;
  signIn(email: string, password: string): Promise<void>;
  signUp(email: string, password: string, companyName?: string): Promise<void>;
  signInGoogle(): Promise<void>;
  signOut(): Promise<void>;
  refreshProfile(): Promise<void>;
}

async function loadOrCreateProfile(user: User): Promise<AccountProfile> {
  const ref = doc(db, "accounts", user.uid);
  const snap = await getDoc(ref);
  if (snap.exists()) return snap.data() as AccountProfile;

  // Default tier "retail"; admins are designated by email match in seed.
  const isAdmin = user.email === "admin@orderpilot.test";
  const profile: AccountProfile = {
    uid: user.uid,
    email: user.email ?? "",
    displayName: user.displayName ?? undefined,
    companyName: undefined,
    tier: "retail" as PricingTier,
    isAdmin,
    createdAt: Date.now(),
  };
  await setDoc(ref, profile);
  return profile;
}

export const useAuth = create<AuthState>((set, get) => ({
  user: null,
  profile: null,
  loading: true,
  init() {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        set({ user: null, profile: null, loading: false });
        return;
      }
      const profile = await loadOrCreateProfile(user);
      set({ user, profile, loading: false });
    });
    return unsub;
  },
  async signIn(email, password) {
    await signInWithEmailAndPassword(auth, email, password);
  },
  async signUp(email, password, companyName) {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    if (companyName) {
      const ref = doc(db, "accounts", cred.user.uid);
      const existing = await getDoc(ref);
      const base = existing.exists() ? (existing.data() as AccountProfile) : await loadOrCreateProfile(cred.user);
      await setDoc(ref, { ...base, companyName });
    }
  },
  async signInGoogle() {
    await signInWithPopup(auth, googleProvider);
  },
  async signOut() {
    await signOut(auth);
  },
  async refreshProfile() {
    const u = get().user;
    if (!u) return;
    const profile = await loadOrCreateProfile(u);
    set({ profile });
  },
}));
