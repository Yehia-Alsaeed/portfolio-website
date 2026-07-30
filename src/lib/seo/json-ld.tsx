/**
 * Renders a JSON-LD `<script>` tag from a server-owned, typed object. `<` is
 * escaped so a value that happens to contain `</script>` cannot break out of
 * the script context.
 */
export function JsonLd({ data }: { data: object }) {
  const json = JSON.stringify(data).replace(/</g, "\\u003c");

  return <script dangerouslySetInnerHTML={{ __html: json }} type="application/ld+json" />;
}
