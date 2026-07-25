/**
 * Construit un lien wa.me a partir d'un numero de telephone senegalais,
 * avec ou sans indicatif +221 deja present.
 */
export function buildWhatsAppLink(phone: string, message?: string): string | null {
  const digits = phone.replace(/\D/g, "")
  if (!digits) return null

  const withCountryCode = digits.startsWith("221") ? digits : `221${digits.replace(/^0+/, "")}`

  const base = `https://wa.me/${withCountryCode}`
  return message ? `${base}?text=${encodeURIComponent(message)}` : base
}
