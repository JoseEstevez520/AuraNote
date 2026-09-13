<script setup>
// Banco de pruebas de OmniSVG: modelo pequeño especializado texto -> SVG,
// vía el endpoint /api/omnisvg del dev-server (que oculta el HF_TOKEN).
// Es la validación de que un modelo pequeño y separado puede encargarse de
// los SVG, dentro de la filosofía del proyecto. Ver docs/arquitectura.md
import { ref } from 'vue'

const descripcion = ref('a friendly sun with rays, flat minimal icon')
const modelSize = ref('4B')
const svg = ref('')
const estado = ref('idle') // idle | cargando | error
const error = ref('')
const ms = ref(0)

const ejemplos = [
  'a location pin, flat icon',
  'a coffee cup, minimal line icon',
  'a mountain with snow, flat illustration',
  'a rocket launching, colorful',
  'a smiling cloud with rain',
]

async function generar() {
  estado.value = 'cargando'
  error.value = ''
  svg.value = ''
  const t = Date.now()
  try {
    const r = await fetch('/api/omnisvg', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ description: descripcion.value, modelSize: modelSize.value }),
    })
    const d = await r.json()
    if (!r.ok) throw new Error(d.error || `HTTP ${r.status}`)
    svg.value = d.svg
    ms.value = Date.now() - t
    estado.value = 'idle'
  } catch (e) {
    error.value = e.message
    estado.value = 'error'
  }
}
</script>

<template>
  <div class="mx-auto max-w-[720px] px-6 py-12">
    <h1 class="text-xl font-semibold text-ink">OmniSVG · texto → SVG</h1>
    <p class="mt-1 text-sm text-ink-muted">
      Modelo pequeño especializado (4B, Apache 2.0) vía su Space de HuggingFace. Tarda
      20-40 s en el plan gratis.
    </p>

    <div class="mt-6 flex flex-wrap gap-2">
      <button
        v-for="e in ejemplos"
        :key="e"
        class="rounded-[var(--radius-sm)] border border-rule px-2.5 py-1 text-xs text-ink-muted hover:border-accent hover:text-ink"
        @click="descripcion = e"
      >
        {{ e }}
      </button>
    </div>

    <div class="mt-4 flex gap-2">
      <input
        v-model="descripcion"
        class="flex-1 rounded-[var(--radius-sm)] border border-rule px-3 py-2 text-sm"
        placeholder="describe el SVG en inglés…"
        @keyup.enter="generar"
      />
      <select v-model="modelSize" class="rounded-[var(--radius-sm)] border border-rule px-2 text-sm">
        <option>4B</option>
        <option>8B</option>
      </select>
      <button
        class="rounded-[var(--radius-sm)] bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent-hover disabled:opacity-50"
        :disabled="estado === 'cargando'"
        @click="generar"
      >
        {{ estado === 'cargando' ? 'Generando…' : 'Generar' }}
      </button>
    </div>

    <div class="mt-8 flex min-h-[240px] items-center justify-center rounded-[var(--radius-md)] border border-rule bg-surface p-6">
      <p v-if="estado === 'cargando'" class="text-sm text-ink-faint">
        El modelo está dibujando… (ZeroGPU, puede haber cola)
      </p>
      <p v-else-if="estado === 'error'" class="text-sm text-red-600">{{ error }}</p>
      <div v-else-if="svg" class="text-center">
        <div class="mx-auto size-48 [&>svg]:size-full" v-html="svg" />
        <p class="mt-3 text-xs text-ink-faint">{{ (ms / 1000).toFixed(0) }} s · {{ svg.length }} bytes</p>
      </div>
      <p v-else class="text-sm text-ink-faint">El SVG aparecerá aquí.</p>
    </div>
  </div>
</template>
