// Autoguardado del documento en localStorage con debounce.
// Recargar la página no debe perder nada de lo escrito.
import { ref } from 'vue'

const STORAGE_KEY = 'auranote.document'
const DEBOUNCE_MS = 700

/**
 * @param {import('@tiptap/vue-3').Editor} getEditor - función que devuelve la instancia del editor
 */
export function useAutosave() {
  // 'idle' | 'saving' | 'saved'
  const status = ref('idle')
  let timeoutId = null
  let fadeTimeoutId = null

  function loadDocument() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      return raw ? JSON.parse(raw) : null
    } catch (e) {
      console.warn('No se pudo leer el documento guardado', e)
      return null
    }
  }

  function scheduleSave(json) {
    if (timeoutId) clearTimeout(timeoutId)
    timeoutId = setTimeout(() => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(json))
        status.value = 'saved'
        if (fadeTimeoutId) clearTimeout(fadeTimeoutId)
        fadeTimeoutId = setTimeout(() => {
          status.value = 'idle'
        }, 1500)
      } catch (e) {
        console.warn('No se pudo guardar el documento', e)
      }
    }, DEBOUNCE_MS)
  }

  return { status, loadDocument, scheduleSave }
}
