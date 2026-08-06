/**
 * Sanitiser for seller-authored part descriptions.
 *
 * Descriptions are written by sellers in a rich-text editor and rendered to
 * buyers with dangerouslySetInnerHTML, so they must be scrubbed. The strategy
 * is a strict tag allowlist with **zero attributes preserved** — every tag is
 * rewritten to its bare form. Dropping attributes wholesale removes the entire
 * class of `javascript:` URLs, `on*` handlers, `style` injection and `srcset`
 * tricks in one move, rather than trying to filter them individually.
 *
 * Anything not on the allowlist is removed outright (allowlist, never
 * denylist), so novel or obfuscated tags fail closed.
 *
 * Run this on read as well as on write: sellers hold an RLS update policy on
 * their own products, so they could write raw HTML straight to the column
 * without going through the listing form.
 */

const ALLOWED_TAGS = new Set([
  "p", "br", "strong", "b", "em", "i", "u", "s",
  "ul", "ol", "li", "h3", "h4", "blockquote",
]);

/** Elements whose *content* is dropped too, not just their tags. */
const VOID_CONTENT = "script|style|iframe|object|embed|noscript|template|svg|math";

const MAX_LENGTH = 20_000;

export function sanitizeRichText(html: string | null | undefined): string {
  if (!html) return "";

  let out = html.slice(0, MAX_LENGTH);

  // Remove dangerous elements along with everything inside them, so their
  // payload doesn't survive as visible text once the tags are stripped.
  out = out
    .replace(new RegExp(`<(${VOID_CONTENT})\\b[\\s\\S]*?<\\/\\1\\s*>`, "gi"), "")
    .replace(new RegExp(`<\\/?(${VOID_CONTENT})\\b[^>]*>`, "gi"), "")
    .replace(/<!--[\s\S]*?-->/g, "");

  // Rewrite every remaining tag to its bare allowlisted form. Non-allowlisted
  // tags vanish; their text content is kept.
  out = out.replace(/<\/?([a-zA-Z][a-zA-Z0-9]*)\b[^>]*>/g, (match, rawName: string) => {
    const name = rawName.toLowerCase();
    if (!ALLOWED_TAGS.has(name)) return "";
    if (name === "br") return "<br />";
    return match.startsWith("</") ? `</${name}>` : `<${name}>`;
  });

  return out.trim();
}

/** Plain-text preview of a description — for meta tags, cards and admin tables. */
export function richTextToPlain(html: string | null | undefined, maxChars = 200): string {
  if (!html) return "";
  const text = sanitizeRichText(html)
    .replace(/<br\s*\/?>/gi, " ")
    .replace(/<\/(p|li|h3|h4|blockquote)>/gi, " ")
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/\s+/g, " ")
    .trim();
  return text.length > maxChars ? `${text.slice(0, maxChars - 1).trimEnd()}…` : text;
}

/** True when a description has real content (not just empty markup from the editor). */
export function hasRichText(html: string | null | undefined): boolean {
  return richTextToPlain(html, 10_000).length > 0;
}
