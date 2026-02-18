/**
 * Previsualiza el HTML como lo vería un navegador headless al convertir a PDF.
 * Viewport horizontal (landscape): 1122×794 px ≈ A4 horizontal (297mm × 210mm).
 * Área útil con márgenes 10mm: 277mm × 190mm → 1046 × 718 px.
 *
 * Uso:
 *   1. Ejecuta el servidor: npm run dev
 *   2. En otra terminal: node scripts/preview-pdf-view.mjs
 *
 * Para guardar PDF o PNG:
 *   node scripts/preview-pdf-view.mjs --pdf   → guarda preview.pdf
 *   node scripts/preview-pdf-view.mjs --png   → guarda preview.png
 */

import puppeteer from 'puppeteer'

const BASE_URL = process.env.PREVIEW_BASE_URL || 'http://localhost:5173'
const HTML_PATH = '/formato-permiso-trabajo-alturas.html'
// A4 horizontal (landscape): 297mm × 210mm → 1122 × 794 px @ 96dpi
const VIEWPORT = { width: 1122, height: 794 }

const savePdf = process.argv.includes('--pdf')
const savePng = process.argv.includes('--png')

const browser = await puppeteer.launch({
  headless: savePdf || savePng ? 'new' : false,
  args: ['--no-sandbox'],
})

const page = await browser.newPage()
await page.setViewport(VIEWPORT)
await page.goto(`${BASE_URL}${HTML_PATH}`, { waitUntil: 'networkidle0', timeout: 15000 })

if (savePdf) {
  await page.pdf({
    path: 'preview.pdf',
    format: 'A4',
    landscape: true,
    margin: { top: '10mm', right: '10mm', bottom: '10mm', left: '10mm' },
    printBackground: true,
  })
  console.log('Guardado: preview.pdf')
}
if (savePng) {
  await page.screenshot({ path: 'preview.png', fullPage: true })
  console.log('Guardado: preview.png')
}

if (!savePdf && !savePng) {
  console.log('Vista con viewport horizontal', VIEWPORT.width + '×' + VIEWPORT.height, 'px (A4 landscape). Cierra la ventana del navegador para terminar.')
  await new Promise(() => {}) // no cerrar el browser para que puedan ver
} else {
  await browser.close()
}
