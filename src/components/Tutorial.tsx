import { useState, useEffect, useLayoutEffect, useCallback, useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Sparkles,
  BookOpen,
  Sliders,
  FileText,
  CreditCard,
  ClipboardList,
  PackageCheck,
  ArrowRight,
  ArrowLeft,
  X,
} from "lucide-react";
import { useAuth } from "@/store/auth";

const TUTORIAL_KEY_PREFIX = "orderpilot:tutorial_seen:";
const MOBILE_BREAKPOINT = 768;

type Step = {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  title: string;
  body: React.ReactNode;
  /** data-tour attribute on the target element. Omit for centered (welcome / final). */
  target?: string;
  /** Preferred placement of the tooltip relative to the target. */
  placement?: "right" | "left" | "top" | "bottom";
};

const CUSTOMER_STEPS: Step[] = [
  {
    icon: Sparkles,
    title: "Welcome to your portal",
    body: (
      <>
        OrderPilot is a B2B portal for configured coffee orders — your
        <span className="italic"> tier pricing</span>, saved quotes, and Net-30
        invoicing all in one place. Take thirty seconds.
      </>
    ),
  },
  {
    icon: BookOpen,
    title: "Browse the catalog",
    body: (
      <>
        Every lot in rotation, filtered by category. Open a product to launch
        the configurator.
      </>
    ),
    target: "nav-catalog",
    placement: "bottom",
  },
  {
    icon: Sliders,
    title: "Constraints, priced live",
    body: (
      <>
        Pick grind, bag size, and quantity — the engine recomputes
        <span className="italic"> your tier price</span> on every change. No
        round-trip, no surprises.
      </>
    ),
    target: "nav-catalog",
    placement: "bottom",
  },
  {
    icon: FileText,
    title: "Save and share quotes",
    body: (
      <>
        Lock a configuration into a quote, then share via URL with your team or
        send to your own purchasing.
      </>
    ),
    target: "nav-quotes",
    placement: "bottom",
  },
  {
    icon: CreditCard,
    title: "You're set.",
    body: (
      <>
        Check out instantly with Stripe, or request a Net-30 invoice from any
        approved quote. Built by{" "}
        <a href="https://letsbuildmyapp.com" className="text-accent underline">
          letsbuildmyapp.com
        </a>
        .
      </>
    ),
  },
];

const ADMIN_STEPS: Step[] = [
  {
    icon: Sparkles,
    title: "Welcome, operator",
    body: (
      <>
        The admin console — quotes, orders, and customer pipeline in one view.
        Quick orientation.
      </>
    ),
  },
  {
    icon: ClipboardList,
    title: "Quote management",
    body: (
      <>
        Review, approve, expire, or resend any customer quote. Tier and totals
        are visible at a glance.
      </>
    ),
    target: "admin-tabs",
    placement: "bottom",
  },
  {
    icon: PackageCheck,
    title: "Order pipeline",
    body: (
      <>
        Switch to the Orders tab to advance fulfillment status — paid, packed,
        shipped, delivered.
      </>
    ),
    target: "admin-tabs",
    placement: "bottom",
  },
  {
    icon: Sparkles,
    title: "You're set.",
    body: (
      <>
        Click any quote or order number to open the full detail view.
      </>
    ),
  },
];

type Rect = { top: number; left: number; width: number; height: number };

