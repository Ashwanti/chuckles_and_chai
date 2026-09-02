"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import { Icon } from "./Icons";
import { useCart } from "@/lib/cart";
import { describeOptions } from "@/lib/customise";
import {
  describeTotal,
  formatRupees,
  linePaise,
  orderHandoffUrl,
  validateOrder,
} from "@/lib/orders.ts";
import { SITE } from "@/lib/site.config";

/** Floating basket button; hidden until there is something in the basket. */
export function CartButton() {
  const { total, ready, open } = useCart();
  if (!ready || total.count === 0) return null;

  return (
    <button
      className="cart-fab"
      type="button"
      onClick={open}
      aria-label={`Open basket, ${total.count} items`}
    >
      <Icon name="bag" />
      <span className="cart-fab__count">{total.count}</span>
      <span className="cart-fab__label">Basket</span>
    </button>
  );
}

/**
 * The basket.
 *
 * Pickup only, and deliberately unscheduled: there is no delivery, and no
 * collection-time picker either. The order goes over on WhatsApp, the counter
 * starts on it, and it is ready when it is ready — which is how a small café
 * actually works. A time slot on the page would be a promise nobody in the
 * kitchen agreed to.
 */
export function CartDrawer() {
  const { lines, total, isOpen, close, setQty, setNote, remove, clear } = useCart();
  const config = SITE.ordering;

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [tried, setTried] = useState(false);
  const [sent, setSent] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (isOpen) closeRef.current?.focus();
    else setTried(false);
  }, [isOpen]);

  const draft = useMemo(() => ({ lines, name, phone, notes }), [lines, name, phone, notes]);
  const validation = useMemo(() => validateOrder(draft, config), [draft, config]);

  const send = () => {
    setTried(true);
    if (!validation.ok) return;
    window.open(orderHandoffUrl(draft, config, SITE.business.name), "_blank", "noopener");
    setSent(true);
  };

  return (
    <div
      className={`cart${isOpen ? " is-open" : ""}`}
      role="dialog"
      aria-modal="true"
      aria-label="Your basket"
      aria-hidden={!isOpen}
      onClick={(e) => {
        if (e.target === e.currentTarget) close();
      }}
    >
      <div className="cart__panel" ref={panelRef}>
        <header className="cart__head">
          <div>
            <p className="kicker" style={{ marginBottom: ".35rem" }}>
              Order ahead &middot; pickup
            </p>
            <h2>Your basket</h2>
          </div>
          <button
            className="cart__close"
            ref={closeRef}
            type="button"
            onClick={close}
            aria-label="Close basket"
            tabIndex={isOpen ? 0 : -1}
          >
            <Icon name="close" />
          </button>
        </header>

        {sent ? (
          <div className="cart__sent">
            <Icon name="check" className="cart__sent-ico" />
            <h3>Order sent</h3>
            <p>
              We have opened {config.send === "whatsapp" ? "WhatsApp" : "your email"} with the order
              written out. <strong>Send that message</strong> and the counter will start on it. Pay
              when you pick it up.
            </p>
            <div className="cart__actions">
              <button
                className="btn btn--sm"
                type="button"
                onClick={() => {
                  clear();
                  setSent(false);
                  close();
                }}
              >
                Start a new basket
              </button>
              <button className="btn btn--ghost btn--sm" type="button" onClick={() => setSent(false)}>
                Back to basket
              </button>
            </div>
          </div>
        ) : lines.length === 0 ? (
          <div className="cart__empty">
            <Icon name="bag" className="cart__empty-ico" />
            <p>Your basket is empty.</p>
            <button className="btn btn--ghost btn--sm" type="button" onClick={close}>
              Browse the menu
            </button>
          </div>
        ) : (
          <>
            <div className="cart__body">
              <ul className="cart__lines">
                {lines.map((line) => {
                  const each = linePaise(line);
                  const choices = describeOptions(line.options);
                  return (
                    <li className="cart__line" key={line.id}>
                      <div className="cart__line-top">
                        <div>
                          <p className="cart__line-name">{line.name}</p>
                          <p className="cart__line-cat">{line.category}</p>
                          {choices ? <p className="cart__line-opts">{choices}</p> : null}
                        </div>
                        <p className="cart__line-price">
                          {each === null ? (
                            <span title="Price confirmed in store">&mdash;</span>
                          ) : (
                            formatRupees(each)
                          )}
                        </p>
                      </div>

                      <div className="cart__line-controls">
                        <div className="qty" role="group" aria-label={`Quantity for ${line.name}`}>
                          <button
                            type="button"
                            onClick={() => setQty(line.id, line.qty - 1)}
                            aria-label={`One fewer ${line.name}`}
                            tabIndex={isOpen ? 0 : -1}
                          >
                            &minus;
                          </button>
                          <span aria-live="polite">{line.qty}</span>
                          <button
                            type="button"
                            onClick={() => setQty(line.id, line.qty + 1)}
                            aria-label={`One more ${line.name}`}
                            tabIndex={isOpen ? 0 : -1}
                          >
                            +
                          </button>
                        </div>
                        <button
                          className="cart__remove"
                          type="button"
                          onClick={() => remove(line.id)}
                          tabIndex={isOpen ? 0 : -1}
                        >
                          Remove
                        </button>
                      </div>

                      <input
                        className="cart__note"
                        type="text"
                        value={line.note ?? ""}
                        onChange={(e) => setNote(line.id, e.target.value)}
                        placeholder="Any changes? e.g. extra kadak, no sugar"
                        aria-label={`Note for ${line.name}`}
                        maxLength={120}
                        tabIndex={isOpen ? 0 : -1}
                      />
                    </li>
                  );
                })}
              </ul>

              <div className="cart__grid">
                <fieldset className="cart__field">
                  <legend>Name</legend>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Who is picking it up?"
                    autoComplete="name"
                    maxLength={60}
                    tabIndex={isOpen ? 0 : -1}
                  />
                </fieldset>
                <fieldset className="cart__field">
                  <legend>Phone</legend>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="In case we need to check"
                    autoComplete="tel"
                    maxLength={24}
                    tabIndex={isOpen ? 0 : -1}
                  />
                </fieldset>
              </div>

              <fieldset className="cart__field">
                <legend>Anything else</legend>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                  placeholder="Allergies, or anything we should know"
                  maxLength={300}
                  tabIndex={isOpen ? 0 : -1}
                />
                <p className="cart__hint">
                  <strong>Allergies:</strong> please also tell us in person when you pick up. Our
                  kitchen handles dairy, nuts, gluten, egg and soya, so we cannot guarantee no
                  traces.
                </p>
              </fieldset>
            </div>

            <footer className="cart__foot">
              {total.unpriced.length > 0 && (
                <p className="cart__hint cart__hint--warn">
                  Some items are not priced online yet, so the total is confirmed in store.
                </p>
              )}

              <div className="cart__total">
                <span>
                  Total{" "}
                  <small>
                    ({total.count} {total.count === 1 ? "item" : "items"})
                  </small>
                </span>
                <strong>{describeTotal(total)}</strong>
              </div>

              {tried && !validation.ok && (
                <ul className="cart__problems" aria-live="assertive">
                  {validation.problems.map((p) => (
                    <li key={p}>{p}</li>
                  ))}
                </ul>
              )}

              <button
                className="btn btn--accent cart__send"
                type="button"
                onClick={send}
                tabIndex={isOpen ? 0 : -1}
              >
                Send order {config.send === "whatsapp" ? "on WhatsApp" : "by email"}
                <Icon name="arrow" className="ico" />
              </button>

              <p className="cart__hint">
                Pickup only &mdash; we do not deliver, and there is no time slot to choose. Send it
                over, we will start on it, and you pay at the counter. No card details are taken
                here.
              </p>
              <button
                className="cart__clear"
                type="button"
                onClick={clear}
                tabIndex={isOpen ? 0 : -1}
              >
                Empty basket
              </button>
            </footer>
          </>
        )}
      </div>
    </div>
  );
}
