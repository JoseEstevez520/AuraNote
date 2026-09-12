// La librería en el formato de OpenUI Lang.
//
// Esto es el vocabulario del documento: OUI-1 solo puede componer con lo que
// se declara aquí. Cada componente lleva un esquema Zod y una descripción, y
// de ahí sale automáticamente el system prompt (`library.prompt()`) en el
// formato exacto con el que el modelo fue entrenado. Por eso usamos los
// paquetes oficiales en vez de nuestro parser: el prompt no se puede adivinar.
//
// Ver docs/componentes.md y docs/decisiones.md
import { defineComponent, createLibrary } from '@openuidev/vue-lang'
import { z } from 'zod'
import { h } from 'vue'

import Stack from './Stack.vue'
import Row from './Row.vue'
import Grid from './Grid.vue'
import Section from './Section.vue'
import Mapa from './Map.vue'
import Timeline from './Timeline.vue'
import Table from './Table.vue'
import Card from './Card.vue'
import List from './List.vue'
import Stat from './Stat.vue'
import Texto from './Text.vue'

// Los componentes de src/ui/ reciben props normales de Vue, pero openui-lang
// los invoca con { props, renderNode }. Este adaptador traduce entre ambos.
// `conHijos` indica que la prop `children` son nodos a renderizar en el slot.
function adaptar(Componente, conHijos = false) {
  return {
    props: {
      props: { type: Object, required: true },
      renderNode: { type: Function, required: true },
    },
    setup(p) {
      return () => {
        const { children: hijos, ...resto } = p.props ?? {}
        if (!conHijos) return h(Componente, resto)
        return h(Componente, resto, { default: () => p.renderNode(hijos) })
      }
    },
  }
}

// Referencia a cualquier nodo hijo. El parser resuelve los identificadores.
const hijos = z.array(z.any()).describe('Componentes anidados dentro de este')

/* ----------------------------- Layout ----------------------------- */

const StackDef = defineComponent({
  name: 'Stack',
  description:
    'Apila componentes en vertical con separación uniforme. Es el contenedor por defecto y normalmente la raíz.',
  props: z.object({
    children: hijos,
    gap: z.enum(['sm', 'md', 'lg']).optional().describe('Separación vertical'),
  }),
  component: adaptar(Stack, true),
})

const RowDef = defineComponent({
  name: 'Row',
  description:
    'Coloca componentes en horizontal, uno al lado del otro. Úsalo cuando dos piezas se leen mejor juntas, por ejemplo un mapa y una línea temporal.',
  props: z.object({
    children: hijos,
    gap: z.enum(['sm', 'md', 'lg']).optional().describe('Separación horizontal'),
    align: z.enum(['start', 'center', 'end', 'stretch']).optional(),
  }),
  component: adaptar(Row, true),
})

const GridDef = defineComponent({
  name: 'Grid',
  description: 'Rejilla de componentes en varias columnas. Útil para listas de tarjetas o datos.',
  props: z.object({
    children: hijos,
    cols: z.number().int().min(2).max(4).optional().describe('Número de columnas'),
    gap: z.enum(['sm', 'md', 'lg']).optional(),
  }),
  component: adaptar(Grid, true),
})

const SectionDef = defineComponent({
  name: 'Section',
  description: 'Agrupa componentes bajo un encabezado discreto.',
  props: z.object({
    children: hijos,
    title: z.string().optional().describe('Encabezado de la agrupación'),
  }),
  component: adaptar(Section, true),
})

/* ---------------------------- Contenido ---------------------------- */

const MapDef = defineComponent({
  name: 'Map',
  description:
    'Mapa interactivo de un lugar. Se geocodifica por nombre, así que basta con la ciudad o la dirección.',
  props: z.object({
    place: z.string().describe('Nombre del lugar, por ejemplo "Lisboa" o "Playa de Carcavelos"'),
    zoom: z.number().int().min(1).max(19).optional().describe('Nivel de zoom, 12 para una ciudad'),
    markers: z
      .array(z.object({ label: z.string(), place: z.string().optional() }))
      .optional()
      .describe('Puntos adicionales a marcar'),
  }),
  component: adaptar(Mapa),
})

const TimelineDef = defineComponent({
  name: 'Timeline',
  description:
    'Línea temporal de hitos en orden. Úsala cuando el texto menciona varias fechas o una secuencia de acontecimientos.',
  props: z.object({
    items: z
      .array(
        z.object({
          label: z.string().describe('Título del hito'),
          date: z.string().optional().describe('Fecha en texto, por ejemplo "9 oct"'),
          description: z.string().optional(),
        }),
      )
      .describe('Hitos en orden cronológico'),
  }),
  component: adaptar(Timeline),
})

const TableDef = defineComponent({
  name: 'Table',
  description:
    'Tabla comparativa. Úsala cuando el texto compara dos o más cosas según varios criterios.',
  props: z.object({
    columns: z.array(z.string()).describe('Cabeceras, la primera suele ser el criterio'),
    rows: z.array(z.array(z.string())).describe('Filas, cada una con tantas celdas como columnas'),
  }),
  component: adaptar(Table),
})

const CardDef = defineComponent({
  name: 'Card',
  description: 'Ficha de una entidad concreta: un sitio, un evento, un producto.',
  props: z.object({
    title: z.string(),
    body: z.string().optional().describe('Descripción breve'),
    meta: z.string().optional().describe('Dato secundario, por ejemplo una fecha o un precio'),
  }),
  component: adaptar(Card),
})

const ListDef = defineComponent({
  name: 'List',
  description: 'Lista de opciones o sugerencias relacionadas con el contenido.',
  props: z.object({
    items: z
      .array(
        z.object({
          label: z.string(),
          description: z.string().optional(),
          href: z.string().optional(),
        }),
      )
      .describe('Elementos de la lista'),
  }),
  component: adaptar(List),
})

const StatDef = defineComponent({
  name: 'Stat',
  description: 'Un dato suelto destacado. Combina varios dentro de un Row para formar una fila.',
  props: z.object({
    label: z.string().describe('Qué mide'),
    value: z.string().describe('El valor'),
    unit: z.string().optional(),
  }),
  component: adaptar(Stat),
})

const TextDef = defineComponent({
  name: 'Text',
  description: 'Prosa dentro de la composición, para hilar las demás piezas.',
  props: z.object({
    content: z.string(),
    variant: z.enum(['body', 'lead', 'caption']).optional(),
  }),
  component: adaptar(Texto),
})

export const library = createLibrary({
  components: [
    StackDef,
    RowDef,
    GridDef,
    SectionDef,
    MapDef,
    TimelineDef,
    TableDef,
    CardDef,
    ListDef,
    StatDef,
    TextDef,
  ],
  root: 'Stack',
})

export default library
