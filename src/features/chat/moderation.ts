/**
 * Detects attempts to share contact details / take a deal off-platform.
 * Conservative but domain-aware — part numbers usually contain letters or
 * hyphens, so we bias phone detection toward genuine phone-shaped strings.
 */

const EMAIL = /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/i;
const OBFUSCATED_EMAIL = /\b[a-z0-9._%+-]+\s*(?:\(|\[)?\s*(?:at|@)\s*(?:\)|\])?\s*[a-z0-9.-]+\s*(?:\(|\[)?\s*(?:dot|\.)\s*(?:\)|\])?\s*[a-z]{2,}\b/i;
const URL = /(https?:\/\/|www\.)\S+/i;
const SOCIAL = /\b(whats\s?app|telegram|instagram|insta|snapchat|wechat|signal|messenger|t\.me|@[a-z0-9_.]{3,})\b/i;
const KEYWORDS = /\b(e-?mail|g\s*mail|gmail|yahoo|hotmail|outlook|icloud|call\s+me|cell(?:phone)?|my\s+(?:number|cell|mobile)|contact\s+me|phone\s+number|dm\s+me|text\s+me\b|whatsapp)\b/i;
// +27…, 0xx xxx xxxx, or an international number starting with +.
const PHONE = /(?:\+27|\b0)\s*\d{2}[\s-]?\d{3}[\s-]?\d{4}\b|\+\d{9,15}\b/;

export interface ModerationResult {
  blocked: boolean;
  reasons: string[];
}

export function moderateMessage(text: string): ModerationResult {
  const reasons: string[] = [];
  if (EMAIL.test(text) || OBFUSCATED_EMAIL.test(text)) reasons.push("email address");
  if (URL.test(text)) reasons.push("external link");
  if (SOCIAL.test(text)) reasons.push("social handle");
  if (PHONE.test(text)) reasons.push("phone number");
  if (KEYWORDS.test(text)) reasons.push("contact details");
  return { blocked: reasons.length > 0, reasons: [...new Set(reasons)] };
}

/** The placeholder shown to the other party (and stored) for a blocked message. */
export const BLOCKED_PLACEHOLDER =
  "⚠ This message was hidden because it looked like it shared contact details. To stay protected, keep all communication and payment on Motorcycle Products.";
