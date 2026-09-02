import type { ReactNode } from "react";

/** Shared chrome for the privacy / cookies / terms pages. */
export function LegalPage({
  title,
  intro,
  children,
}: {
  title: string;
  intro: string;
  children: ReactNode;
}) {
  return (
    <main id="main">
      <section className="page-head">
        <div className="wrap">
          <h1>{title}</h1>
          <p>{intro}</p>
        </div>
      </section>
      <div className="wrap">
        <article className="prose">{children}</article>
      </div>
    </main>
  );
}

/** The "needs a human before launch" callout. */
export function DraftNote({ children }: { children: ReactNode }) {
  return (
    <div className="prose__note">
      <p>{children}</p>
    </div>
  );
}

export function LastUpdated() {
  return <p className="prose__meta">Last updated: [DATE TO BE SET AT LAUNCH]</p>;
}
