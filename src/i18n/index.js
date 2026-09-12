// i18n mínimo. Con ~40 cadenas, vue-i18n sería más peso que valor; esto es
// una función y un ref. Si el proyecto crece, se cambia sin tocar las vistas.
//
// El idioma NO va en .env: .env es de tiempo de compilación y esto es de
// tiempo de ejecución. Orden de resolución:
//   1. lo que el usuario eligió (localStorage)
//   2. el idioma del navegador
//   3. inglés
import { ref, computed } from 'vue'
import en from './en.js'
import es from './es.js'

const DICCIONARIOS = { en, es }
export const IDIOMAS = [
  { id: 'en', etiqueta: 'English' },
  { id: 'es', etiqueta: 'Español' },
]

const CLAVE = 'auranote.locale'
const POR_DEFECTO = 'en'

function detectar() {
  const guardado = localStorage.getItem(CLAVE)
  if (guardado && DICCIONARIOS[guardado]) return guardado

  const navegador = (navigator.language || '').slice(0, 2).toLowerCase()
  return DICCIONARIOS[navegador] ? navegador : POR_DEFECTO
}

export const idioma = ref(detectar())

export function setIdioma(id) {
  if (!DICCIONARIOS[id]) return
  idioma.value = id
  localStorage.setItem(CLAVE, id)
  document.documentElement.lang = id
}

document.documentElement.lang = idioma.value

/**
 * Traduce una ruta con puntos: t('menu.section').
 * Si falta la clave devuelve la propia ruta, para que el hueco se vea.
 */
export function t(ruta) {
  const buscar = (dic) => ruta.split('.').reduce((o, k) => o?.[k], dic)
  return buscar(DICCIONARIOS[idioma.value]) ?? buscar(en) ?? ruta
}

export function useI18n() {
  return { t: (ruta) => (idioma.value, t(ruta)), idioma, setIdioma }
}

export const textos = computed(() => DICCIONARIOS[idioma.value] ?? en)
