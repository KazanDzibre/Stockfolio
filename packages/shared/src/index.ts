/**
 * Formats a number as a localized currency string.
 * Example: formatPrice(1234.5, 'USD') -> "$1,234.50"
 *
 * Uses the built-in Intl API, so no dependency is needed.
 * Throws a RangeError if `currency` isn't a valid ISO 4217 code (e.g. "USD", "EUR").
 */
export function formatPrice(
  value: number,
  currency: string,
  locale = "en-US",
): string {
  return new Intl.NumberFormat(locale, { style: "currency", currency }).format(
    value,
  );
}
