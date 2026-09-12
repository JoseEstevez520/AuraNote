// Banco de pruebas aislado para desarrollar src/editor/ sin depender
// del resto de la app. Sirve /editor-demo.html en dev.
import { createApp, h } from 'vue'
import { NoteEditor } from './editor/index.js'
import './styles/main.css'

const App = {
  render() {
    return h(NoteEditor, {
      onGenerateSection: (payload) => console.log('generate-section', payload),
      onGenerateArtifact: (payload) => console.log('generate-artifact', payload),
    })
  },
}

createApp(App).mount('#app')
