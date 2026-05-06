/**
 * OrderPilot Cloud Functions
 *
 * Stub implementations sufficient for local emulator development. These
 * encode the contracts the frontend will use against a real Firebase
 * project. Stripe + Resend integrations are intentionally minimal — the
 * emulator runs them as no-ops with structured logging.
 */
import { onCall, HttpsError } from "firebase-functions/v2/https";
import { onDocumentCreated } from "firebase-functions/v2/firestore";
import { initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

initializeApp();
const db = getFirestore();

interface CreateCheckoutInput {
  quoteId?: string;
  lineIds?: string[];
  successUrl: string;
  cancelUrl: string;
}

export const createCheckoutSession = onCall<CreateCheckoutInput>(async (req) => {
  if (!req.auth) throw new HttpsError("unauthenticated", "Sign in required");
  // In production: build Stripe line items from the quote/lines and create
  // a Checkout Session with stripe.checkout.sessions.create(...).
  return {
    sessionId: "cs_test_" + Math.random().toString(36).slice(2),
    url: req.data.successUrl + "?stub=1",
  };
});

interface RequestInvoiceInput {
  orderId: string;
}

export const requestInvoice = onCall<RequestInvoiceInput>(async (req) => {
  if (!req.auth) throw new HttpsError("unauthenticated", "Sign in required");
  const { orderId } = req.data;
  await db.collection("orders").doc(orderId).update({
    status: "pending_invoice",
    invoiceRequestedAt: Date.now(),
  });
  // In production: send templated react-email via Resend to billing@.
  return { ok: true };
});

export const onOrderCreated = onDocumentCreated("orders/{id}", async (event) => {
  const data = event.data?.data();
  if (!data) return;
  console.log("[orderpilot] new order", event.params.id, data.totalCents);
  // In production: send confirmation email + webhook to fulfillment.
});
