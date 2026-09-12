<script setup>
// Banco de pruebas del renderer OFICIAL (@openuidev/vue-lang) contra nuestra
// librería. Es la prueba de la fase 4: openui-lang escrito a mano renderiza
// con los componentes de src/ui/, sin ningún modelo de por medio.
import { ref, computed } from 'vue'
import { Renderer } from '@openuidev/vue-lang'
import { library } from '../ui/library.js'

const ejemplos = {
  Lisboa: `map      = Map("Lisboa", 12)
timeline = Timeline([
             { label: "Jueves",    date: "9 oct",  description: "Llegada" },
             { label: "Viernes",   date: "10 oct", description: "Explorar la ciudad" },
             { label: "JunctionX", date: "11 oct", description: "Evento principal" }
           ])
sugs     = List([
             { label: "Paseo en barco por el Tajo" },
             { label: "Playa de Carcavelos" }
           ])
root     = Stack([map, timeline, sugs])`,

  Comparativa: `tabla = Table(
          ["", "Spring Boot", "FastAPI"],
          [
            ["Lenguaje", "Java", "Python"],
            ["Arranque en frio", "~2.5 s", "~0.3 s"],
            ["Ecosistema", "Maduro", "En crecimiento"]
          ])
nota  = Text("Ambos sirven para APIs REST; la diferencia esta en el ecosistema.", "caption")
root  = Stack([tabla, nota])`,

  'Composicion anidada': `mapa  = Map("Lisboa", 13)
linea = Timeline([{ label: "Jueves", description: "Llegada" }, { label: "Viernes", description: "Ciudad" }])
fila  = Row([mapa, linea])
d1    = Stat("Distancia", "1450", "km")
d2    = Stat("Vuelo", "2h 35", "min")
datos = Row([d1, d2])
root  = Stack([fila, datos])`,

  'Componente inventado (roto)': `raro = Globo("rojo")
root = Stack([raro])`,
}

const lang = ref(ejemplos.Lisboa)
const errores = ref([])
const prompt = computed(() => library.prompt({ preamble: 'Eres AuraNote.' }))
const verPrompt = ref(false)
</script>

<template>
  <div class="mx-auto max-w-[1400px] px-8 py-10">
    <h1 class="text-xl font-semibold">Renderer oficial de OpenUI</h1>
    <p class="text-ink-muted text-sm">
      <code>@openuidev/vue-lang</code> renderizando <code>src/ui/library.js</code>
    </p>

    <div class="mt-4 flex flex-wrap gap-2">
      <button
        v-for="(codigo, nombre) in ejemplos"
        :key="nombre"
        class="rounded border border-rule px-3 py-1 text-sm hover:border-accent"
        @click="lang = codigo"
      >
        {{ nombre }}
      </button>
      <button
        class="rounded border border-rule px-3 py-1 text-sm hover:border-accent"
        @click="verPrompt = !verPrompt"
      >
        {{ verPrompt ? 'Ocultar' : 'Ver' }} system prompt generado
      </button>
    </div>

    <pre
      v-if="verPrompt"
      class="mt-4 max-h-96 overflow-auto rounded bg-rule/30 p-4 text-xs whitespace-pre-wrap"
      >{{ prompt }}</pre
    >

    <div class="mt-6 grid grid-cols-2 gap-8">
      <div>
        <p class="text-ink-faint mb-2 text-xs uppercase">openui-lang</p>
        <textarea
          v-model="lang"
          spellcheck="false"
          class="h-[520px] w-full rounded border border-rule p-4 font-mono text-xs"
        />
      </div>
      <div>
        <p class="text-ink-faint mb-2 text-xs uppercase">Renderizado</p>
        <div class="rounded border border-rule p-6">
          <Renderer :response="lang" :library="library" :on-error="(e) => (errores = e)" />
        </div>
        <div v-if="errores.length" class="mt-3 text-xs text-red-700">
          <p v-for="(e, i) in errores" :key="i">{{ e.code }}: {{ e.message }}</p>
        </div>
      </div>
    </div>
  </div>
</template>
