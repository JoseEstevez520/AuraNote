// Punto de entrada del banco de pruebas de la librería de componentes (/ui-demo.html).
// No depende del editor, de openui-lang ni de ningún modelo: solo de src/ui/.
import { createApp } from 'vue'
import Demo from '@/ui/Demo.vue'
import '@/styles/main.css'

createApp(Demo).mount('#ui-demo')
