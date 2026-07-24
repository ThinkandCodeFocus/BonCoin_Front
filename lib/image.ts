/**
 * Convertit un fichier HEIC/HEIF (format par défaut des photos iPhone) en JPEG
 * côté navigateur. Les navigateurs et la plupart des serveurs ne savent pas
 * afficher/valider le HEIC — sans cette conversion, l'upload échoue (backend)
 * et l'aperçu reste vide (frontend), silencieusement.
 *
 * Retourne le fichier tel quel s'il n'est pas HEIC/HEIF.
 */
export async function convertHeicIfNeeded(file: File): Promise<File> {
  const isHeic =
    file.type === "image/heic" ||
    file.type === "image/heif" ||
    /\.(heic|heif)$/i.test(file.name)

  if (!isHeic) return file

  const heic2any = (await import("heic2any")).default
  const result = await heic2any({ blob: file, toType: "image/jpeg", quality: 0.9 })
  const blob = Array.isArray(result) ? result[0] : result
  const newName = file.name.replace(/\.(heic|heif)$/i, ".jpg")

  return new File([blob], newName, { type: "image/jpeg" })
}
