<script setup>
// Renderer de openui-lang: recibe el texto en el formato del modelo OUI-1 y
// un registro de componentes Vue, y monta el árbol resultante con <component :is>.
//
// Nunca debe romper la pantalla: si el parseo falla del todo se muestra un
// estado de error legible, y si un nodo concreto usa un componente que no
// está en el registro se avisa in situ sin tirar el resto del árbol abajo.
import { computed } from 'vue'
import { parseOpenUI, buildTree } from './parser.js'
import OpenUINode from './OpenUINode.js'

const props = defineProps({
  lang: { type: String, default: '' },
  registry: { type: Object, default: () => ({}) },
})

const parsed = computed(() => {
  try {
    return parseOpenUI(props.lang)
  } catch (err) {
    // Salvaguarda: parseOpenUI ya es tolerante línea a línea, pero si algo
    // se escapa (bug del propio parser) no queremos pantalla en blanco.
    return { nodes: {}, errors: [{ message: `error interno del parser: ${err.message}`, line: null, raw: '' }], rootId: null }
  }
})

const tree = computed(() => {
  try {
    return buildTree(parsed.value)
  } catch (err) {
    return null
  }
})

const hasFatalError = computed(() => !tree.value)
</script>

<template>
  <div class="openui-renderer">
    <!-- Avisos de parseo: no bloquean el render de lo que sí se pudo construir -->
    <div v-if="parsed.errors.length" class="openui-errors">
      <div class="openui-errors__title">
        {{ parsed.errors.length }} problema(s) al interpretar openui-lang
      </div>
      <ul>
        <li v-for="(err, idx) in parsed.errors" :key="idx">
          <span v-if="err.line !== null">línea {{ err.line }}: </span>{{ err.message }}
        </li>
      </ul>
    </div>

    <!-- Estado de error total: no hay root válido -->
    <div v-if="hasFatalError" class="openui-fatal">
      No se ha podido construir ninguna interfaz a partir de este texto.
    </div>

    <!-- Árbol renderizado -->
    <OpenUINode v-else :node="tree" :registry="registry" />
  </div>
</template>

<style scoped>
.openui-renderer {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.openui-errors {
  border-left: 2px solid #b45309;
  padding: 0.5rem 0.75rem;
  font-size: 0.8rem;
  color: #6b6b6b;
  background: rgba(180, 83, 9, 0.06);
}

.openui-errors__title {
  font-weight: 600;
  margin-bottom: 0.25rem;
}

.openui-errors ul {
  margin: 0;
  padding-left: 1.1rem;
}

.openui-fatal {
  padding: 1rem;
  font-size: 0.9rem;
  color: #6b6b6b;
  border: 1px dashed #ddd;
  text-align: center;
}
</style>

<style>
/* Sin scope: estos nodos los crea OpenUINode.js vía render function, fuera
   del árbol de plantilla de este SFC, así que el scoping de arriba no los
   alcanzaría. */
.openui-missing {
  padding: 0.5rem 0.75rem;
  border: 1px dashed #c2410c;
  font-size: 0.8rem;
  color: #9a3412;
  background: rgba(194, 65, 12, 0.06);
  border-radius: 4px;
}

.openui-missing__label {
  font-weight: 600;
}

.openui-missing__props {
  margin: 0.25rem 0 0;
  white-space: pre-wrap;
  font-size: 0.7rem;
  opacity: 0.8;
}
</style>

