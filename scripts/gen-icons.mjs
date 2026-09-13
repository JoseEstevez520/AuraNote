// Genera src/artifact/icons.js con un set curado de iconos Lucide (ISC),
// para incrustarlos en los artefactos (que van en iframe sin red).
// Ejecutar: node scripts/gen-icons.mjs
import { readFileSync, writeFileSync, existsSync } from 'fs'
const DIR = 'node_modules/lucide-static/icons'
const NOMBRES = [
  'map-pin','map','navigation','compass','plane','train-front','bus','car','ship','bike','footprints','globe','mountain','tent','luggage','hotel','landmark','trees','waves','sun','sunrise','sunset','cloud','cloud-rain','umbrella','snowflake','wind','thermometer',
  'clock','calendar','calendar-days','timer','hourglass','alarm-clock','history',
  'coffee','utensils','utensils-crossed','pizza','wine','beer','cake','apple','croissant','fish','soup','ice-cream-cone',
  'wallet','credit-card','banknote','coins','piggy-bank','receipt','trending-up','trending-down','percent','tag',
  'user','users','user-plus','mail','message-circle','phone','bell','share-2','heart','star','thumbs-up','handshake',
  'code','terminal','database','server','git-branch','github','cpu','laptop','smartphone','wifi','folder','file-text','file-code','settings','wrench','package','box','layers','component','workflow','network','bug','shield','key','lock',
  'check','check-check','x','plus','minus','chevron-right','chevron-down','arrow-right','arrow-up-right','external-link','search','filter','download','upload','copy','trash-2','pencil','eye','info','circle-help','triangle-alert','circle-alert','list','list-checks','list-todo','grid-2x2','table','flag','bookmark','pin','sparkles','zap','target','rocket','lightbulb','brain','book-open','graduation-cap','trophy','gift','camera','image','music','video','play','pause',
  'leaf','flower','droplet','flame','atom','flask-conical','microscope','dna','recycle','battery','plug','activity','heart-pulse','pill',
]
const mapa = {}; let ok = 0; const faltan = []
for (const n of [...new Set(NOMBRES)]) {
  const f = `${DIR}/${n}.svg`
  if (!existsSync(f)) { faltan.push(n); continue }
  const svg = readFileSync(f, 'utf8').replace(/<!--[\s\S]*?-->/g, '')
  const inner = svg.match(/<svg[^>]*>([\s\S]*?)<\/svg>/i)
  if (!inner) { faltan.push(n); continue }
  mapa[n] = inner[1].trim().replace(/\s+/g, ' '); ok++
}
const salida = `// GENERADO por scripts/gen-icons.mjs — no editar a mano.
// Set curado de iconos Lucide (ISC, v1.45), inner normalizado a 24x24.
export const ICON_INNER = ${JSON.stringify(mapa)}
export const ICON_NAMES = ${JSON.stringify(Object.keys(mapa))}
export function iconSvg(nombre, size = 20, stroke = 1.75) {
  const inner = ICON_INNER[nombre]
  if (!inner) return ''
  return '<svg xmlns="http://www.w3.org/2000/svg" width="'+size+'" height="'+size+'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="'+stroke+'" stroke-linecap="round" stroke-linejoin="round">'+inner+'</svg>'
}
`
writeFileSync('src/artifact/icons.js', salida)
console.log(`icons.js: ${ok} iconos${faltan.length ? ', faltan: ' + faltan.join(',') : ''}`)
