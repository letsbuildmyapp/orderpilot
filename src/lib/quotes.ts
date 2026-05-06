import { db } from "./firebase";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import type {
  AccountProfile,
  Order,
  OrderStatus,
  PaymentMethod,
  Quote,
  QuoteLine,
  QuoteStatus,
} from "@/types";
import { TIERS } from "./tiers";
import { shortId } from "./utils";
import type { User } from "firebase/auth";

function genNumber(prefix: string) {
  const now = new Date();
  const y = now.getFullYear().toString().slice(2);
  const m = String(now.getMonth() + 1).padStart(2, "0");
  return `${prefix}-${y}${m}-${shortId().slice(0, 5).toUpperCase()}`;
}

interface SaveQuoteArgs {
  user: User;
  profile: AccountProfile;
  lines: QuoteLine[];
  status?: QuoteStatus;
  notes?: string;
}

export async function saveQuote({ user, profile, lines, status = "draft", notes }: SaveQuoteArgs): Promise<Quote> {
  const subtotalCents = lines.reduce((acc, l) => acc + l.unitCents * l.quantity, 0);
  const tierDiscountCents = Math.round(subtotalCents * TIERS[profile.tier].discount);
  const totalCents = subtotalCents - tierDiscountCents;

  const id = shortId() + shortId();
  const quote: Quote = {
    id,
    number: genNumber("Q"),
    ownerUid: user.uid,
    ownerEmail: user.email ?? profile.email,
    customerName: profile.displayName,
    companyName: profile.companyName,
    tier: profile.tier,
    lines,
    subtotalCents,
    tierDiscountCents,
    totalCents,
    status,
    notes,
    shareToken: shortId() + shortId(),
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  await setDoc(doc(db, "quotes", id), quote);
  return quote;
}

export async function getQuote(id: string): Promise<Quote | null> {
  const snap = await getDoc(doc(db, "quotes", id));
  return snap.exists() ? (snap.data() as Quote) : null;
}

export async function getQuoteByShareToken(token: string): Promise<Quote | null> {
  const q = query(collection(db, "quotes"), where("shareToken", "==", token), limit(1));
  const snap = await getDocs(q);
  if (snap.empty) return null;
  return snap.docs[0].data() as Quote;
}

export async function updateQuoteStatus(id: string, status: QuoteStatus, notes?: string) {
  const patch: any = { status, updatedAt: Date.now() };
  if (notes !== undefined) patch.notes = notes;
  await updateDoc(doc(db, "quotes", id), patch);
}

export async function listMyQuotes(uid: string): Promise<Quote[]> {
  const q = query(collection(db, "quotes"), where("ownerUid", "==", uid), orderBy("createdAt", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => d.data() as Quote);
}

export async function listAllQuotes(): Promise<Quote[]> {
  const q = query(collection(db, "quotes"), orderBy("createdAt", "desc"), limit(200));
  const snap = await getDocs(q);
  return snap.docs.map((d) => d.data() as Quote);
}

interface CreateOrderArgs {
  user: User;
  profile: AccountProfile;
  lines: QuoteLine[];
  paymentMethod: PaymentMethod;
  shippingAddress?: string;
  quoteId?: string;
}

export async function createOrder({
  user,
  profile,
  lines,
  paymentMethod,
  shippingAddress,
  quoteId,
}: CreateOrderArgs): Promise<Order> {
  const subtotalCents = lines.reduce((acc, l) => acc + l.unitCents * l.quantity, 0);
  const tierDiscountCents = Math.round(subtotalCents * TIERS[profile.tier].discount);
  const totalCents = subtotalCents - tierDiscountCents;

  const id = shortId() + shortId();
  const status: OrderStatus = paymentMethod === "card" ? "paid" : "pending_invoice";

  const order: Order = {
    id,
    number: genNumber("O"),
    quoteId,
    ownerUid: user.uid,
    ownerEmail: user.email ?? profile.email,
    companyName: profile.companyName,
    tier: profile.tier,
    lines,
    subtotalCents,
    tierDiscountCents,
    totalCents,
    status,
    paymentMethod,
    shippingAddress,
    createdAt: Date.now(),
  };

  await setDoc(doc(db, "orders", id), order);
  if (quoteId) {
    await updateQuoteStatus(quoteId, "ordered");
  }
  return order;
}

export async function getOrder(id: string): Promise<Order | null> {
  const snap = await getDoc(doc(db, "orders", id));
  return snap.exists() ? (snap.data() as Order) : null;
}

export async function listMyOrders(uid: string): Promise<Order[]> {
  const q = query(collection(db, "orders"), where("ownerUid", "==", uid), orderBy("createdAt", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => d.data() as Order);
}

export async function listAllOrders(): Promise<Order[]> {
  const q = query(collection(db, "orders"), orderBy("createdAt", "desc"), limit(200));
  const snap = await getDocs(q);
  return snap.docs.map((d) => d.data() as Order);
}

export async function updateOrderStatus(id: string, status: OrderStatus) {
  await updateDoc(doc(db, "orders", id), { status });
}
