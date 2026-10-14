/** Contact link helpers for the business card. */

/** tel: link with spaces stripped. */
export const telHref = (phone: string) => `tel:${phone.replace(/[^\d+]/g, '')}`;

/** WhatsApp click-to-chat link (digits only, with a friendly opener). */
export function whatsappHref(number: string, businessName: string) {
  const digits = number.replace(/\D/g, '');
  const text = `Hi ${businessName}! I found you on Heapspark Life.`;
  return `https://wa.me/${digits}?text=${encodeURIComponent(text)}`;
}

/** Display a website without protocol / trailing slash. */
export const prettyUrl = (url: string) => url.replace(/^https?:\/\//, '').replace(/\/$/, '');
