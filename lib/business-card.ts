import QRCode from "qrcode"

export interface BusinessCardOptions {
  title: string
  subtitle: string
  imageUrl?: string
  url: string
}

const WIDTH = 600
const HEIGHT = 800

/**
 * Les photos de produits scrapes sont hebergees sur le site fournisseur
 * d'origine, qui n'envoie generalement pas d'en-tetes CORS : le canvas ne
 * peut alors pas la charger et la carte affiche un bandeau de secours.
 * On passe ces URLs externes par notre proxy (meme origine, donc pas de
 * probleme CORS) ; les URLs deja relatives (notre propre stockage) sont
 * laissees telles quelles.
 */
function toCanvasSafeUrl(src: string): string {
  if (!src.startsWith("http")) return src
  try {
    if (new URL(src).origin === window.location.origin) return src
  } catch {
    return src
  }
  return `/api/image-proxy?url=${encodeURIComponent(src)}`
}

function loadImage(src: string): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    const img = new Image()
    img.crossOrigin = "anonymous"
    img.onload = () => resolve(img)
    // L'image peut être externe et sans en-têtes CORS (ex: photo d'un
    // vendeur hébergée ailleurs) : dans ce cas on continue sans elle
    // plutôt que de faire échouer toute la carte.
    img.onerror = () => resolve(null)
    img.src = src
  })
}

/**
 * Dessine une carte de visite (photo + titre + prix + QR code vers `url`)
 * dans le canvas fourni. Le canvas doit déjà avoir width=600 height=800.
 */
export async function drawBusinessCard(canvas: HTMLCanvasElement, options: BusinessCardOptions) {
  const ctx = canvas.getContext("2d")
  if (!ctx) return

  canvas.width = WIDTH
  canvas.height = HEIGHT

  // Fond
  ctx.fillStyle = "#faf8f5"
  ctx.fillRect(0, 0, WIDTH, HEIGHT)
  ctx.strokeStyle = "#e2ddd6"
  ctx.lineWidth = 2
  ctx.strokeRect(1, 1, WIDTH - 2, HEIGHT - 2)

  // Photo (ou bandeau de couleur si indisponible)
  const photoHeight = 340
  if (options.imageUrl) {
    const img = await loadImage(toCanvasSafeUrl(options.imageUrl))
    if (img) {
      const scale = Math.max(WIDTH / img.width, photoHeight / img.height)
      const sw = WIDTH / scale
      const sh = photoHeight / scale
      const sx = (img.width - sw) / 2
      const sy = (img.height - sh) / 2
      ctx.drawImage(img, sx, sy, sw, sh, 0, 0, WIDTH, photoHeight)
    } else {
      ctx.fillStyle = "#e8622c"
      ctx.fillRect(0, 0, WIDTH, photoHeight)
    }
  } else {
    ctx.fillStyle = "#e8622c"
    ctx.fillRect(0, 0, WIDTH, photoHeight)
  }

  // Titre
  ctx.fillStyle = "#1a1a1a"
  ctx.font = "bold 28px Arial, sans-serif"
  const titleBottomY = wrapText(ctx, options.title, 32, photoHeight + 55, WIDTH - 64, 34, 2)

  // Sous-titre (prix ou info vendeur) : positionne sous le titre quel que
  // soit son nombre de lignes, pour ne jamais chevaucher un titre long.
  ctx.fillStyle = "#e8622c"
  ctx.font = "bold 24px Arial, sans-serif"
  ctx.fillText(options.subtitle, 32, titleBottomY + 55)

  // QR code
  const qrDataUrl = await QRCode.toDataURL(options.url, {
    width: 220,
    margin: 1,
    color: { dark: "#1a1a1a", light: "#faf8f5" },
  })
  const qrImg = await loadImage(qrDataUrl)
  const qrSize = 200
  const qrX = (WIDTH - qrSize) / 2
  const qrY = HEIGHT - qrSize - 90
  if (qrImg) {
    ctx.drawImage(qrImg, qrX, qrY, qrSize, qrSize)
  }

  ctx.fillStyle = "#6b6b6b"
  ctx.font = "16px Arial, sans-serif"
  ctx.textAlign = "center"
  ctx.fillText("Scannez pour voir sur LeMarché", WIDTH / 2, qrY + qrSize + 30)
  ctx.textAlign = "left"

  ctx.fillStyle = "#1a1a1a"
  ctx.font = "bold 18px Arial, sans-serif"
  ctx.textAlign = "center"
  ctx.fillText("LeMarché", WIDTH / 2, HEIGHT - 30)
  ctx.textAlign = "left"
}

/**
 * Retourne le y de la derniere ligne dessinee, pour permettre de
 * positionner le contenu suivant sous le texte quel que soit le nombre
 * de lignes reellement utilisees.
 */
function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
  maxLines = 2,
): number {
  const words = text.split(" ")
  const lines: string[] = []
  let line = ""

  for (const word of words) {
    const testLine = line ? `${line} ${word}` : word
    if (ctx.measureText(testLine).width > maxWidth && line) {
      lines.push(line)
      line = word
    } else {
      line = testLine
    }
  }
  lines.push(line)

  const visibleLines = lines.slice(0, maxLines)
  const truncated = lines.length > maxLines

  visibleLines.forEach((l, i) => {
    const isLast = i === visibleLines.length - 1
    ctx.fillText(isLast && truncated ? `${l}…` : l, x, y + i * lineHeight)
  })

  return y + (visibleLines.length - 1) * lineHeight
}

export function canvasToFile(canvas: HTMLCanvasElement, filename: string): Promise<File> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error("Impossible de générer l'image"))
        return
      }
      resolve(new File([blob], filename, { type: "image/png" }))
    }, "image/png")
  })
}
