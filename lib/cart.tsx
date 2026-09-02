"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useState,
  type ReactNode,
} from "react";

import { isSelectedOption } from "./customise.ts";
import { cartTotal, type CartTotal } from "./orders.ts";
import type { CartLine } from "./types";

const STORAGE_KEY = "chuckles-basket-v1";

type Action =
  | { type: "add"; line: Omit<CartLine, "qty">; qty?: number }
  | { type: "setQty"; id: string; qty: number }
  | { type: "setNote"; id: string; note: string }
  | { type: "remove"; id: string }
  | { type: "clear" }
  | { type: "hydrate"; lines: CartLine[] };

function reducer(lines: CartLine[], action: Action): CartLine[] {
  switch (action.type) {
    case "hydrate":
      return action.lines;

    case "add": {
      const qty = action.qty ?? 1;
      const existing = lines.find((l) => l.id === action.line.id);
      // Adding the same item again bumps the quantity rather than stacking a
      // second identical row - a basket with "1 x Latte" three times is a bug.
      if (existing) {
        return lines.map((l) => (l.id === action.line.id ? { ...l, qty: l.qty + qty } : l));
      }
      return [...lines, { ...action.line, qty }];
    }

    case "setQty":
      // Dropping to zero removes the line; there is no "0 x Latte" state.
      if (action.qty <= 0) return lines.filter((l) => l.id !== action.id);
      return lines.map((l) => (l.id === action.id ? { ...l, qty: action.qty } : l));

    case "setNote":
      return lines.map((l) => (l.id === action.id ? { ...l, note: action.note || undefined } : l));

    case "remove":
      return lines.filter((l) => l.id !== action.id);

    case "clear":
      return [];
  }
}

interface CartValue {
  lines: CartLine[];
  total: CartTotal;
  /** True once localStorage has been read, so the badge does not flash. */
  ready: boolean;
  isOpen: boolean;
  open: () => void;
  close: () => void;
  add: (line: Omit<CartLine, "qty">, qty?: number) => void;
  setQty: (id: string, qty: number) => void;
  setNote: (id: string, note: string) => void;
  remove: (id: string) => void;
  clear: () => void;
  /** Id of the line added most recently, for the "Added" button flash. */
  lastAdded: string | null;
}

const CartContext = createContext<CartValue | null>(null);

function readStored(): CartLine[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    // Storage is user-writable and survives deploys, so validate rather than
    // trust: a stale or hand-edited basket must not crash the page.
    return parsed.filter(
      (l): l is CartLine =>
        !!l &&
        typeof l === "object" &&
        typeof (l as CartLine).id === "string" &&
        typeof (l as CartLine).name === "string" &&
        typeof (l as CartLine).price === "string" &&
        Number.isFinite((l as CartLine).qty) &&
        (l as CartLine).qty > 0 &&
        // Options render straight into the basket and into the message sent to
        // the café, so a hand-edited entry must not get that far.
        ((l as CartLine).options === undefined ||
          (Array.isArray((l as CartLine).options) &&
            (l as CartLine).options!.every(isSelectedOption))),
    );
  } catch {
    return [];
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, dispatch] = useReducer(reducer, []);
  const [ready, setReady] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [lastAdded, setLastAdded] = useState<string | null>(null);

  useEffect(() => {
    dispatch({ type: "hydrate", lines: readStored() });
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
    } catch {
      // Private mode or full storage: the basket still works for this visit.
    }
  }, [lines, ready]);

  // Lock the page behind the basket panel, as with the other overlays.
  useEffect(() => {
    document.body.classList.toggle("is-locked", isOpen);
    return () => document.body.classList.remove("is-locked");
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [isOpen]);

  const add = useCallback((line: Omit<CartLine, "qty">, qty = 1) => {
    dispatch({ type: "add", line, qty });
    setLastAdded(line.id);
    window.setTimeout(() => setLastAdded((id) => (id === line.id ? null : id)), 1600);
  }, []);

  const value = useMemo<CartValue>(
    () => ({
      lines,
      total: cartTotal(lines),
      ready,
      isOpen,
      lastAdded,
      open: () => setIsOpen(true),
      close: () => setIsOpen(false),
      add,
      setQty: (id, qty) => dispatch({ type: "setQty", id, qty }),
      setNote: (id, note) => dispatch({ type: "setNote", id, note }),
      remove: (id) => dispatch({ type: "remove", id }),
      clear: () => dispatch({ type: "clear" }),
    }),
    [lines, ready, isOpen, lastAdded, add],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside <CartProvider>");
  return ctx;
}

/** Safe variant for components that render whether or not ordering is on. */
export function useOptionalCart(): CartValue | null {
  return useContext(CartContext);
}