export function Tutorial() {
  const auth = useAuth();
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);
  const [rect, setRect] = useState<Rect | null>(null);
  const [isMobile, setIsMobile] = useState(() =>
    typeof window === "undefined" ? false : window.innerWidth < MOBILE_BREAKPOINT,
  );

  const role = useMemo<"admin" | "customer" | null>(() => {
    if (!auth.user || !auth.profile) return null;
    return auth.profile.isAdmin ? "admin" : "customer";
  }, [auth.user, auth.profile]);

  const STEPS = useMemo<Step[]>(() => {
    return role === "admin" ? ADMIN_STEPS : CUSTOMER_STEPS;
  }, [role]);

  // Reset to first step if role changes mid-tour
  useEffect(() => {
    setStep(0);
  }, [STEPS]);

  // First-run check — per role, per device
  useEffect(() => {
    if (!role) {
      setOpen(false);
      return;
    }
    const seen = localStorage.getItem(TUTORIAL_KEY_PREFIX + role);
    setOpen(!seen);
    setStep(0);
  }, [role]);

  // Track viewport size
  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // Lock body scroll
  useEffect(() => {
    if (open) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = prev;
      };
    }
  }, [open]);

  const close = useCallback(() => {
    if (role) localStorage.setItem(TUTORIAL_KEY_PREFIX + role, "1");
    setOpen(false);
  }, [role]);

  const next = useCallback(() => {
    setStep((s) => {
      if (s < STEPS.length - 1) return s + 1;
      close();
      return s;
    });
  }, [close, STEPS.length]);

  const back = useCallback(() => setStep((s) => Math.max(0, s - 1)), []);

  // Keyboard
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      else if (e.key === "ArrowRight" || e.key === "Enter") {
        e.preventDefault();
        next();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        back();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, close, next, back]);

  const currentStep = STEPS[step];
  const targetSel = currentStep.target;

  useLayoutEffect(() => {
    if (!open || isMobile || !targetSel) {
      setRect(null);
      return;
    }
    const compute = () => {
      const el = document.querySelector(`[data-tour="${targetSel}"]`) as HTMLElement | null;
      if (!el) {
        setRect(null);
        return;
      }
      const r = el.getBoundingClientRect();
      setRect({ top: r.top, left: r.left, width: r.width, height: r.height });
    };
    compute();
    const onResize = () => compute();
    window.addEventListener("resize", onResize);
    window.addEventListener("scroll", onResize, true);
    return () => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener("scroll", onResize, true);
    };
  }, [open, isMobile, targetSel, step]);

  if (!open) return null;

  const hasTarget = !!rect && !!targetSel;
  if (isMobile || !hasTarget) {
    return (
      <CenteredModal
        steps={STEPS}
        step={step}
        onClose={close}
        onNext={next}
        onBack={back}
        onJump={setStep}
        dim={!isMobile && !targetSel}
      />
    );
  }

  // ---------- DESKTOP: spotlight ----------
  const Icon = currentStep.icon;
  const isLast = step === STEPS.length - 1;

  const PAD = 16;
  const TOOLTIP_W = 380;
  const TOOLTIP_H_EST = 320;
  let top = 0;
  let left = 0;
  if (rect) {
    const placement = currentStep.placement ?? "right";
    if (placement === "right") {
      left = rect.left + rect.width + PAD;
      top = rect.top;
      if (left + TOOLTIP_W > window.innerWidth - PAD) {
        left = rect.left;
        top = rect.top + rect.height + PAD;
      }
    } else if (placement === "left") {
      left = rect.left - TOOLTIP_W - PAD;
      top = rect.top;
    } else if (placement === "bottom") {
      left = rect.left;
      top = rect.top + rect.height + PAD;
    } else if (placement === "top") {
      left = rect.left;
      top = rect.top - TOOLTIP_H_EST - PAD;
    }
    left = Math.min(Math.max(PAD, left), window.innerWidth - TOOLTIP_W - PAD);
    top = Math.min(Math.max(PAD, top), window.innerHeight - TOOLTIP_H_EST - PAD);
  }
  const tipStyle: React.CSSProperties = { top, left };

  return (
    <AnimatePresence>
      {/* Spotlight backdrop with cutout */}
      <motion.div
        key="spot-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100]"
        onClick={close}
      >
        {hasTarget && rect ? (
          <motion.div
            initial={false}
            animate={{
              top: rect.top - 6,
              left: rect.left - 6,
              width: rect.width + 12,
              height: rect.height + 12,
            }}
            transition={{ type: "spring", stiffness: 360, damping: 32 }}
            className="absolute rounded-none pointer-events-none"
            style={{
              boxShadow:
                "0 0 0 9999px rgba(0,0,0,0.72), 0 0 0 2px oklch(38% 0.085 35)",
            }}
          />
        ) : (
          <div className="absolute inset-0 bg-black/72" />
        )}
      </motion.div>

      {/* Tooltip card — editorial: rounded-none, terracotta top border, Fraunces italic title */}
      <motion.div
        key={`tip-${step}`}
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -4 }}
        transition={{ duration: 0.18 }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="tutorial-title"
        className="fixed z-[101] w-[380px] rounded-none border border-line border-t-4 border-t-accent bg-cream-50 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.25)]"
        style={tipStyle}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 pt-5 pb-3">
          <span className="eyebrow text-ink-mute">
            Tour · <span className="num">{step + 1}</span> of{" "}
            <span className="num">{STEPS.length}</span>
          </span>
          <button
            onClick={close}
            className="text-ink-mute hover:text-accent p-1.5 -mr-1.5"
            aria-label="Close tour"
          >
            <X size={16} />
          </button>
        </div>

        <div className="px-6 pb-5">
          <Icon size={22} className="text-accent mb-5" />
          <h2
            id="tutorial-title"
            className="font-serif italic text-[28px] leading-[1.15] text-ink"
          >
            {currentStep.title}
          </h2>
          <div className="text-[17px] leading-[1.6] text-ink-soft mt-4">
            {currentStep.body}
          </div>
        </div>

        <div className="flex items-center justify-between px-6 py-4 border-t border-line">
          <div className="flex items-center gap-2">
            {STEPS.map((_, i) => (
              <button
                key={i}
                onClick={() => setStep(i)}
                aria-label={`Go to step ${i + 1}`}
                className={
                  i === step
                    ? "h-[3px] w-6 bg-accent transition-all"
                    : "h-[3px] w-2 bg-line hover:bg-ink-mute transition-all"
                }
              />
            ))}
          </div>
          <div className="flex items-center gap-2">
            {step > 0 ? (
              <button
                onClick={back}
                className="inline-flex items-center gap-1.5 h-9 px-3 text-sm text-ink-mute hover:text-accent transition-colors"
              >
                <ArrowLeft size={14} /> Back
              </button>
            ) : (
              <button
                onClick={close}
                className="inline-flex items-center h-9 px-3 text-sm text-ink-mute hover:text-accent transition-colors"
              >
                Skip
              </button>
            )}
            <button
              onClick={next}
              className="inline-flex items-center gap-1.5 h-9 px-4 text-sm font-medium bg-accent hover:bg-accent-soft text-cream-50 transition-colors"
            >
              {isLast ? "Done" : "Next"} {!isLast ? <ArrowRight size={14} /> : null}
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

// ---------- Centered modal (mobile + no-target steps) ----------
function CenteredModal({
  steps,
  step,
  onClose,
  onNext,
  onBack,
  onJump,
  dim = true,
}: {
  steps: Step[];
  step: number;
  onClose: () => void;
  onNext: () => void;
  onBack: () => void;
  onJump: (i: number) => void;
  dim?: boolean;
}) {
  const current = steps[step];
  const Icon = current.icon;
  const isLast = step === steps.length - 1;

  return (
    <AnimatePresence>
      <motion.div
        key="modal-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className={`fixed inset-0 z-[100] grid place-items-center px-4 py-8 ${
          dim ? "bg-black/72 backdrop-blur-sm" : "bg-black/72"
        }`}
        onClick={onClose}
      >
        <motion.div
          key={`step-${step}`}
          initial={{ opacity: 0, y: 8, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -8, scale: 0.98 }}
          transition={{ duration: 0.18 }}
          className="w-full max-w-md rounded-none border border-line border-t-4 border-t-accent bg-cream-50 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.4)]"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between px-6 pt-5 pb-3">
            <span className="eyebrow text-ink-mute">
              Tour · <span className="num">{step + 1}</span> of{" "}
              <span className="num">{steps.length}</span>
            </span>
            <button
              onClick={onClose}
              className="text-ink-mute hover:text-accent p-1.5 -mr-1.5"
              aria-label="Close tour"
            >
              <X size={16} />
            </button>
          </div>
          <div className="px-6 pb-6">
            <Icon size={26} className="text-accent mb-6" />
            <h2 className="font-serif italic text-[36px] leading-[1.1] tracking-[-0.02em] text-ink">
              {current.title}
            </h2>
            <div className="text-[17px] leading-[1.6] text-ink-soft mt-5">
              {current.body}
            </div>
          </div>
          <div className="flex items-center justify-between px-6 py-4 border-t border-line">
            <div className="flex items-center gap-2">
              {steps.map((_, i) => (
                <button
                  key={i}
                  onClick={() => onJump(i)}
                  aria-label={`Go to step ${i + 1}`}
                  className={
                    i === step
                      ? "h-[3px] w-6 bg-accent transition-all"
                      : "h-[3px] w-2 bg-line hover:bg-ink-mute transition-all"
                  }
                />
              ))}
            </div>
            <div className="flex items-center gap-2">
              {step > 0 ? (
                <button
                  onClick={onBack}
                  className="inline-flex items-center gap-1.5 h-10 px-3 text-sm text-ink-mute hover:text-accent transition-colors"
                >
                  <ArrowLeft size={14} /> Back
                </button>
              ) : (
                <button
                  onClick={onClose}
                  className="inline-flex items-center h-10 px-3 text-sm text-ink-mute hover:text-accent transition-colors"
                >
                  Skip
                </button>
              )}
              <button
                onClick={onNext}
                className="inline-flex items-center gap-1.5 h-10 px-4 text-sm font-medium bg-accent hover:bg-accent-soft text-cream-50 transition-colors"
              >
                {isLast ? "Done" : "Next"}{" "}
                {!isLast ? <ArrowRight size={14} /> : null}
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
