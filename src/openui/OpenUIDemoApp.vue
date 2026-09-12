<script setup>
// Banco de pruebas aislado del renderer de openui-lang.
// Un textarea a la izquierda para escribir openui-lang a mano, y el
// resultado renderizado en vivo a la derecha. Ver docs/desarrollo.md.
//
// Intenta usar la librería real de src/ui/registry.js (otro agente la está
// construyendo en paralelo); si no existe todavía, cae a los stubs propios
// de demo-stubs.js. Así este banco de pruebas nunca depende de que el otro
// trabajo esté terminado.
import { ref, shallowRef, onMounted } from 'vue'
import Renderer from './Renderer.vue'
import { stubRegistry } from './demo-stubs.js'

const registry = shallowRef(stubRegistry)
const registrySource = ref('stub (src/ui/registry.js no disponible todavía)')

// import.meta.glob no falla en build ni en dev si el archivo no existe
// todavía (a diferencia de un import() literal, que rompería `npm run
// build` mientras src/ui/registry.js no exista). Así este banco de pruebas
// no depende de que el otro agente haya terminado su parte.
const registryModules = import.meta.glob('../ui/registry.js')

onMounted(async () => {
  try {
    const loader = registryModules['../ui/registry.js']
    if (!loader) return // todavía no existe: nos quedamos con los stubs
    const mod = await loader()
    const real = mod.default ?? mod.registry ?? mod
    if (real && typeof real === 'object' && Object.keys(real).length > 0) {
      // Se completa con stubs los componentes que la librería real no tenga
      // todavía, para no perder cobertura de golpe.
      registry.value = { ...stubRegistry, ...real }
      registrySource.value = 'src/ui/registry.js'
    }
  } catch (err) {
    // Falla al cargar: nos quedamos con los stubs. No es un error del
    // renderer, así que no se muestra como tal.
  }
})

const EJEMPLOS = {
  lisboa: `map      = Map(place: "Lisboa", zoom: 12)
timeline = Timeline(items: [
             { label: "Jueves",    description: "Llegada" },
             { label: "Viernes",   description: "Explorar la ciudad" },
             { label: "JunctionX", description: "Evento" }
           ])
sugs     = List(items: [
             { label: "Paseo en barco por el Tajo" },
             { label: "Playa de Carcavelos" }
           ])
root     = Stack([map, timeline, sugs])`,

  comparativa: `tabla = Table(
  columns: ["Framework", "Lenguaje", "Arranque en frío"],
  rows: [
    ["Spring Boot", "Java", "~2-4 s"],
    ["FastAPI", "Python", "~200 ms"]
  ]
)
nota = Text(content: "FastAPI gana en arranque; Spring Boot en ecosistema.", variant: "muted")
root = Stack([tabla, nota])`,

  dato: `visitas = Stat(label: "Visitas hoy", value: 1284, unit: "")
fila    = Row([visitas, visitas])
root    = Section(title: "Resumen", children: fila)`,

  // --- ejemplos rotos a propósito, para ver el manejo de errores ---

  sinIgual: `map Map(place: "Lisboa")
root = Stack([map])`,

  componenteDesconocido: `raro = Globo(color: "rojo")
root = Stack([raro])`,

  referenciaNoDefinida: `root = Stack([fantasma])`,

  huerfano: `map  = Map(place: "Oporto")
otro = Text(content: "Este id nunca se usa")
root = Stack([map])`,

  sinRoot: `map = Map(place: "Oporto")
lista = List(items: [{ label: "Solo esto" }])`,

  sintaxisRota: `root = Stack([
  Map(place: "Lisboa"
])`,
}

const lang = ref(EJEMPLOS.lisboa)

function cargar(nombre) {
  lang.value = EJEMPLOS[nombre]
}
</script>

<template>
  <div class="demo">
    <header class="demo__header">
      <h1>openui-demo</h1>
      <p>Banco de pruebas de <code>src/openui/</code> — escribe openui-lang a mano.</p>
      <p class="demo__registry">Registro de componentes activo: <strong>{{ registrySource }}</strong></p>
      <div class="demo__buttons">
        <button @click="cargar('lisboa')">Lisboa (ok)</button>
        <button @click="cargar('comparativa')">Comparativa (ok)</button>
        <button @click="cargar('dato')">Dato suelto (ok)</button>
        <button class="is-broken" @click="cargar('sinIgual')">Falta "=" (roto)</button>
        <button class="is-broken" @click="cargar('componenteDesconocido')">Componente desconocido (roto)</button>
        <button class="is-broken" @click="cargar('referenciaNoDefinida')">Referencia no definida (roto)</button>
        <button class="is-broken" @click="cargar('huerfano')">Id huérfano (roto)</button>
        <button class="is-broken" @click="cargar('sinRoot')">Sin root (roto)</button>
        <button class="is-broken" @click="cargar('sintaxisRota')">Sintaxis rota (roto)</button>
      </div>
    </header>

    <main class="demo__panels">
      <section class="demo__panel">
        <h2>openui-lang</h2>
        <textarea v-model="lang" spellcheck="false"></textarea>
      </section>
      <section class="demo__panel">
        <h2>Renderizado</h2>
        <div class="demo__output">
          <Renderer :lang="lang" :registry="registry" />
        </div>
      </section>
    </main>
  </div>
</template>

<style scoped>
.demo {
  font-family: system-ui, sans-serif;
  max-width: 1200px;
  margin: 0 auto;
  padding: 1.5rem;
  color: #1a1a1a;
}

.demo__header h1 {
  margin: 0 0 0.25rem;
  font-size: 1.25rem;
}

.demo__header p {
  margin: 0.15rem 0;
  color: #555;
  font-size: 0.85rem;
}

.demo__registry strong {
  color: #1a1a1a;
}

.demo__buttons {
  margin-top: 0.75rem;
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
}

.demo__buttons button {
  border: 1px solid #ccc;
  background: #fafafa;
  border-radius: 6px;
  padding: 0.35rem 0.6rem;
  font-size: 0.78rem;
  cursor: pointer;
}

.demo__buttons button:hover {
  background: #f0f0f0;
}

.demo__buttons button.is-broken {
  border-color: #c2410c;
  color: #9a3412;
}

.demo__panels {
  margin-top: 1.5rem;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.demo__panel h2 {
  font-size: 0.85rem;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: #777;
  margin: 0 0 0.4rem;
}

.demo__panel textarea {
  width: 100%;
  height: 60vh;
  font-family: ui-monospace, monospace;
  font-size: 0.8rem;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  resize: vertical;
  box-sizing: border-box;
}

.demo__output {
  border: 1px solid #eee;
  border-radius: 8px;
  padding: 1rem;
  min-height: 60vh;
  overflow: auto;
}

@media (max-width: 900px) {
  .demo__panels {
    grid-template-columns: 1fr;
  }
}
</style>

<style>
/* Estilos globales para los stubs (creados vía render function, fuera del
   scope de este SFC). */
.oui-stub {
  border: 1px solid #ddd;
  border-radius: 6px;
  padding: 0.5rem 0.65rem;
  margin: 0.35rem 0;
  background: #fcfcfc;
}

.oui-stub__head {
  font-weight: 600;
  font-size: 0.8rem;
  color: #1d4ed8;
}

.oui-stub__props {
  margin: 0.2rem 0 0;
  font-size: 0.7rem;
  color: #555;
  white-space: pre-wrap;
}

.oui-stub__children {
  margin-top: 0.4rem;
  padding-left: 0.6rem;
  border-left: 2px solid #eee;
}
</style>
