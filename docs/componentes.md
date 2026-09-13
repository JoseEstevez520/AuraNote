# Librería de componentes

> El vocabulario del documento. OUI-1 solo puede componer con estas piezas, así que
> **todo lo que genere se ve bien**. Esa es la ventaja que no tiene el código libre.

## Principio de diseño

Si OUI-1 **compone** en vez de elegir, las piezas tienen que ser **componibles**:
apilarse, ponerse en fila, anidarse. No son seis widgets terminados — son primitivas
más contenedores de layout.

El propio ejemplo de la documentación de `openui-lang` lo confirma:

```
root = Stack([chart])
```

**Los argumentos son posicionales**, en el orden del esquema. No admite nombres:

```
Map("Lisboa", 12)          ✅
Map(place: "Lisboa")       ❌  rompe en silencio
```

El modelo ya piensa en contenedores envolviendo contenido. Una librería de widgets
cerrados iría en contra del grano del formato.

Con ~11 piezas el espacio de composiciones posibles es enorme.

---

## Layout

| Componente | Props                        | Notas                              |
| ---------- | ---------------------------- | ---------------------------------- |
| `Stack`    | `children`, `gap`            | Vertical. El contenedor por defecto |
| `Row`      | `children`, `gap`, `align`   | Horizontal                         |
| `Grid`     | `children`, `cols`, `gap`    | Rejilla                            |
| `Section`  | `children`, `title`          | Agrupación con encabezado opcional |

## Contenido

| Componente | Props                                        | Notas                          |
| ---------- | -------------------------------------------- | ------------------------------ |
| `Map`      | `place`, `zoom`, `markers[]`                 | Leaflet + OpenStreetMap        |
| `Timeline` | `items[] { label, date, description }`       | Secuencia temporal             |
| `Table`    | `columns[]`, `rows[][]`                      | Comparativas                   |
| `Card`     | `title`, `body`, `meta`                      | Ficha                          |
| `List`     | `items[] { label, description, href }`       | Sugerencias, opciones          |
| `Stat`     | `label`, `value`, `unit`                     | Dato suelto destacado          |
| `Text`     | `content`, `variant`                         | Prosa dentro de la composición |

---

## Reglas visuales

No negociables, porque son las que hacen que lo generado se sienta **parte del
documento** y no un widget pegado encima. Fue la crítica principal al primer mockup.

- **Todo dentro de la columna de 972px.** Nada a ancho completo, por ahora.
- **Sin bordes, sin sombras, sin cards.** Se separa con espacio, no con cajas.
- Misma tipografía y misma escala que el texto del documento.
- Azul de acento muy contenido, y solo donde hay interacción.
- Los controles (borrar, regenerar) aparecen en hover y desaparecen.

## Ejemplo

Para el párrafo del viaje a Lisboa:

```
map      = Map(place: "Lisboa", zoom: 12)
timeline = Timeline(items: [
             { label: "Jueves",    description: "Llegada" },
             { label: "Viernes",   description: "Explorar la ciudad" },
             { label: "JunctionX", description: "Evento" }
           ])
sugs     = List(items: [
             { label: "Paseo en barco por el Tajo" },
             { label: "Playa de Carcavelos" }
           ])
root     = Stack([map, timeline, sugs])
```

---

## Cómo construirla

**Antes que los modelos.** Se escribe `openui-lang` a mano y se verifica que renderiza
bien (fase 4 del roadmap).

Esto separa *"¿mi renderer funciona?"* de *"¿el modelo genera bien?"*. Si se juntan y
algo falla, no hay forma de saber cuál de los dos es.

## Cómo se la damos a OUI-1

En `src/ui/library.js`. Cada pieza se declara con `defineComponent` — nombre, esquema
**Zod** y **descripción** — y de ahí sale el system prompt automáticamente:

```js
const StackDef = defineComponent({
  name: 'Stack',
  description: 'Apila componentes en vertical...',
  props: z.object({ children: hijos, gap: z.enum(['sm','md','lg']).optional() }),
  component: adaptar(Stack, true),
})

export const library = createLibrary({ components: [...], root: 'Stack' })
const prompt = library.prompt({ preamble: 'Eres AuraNote.' })
```

**Las descripciones importan**: son lo que lee el modelo para decidir cuándo usar cada
pieza. Escribirlas bien es parte del trabajo de diseño, no un comentario.

El adaptador existe porque los componentes de `src/ui/` reciben props normales de Vue,
mientras que `openui-lang` los invoca con `{ props, renderNode }`.

## Pendiente

- [ ] Afinar las descripciones viendo qué compone el modelo de verdad
- [ ] Revisar si `Row` debería envolver en lugar de desbordar con piezas anchas
