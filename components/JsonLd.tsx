/**
 * Emits a schema.org JSON-LD block.
 *
 * The payload is generated from our own typed config - never from user input -
 * so serialising it straight into the script tag is safe here.
 */
export function JsonLd({ data }: { data: object }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
