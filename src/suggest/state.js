// Estado del modo sugerencias, compartido entre la extensión de TipTap y la UI.
// El interruptor lo controla el usuario; arranca APAGADO (opt-in, sin ruido ni
// coste hasta que se activa). Se recuerda en localStorage.
import { ref, watch } from 'vue'

const GUARDADO = localStorage.getItem('auranote.sugerencias') === 'on'
export const sugerenciasActivas = ref(GUARDADO)

watch(sugerenciasActivas, (v) => {
  localStorage.setItem('auranote.sugerencias', v ? 'on' : 'off')
})
