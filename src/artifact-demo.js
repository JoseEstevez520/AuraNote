// Banco de pruebas aislado para desarrollar src/artifact/ sin depender del
// resto de la app. Sirve /artifact-demo.html en dev.
import { createApp } from 'vue'
import ArtifactDemoApp from './ArtifactDemoApp.vue'
import './styles/main.css'

createApp(ArtifactDemoApp).mount('#app')
