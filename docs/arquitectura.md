# Arquitectura

## Pipeline

```
                        DOCUMENTO (TipTap)
                               │
                     seleccionas un fragmento + Generar
                               │
                       router (gpt-4.1-mini)
              ┌────────────────┴────────────────┐
              ↓                                 ↓
            SECCIÓN                          ARTEFACTO
              │                                 │
       gpt-4.1 → openui-lang            gpt-4.1 → HTML autocontenido
              │                                 │
       @openuidev/vue-lang               iframe sandbox
       (render en Vue)                          │
              └────────────────┬────────────────┘
                               ↓
                    nodo insertado en el documento
                       (persiste en el JSON)
```

Un router pequeño clasifica el fragmento y decide el camino. Iconos (Lucide) y fotos
(Unsplash) se inyectan en el HTML antes de renderizar. Ver [interaccion.md](interaccion.md).

---

## Por qué TipTap

Es la decisión más importante del front, por encima del CSS.

Hacer un editor a mano con `contenteditable` es un pozo sin fondo: cada navegador se
comporta distinto, el manejo del cursor es un desastre y pegar desde Word mete basura.
TipTap va sobre **ProseMirror**, que es la base que usan Notion-likes, Substack o el NYT.

Pero además tiene dos primitivas que encajan con este proyecto de forma casi sospechosa:

### Node views

El documento no es HTML, es un **árbol JSON estructurado**:

```json
{
  "type": "doc",
  "content": [
    { "type": "paragraph",
      "content": [{ "type": "text", "text": "El viernes voy a Lisboa..." }] },

    { "type": "sectionBlock",
      "attrs": { "lang": "root = Stack([map, timeline])", "source": "..." } }
  ]
}
```

`sectionBlock` es un nodo inventado por nosotros que renderiza con un componente Vue.
Y como es un nodo del árbol, **se guarda con el documento gratis**. El requisito de
"el artefacto sigue ahí mañana" sale resuelto sin escribir nada.

### Decorations

Marcas visuales que se pintan *encima* del texto sin modificar el documento. Las
sugerencias ambiente las usan: el chip que aparece al cerrar un párrafo es una decoración,
así que el texto guardado queda limpio. Ver [interaccion.md](interaccion.md).

### Vue

TipTap nació como librería de Vue (v1 era Vue-only, se volvió agnóstica en v2), así que
`@tiptap/vue-3` no es un puerto de segunda. El renderer de `openui-lang` también tiene
versión Vue.

---

## El router

Un solo gesto **Generar**. Un modelo pequeño (`gpt-4.1-mini`, en `src/generate/router.js`)
clasifica el fragmento y decide el camino, sin reglas rígidas:

- **VER** (mostrar u organizar: un lugar, fechas, una comparación, una explicación) →
  **sección**.
- **HACER / VISUAL A MEDIDA** (simular, manipular, un quiz, un diagrama propio) →
  **artefacto**.

Ante la duda, sección. Es la tesis del proyecto: el modelo pequeño clasifica, el grande
solo genera cuando hace falta.

---

## La sección

Genera `openui-lang` con **gpt-4.1** y el prompt de `library.prompt()`, que sale de las
firmas de la librería (`src/ui/library.js`). Lo renderiza `@openuidev/vue-lang` contra
esos mismos componentes Vue.

**El modelo compone, no elige.** El valor está en decidir que *este* párrafo merece un
mapa grande arriba, un timeline al lado y una lista debajo; y que el siguiente merece otra
cosa. Por eso la unidad es **fragmento → sección compuesta**, no **entidad → widget**.

Paquetes: `@openuidev/lang-core` (parser, validación, generación del prompt) y
`@openuidev/vue-lang` (`<Renderer>`, `defineComponent`, `createLibrary`).

---

## El artefacto

- **Disparo:** el mismo gesto, cuando el router elige este camino.
- **Contexto:** el fragmento manda; el resto de la nota va como contexto de fondo.
- **Salida:** un único HTML autocontenido con **gpt-4.1**. Iconos (Lucide) y fotos
  (Unsplash) se inyectan antes de renderizar.
- **Render:** `<iframe sandbox>`. Aislamiento obligatorio, es código generado. El sandbox
  bloquea fetch/JS de red pero permite `<img>`, por eso las fotos cargan.
- **Anclaje:** el bloque se inserta bajo el párrafo donde acaba la selección, así
  "regenerar" está bien definido.

El artefacto es un **widget** para incrustar, no una página: se reserva a lo interactivo o
al visual a medida que la sección no puede dar.

---

## Sin backend

No hay servidor. Las claves viven en `.env` para desarrollo y el navegador las usa
directamente. Un backend real (para esconder las claves) queda para si esto dejara de ser
una exploración; hoy no hace falta.
