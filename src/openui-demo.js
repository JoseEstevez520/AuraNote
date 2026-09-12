// Banco de pruebas aislado para desarrollar src/openui/ sin depender del
// resto de la app ni de que src/ui/registry.js esté terminado.
// Sirve /openui-demo.html en dev.
import { createApp } from 'vue'
import OpenUIDemoApp from './openui/OpenUIDemoApp.vue'

createApp(OpenUIDemoApp).mount('#app')
