import type { Metadata } from "next";
import Link from "next/link";

import { LegalPage } from "@/components/LegalPage";
import credits from "@/lib/photo-credits.json";

export const metadata: Metadata = {
  title: "Photo Credits",
  description: "Where the photographs on this website came from, and the licence each is used under.",
  robots: { index: false, follow: true },
  alternates: { canonical: "/credits" },
};

interface Credit {
  file: string;
  alt: string;
  title: string;
  author: string;
  licence: string;
  licenceUrl: string;
  source: string;
  attributionRequired: boolean;
  shareAlike: boolean;
}

/**
 * Shown while every image slot is still a drawn placeholder panel. Those are
 * ours, so there is nothing to attribute and no obligation to discharge — but
 * the footer links here, and a link to an empty table is worse than a link to
 * a straight answer.
 */
function NoPhotosYet() {
  return (
    <LegalPage
      title="Photo Credits"
      intro="Where every photograph on this site came from, and the licence it is used under."
    >
      <div className="prose__note">
        <p>
          <strong>There are no third-party photographs on this site yet.</strong> Every image slot
          is currently a plain drawn panel, made for this build, so nothing here needs crediting.
        </p>
      </div>

      <h2>What happens next</h2>
      <p>
        Running <code>npm run photos</code> fills the slots with openly-licensed photographs from{" "}
        <a href="https://commons.wikimedia.org" target="_blank" rel="noopener noreferrer">
          Wikimedia Commons
        </a>{" "}
        &mdash; CC0, public domain, CC BY or CC BY-SA only &mdash; and rewrites this page with the
        credit each one requires. Nothing non-commercial or no-derivatives is ever selected: both
        would be breached by a business website that crops its images.
      </p>
      <p>
        Better still, drop the café&rsquo;s own photography over the files in{" "}
        <code>public/images</code>. The dimensions already match and nothing in the code needs to
        change. Once every slot is the café&rsquo;s own work, this page and the footer link to it
        can be removed. See <Link href="/">the site</Link> or the project README.
      </p>
    </LegalPage>
  );
}

/**
 * Photo credits.
 *
 * This page is not decoration. The CC BY and CC BY-SA photographs on this site
 * are only licensed while they are attributed, and cropping a share-alike photo
 * makes an adaptation that has to be offered under the same terms. This page is
 * what discharges both obligations, so it stays linked from the footer for as
 * long as those photographs are in use.
 *
 * When every image has been replaced with the café's own photography, delete
 * lib/photo-credits.json, this route, and the footer link.
 */
export default function CreditsPage() {
  const photos = credits as Credit[];
  // Before `npm run photos` has been run, every slot is a plain drawn panel
  // and there is nothing to credit. Saying so is more useful than an empty
  // table with a heading over it.
  if (photos.length === 0) return <NoPhotosYet />;
  const needAttribution = photos.filter((p) => p.attributionRequired);
  const free = photos.length - needAttribution.length;

  return (
    <LegalPage
      title="Photo Credits"
      intro="Where every photograph on this site came from, and the licence it is used under."
    >
      <div className="prose__note">
        <p>
          <strong>These are stand-in photographs, not pictures of Chuckles &amp; Chai.</strong> They
          show the right subject at the right crop so the design can be judged, and they are
          openly licensed so they can be published lawfully in the meantime. They should be
          replaced with the café&rsquo;s own photography before launch, at which point this page
          can go.
        </p>
      </div>

      <h2>The short version</h2>
      <p>
        {photos.length} photographs, all sourced from{" "}
        <a href="https://commons.wikimedia.org" target="_blank" rel="noopener noreferrer">
          Wikimedia Commons
        </a>
        . <strong>{free}</strong> are CC0 or public domain and carry no conditions at all.{" "}
        <strong>{needAttribution.length}</strong> require attribution, which is what the table
        below is for. Nothing here is non-commercial or no-derivatives licensed &mdash; both would
        be breached by a business website that crops its images.
      </p>

      {needAttribution.length > 0 && (
        <>
          <h2>Photographs that require credit</h2>
          <ul>
            {needAttribution.map((photo) => (
              <li key={photo.file}>
                <strong>{photo.alt}</strong> &mdash; &ldquo;{photo.title}&rdquo; by {photo.author},{" "}
                <a href={photo.source} target="_blank" rel="noopener noreferrer">
                  via Wikimedia Commons
                </a>
                , licensed under{" "}
                {photo.licenceUrl ? (
                  <a href={photo.licenceUrl} target="_blank" rel="noopener noreferrer">
                    {photo.licence}
                  </a>
                ) : (
                  photo.licence
                )}
                . Cropped for this site.
                {photo.shareAlike && (
                  <>
                    {" "}
                    <em>
                      This crop is an adaptation and is offered under the same {photo.licence}{" "}
                      licence.
                    </em>
                  </>
                )}
              </li>
            ))}
          </ul>
        </>
      )}

      <h2>Every photograph on this site</h2>
      <div className="credits__scroll">
        <table className="credits__table">
          <thead>
            <tr>
              <th scope="col">Where it appears</th>
              <th scope="col">Title</th>
              <th scope="col">By</th>
              <th scope="col">Licence</th>
            </tr>
          </thead>
          <tbody>
            {photos.map((photo) => (
              <tr key={photo.file}>
                <td>{photo.alt}</td>
                <td>
                  <a href={photo.source} target="_blank" rel="noopener noreferrer">
                    {photo.title}
                  </a>
                </td>
                <td>{photo.author}</td>
                <td>
                  {photo.licenceUrl ? (
                    <a href={photo.licenceUrl} target="_blank" rel="noopener noreferrer">
                      {photo.licence}
                    </a>
                  ) : (
                    photo.licence
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2>Replacing them</h2>
      <p>
        Drop a real photograph over the matching file in <code>public/images</code>. The
        dimensions already match and nothing in the code needs to change. Once every slot is the
        café&rsquo;s own work, this page and the footer link to it can be removed. See{" "}
        <Link href="/">the site</Link> or the project README for the full pre-launch list.
      </p>
    </LegalPage>
  );
}
