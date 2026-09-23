# Interacción

## La regla

> **La interfaz cierra el hueco que abre el texto. No abre uno nuevo.**

El error más grave no es generar algo feo: es **equivocarse de modo**. Ante
*"no sé cómo organizarlo"*, devolver un formulario vacío no cierra el hueco,
convierte una pregunta en deberes.

## Los cuatro modos

| El texto | Hueco | Qué genera | Componentes |
| --- | --- | --- | --- |
| **Declara hechos**<br>*"El viernes voy a Lisboa"* | ninguno | **Espejo**, renderiza lo dicho | `Map`, `Timeline` |
| **Compara**<br>*"Spring Boot y FastAPI"* | estructura | **Estructura** | `Table` |
| **No sabe**<br>*"no sé cómo organizarlo"* | conocimiento | **Respuesta** | `Steps`, `Tree`, `Code`, `Callout` |
| **Quiere algo abierto**<br>*"algo por el mar"* | opciones | **Propuestas** | `List`, `Card` |

**Señales de bloqueo** que activan el modo 3: *no sé*, *cómo*, *qué debería*,
*estoy pensando en*, *busco*, *no tengo claro*.

El modo lo infiere el modelo, no lo elige el usuario. Darle botones
, *Mostrar* / *Explicar* / *Comparar*, rompería la premisa: la interfaz debe emerger del
texto, no de un menú. Cuando falle, la salida es regenerar.

## Reglas duras del modo 3

- **Prohibido devolver el trabajo.** Nada de formularios vacíos, listas de preguntas ni
  "considera estas opciones".
- **Prohibidas las plantillas.** Nada de `Equipo-A`, `Proyecto-1`, `Ejemplo: ...`.
  Nombres reales y decisiones tomadas, como si tuviera que montarlo hoy.

## Tipos de artefacto

El botón de artefacto es **partido**: el cuerpo genera en automático,el modelo
decide, y el chevron abre un desplegable para dirigirlo.

| Tipo | Qué exige |
| --- | --- |
| **Automático** | El modelo decide |
| **Diagrama** | SVG inline: nodos, aristas, jerarquías. Geometría real, no cajas de HTML apiladas |
| **Simulación** | Parámetros que recalculan en vivo, con valores por defecto ya puestos |
| **Modelo manipulable** | Reordenar, arrastrar, activar; estado inicial ya montado |

El tipo se guarda en el nodo (`kind`), así que **Regenerar** respeta lo que se pidió.
Cada tipo solo añade una directiva al system prompt: el resto del flujo es idéntico.
Definidos en `src/artifact/tipos.js`.

Por qué aquí sí se ofrece un menú y en el nivel 1 no: el artefacto ya es una acción
deliberada y cara. Añadir "de qué tipo" a algo que el usuario pide explícitamente no
rompe la premisa de que la interfaz emerge del texto, eso solo aplica al nivel
ambiente, donde el modo debe inferirse.

**La idea de fondo:** el artefacto solo se justifica si **no se puede hacer con la
librería**. Si el resultado es una lista o una tabla, ese trabajo es del nivel 1.

## Para los artefactos

> **Nunca un formulario vacío. Si generas uno, entrégalo relleno con tu recomendación.**

El usuario edita lo que no le encaje. Pasa de *"rellena esto"* a *"esto es lo que yo
haría"*: una respuesta que además es manipulable.

## Trampa de `openui-lang`

Los argumentos son **posicionales**. El modelo tiende a nombrarlos y ambas formas rompen
en silencio:

```
Tree([...], "Estructura")        ✅
Tree([...], title: "Estructura") ❌
Tree([...], title = "Estructura") ❌   ← visto con GPT-4o
```

Los opcionales que no se usen se omiten, no se nombran. Está en `additionalRules` del
prompt.

## Controles de un bloque

Pastilla flotante con iconos, en el mismo lenguaje que la barra de selección
(`src/ui/BlockControls.vue`). Aparece al pasar por encima y no ocupa sitio cuando no
está. Antes eran enlaces de texto sueltos sobre el contenido y quedaban mal.

## Sugerencias ambiente (en uso)

La interacción ya no obliga a seleccionar todo el rato. Al **cerrar un párrafo** (el
cursor sale de él), un modelo pequeño y barato (el router, `src/generate/router.js` en modo exigente,
`gpt-4.1-mini`) decide si merece la pena ofrecer algo. Si sí, aparece una pista tenue al
final del párrafo, un chip "＋ ver itinerario" / "＋ comparar", que al pulsarla genera
la sección o el artefacto justo debajo.

- **Detectar es automático; generar sigue siendo un clic.** El chip es barato; el bloque
  solo aparece si lo pulsas.
- **Nunca en el párrafo activo**, solo al cerrarlo. Debounce de 400 ms sobre la llamada.
- **El router es exigente**: la mayoría de párrafos no reciben sugerencia. Una buena vale
  más que tres regulares.
- **Descartar** (× del chip) marca ese párrafo para no volver a ofrecerlo. Aceptar
  también lo retira.
- **Opt-in**: interruptor "Sugerencias" en la barra de pie, apagado por defecto (sin
  coste ni ruido hasta que se enciende). Se recuerda en localStorage.
- El resultado se cachea por texto de párrafo, así que editar en otro sitio no repite
  llamadas.

Piezas: `src/generate/router.js` (el modelo pequeño que decide, el mismo que usa Generar), `suggestionExtension.js`
(la extensión de TipTap que detecta el cierre y pinta el chip como decoración), y
`state.js` (el interruptor). Es la "opción 3" de las interacciones dinámicas y devuelve
la magia original: el documento reacciona a lo que escribes.

Pendiente de afinar: el router es algo conservador (p.ej. "no sé cómo organizar..." no
siempre dispara, aunque la sección lo haría bien). El umbral se ajusta en su prompt.

## Abierto

- **Refinar un bloque ya generado**, la salida cuando el modo falla.
- **Sustituir el párrafo** en lugar de añadir debajo, para que el documento *se
  transforme* en vez de crecer.
- **Qué debe ser un artefacto**, ver la discusión sobre simulaciones y diagramas.


## Composición espacial de las secciones

Las secciones salían planas (un `Stack` con una sola lista) porque el prompt pedía
"composiciones verticales, columna estrecha", lo estábamos frenando. No era una
limitación de openui-lang, que tiene `Row`/`Grid`: era el prompt.

Ahora el prompt de sección pide **componer en el espacio**: usar `Row`/`Grid`, y cuando
el fragmento nombra un lugar, incluir un `Map` **al lado** del contenido. Ejemplo real:
"El día 13 y 14 estaré en Oporto y aún no sé qué hacer" → `Row([Map("Oporto"), List([...])])`
, mapa a la izquierda, sugerencias a la derecha, en vez de una lista pelada.

## Un solo gesto: "Generar" (actualización)

Se retira la elección manual Sección / Artefacto / tipo. Hay **un botón "Generar"** y un
router pequeño (`src/generate/router.js`, gpt-4.1-mini) decide, sin reglas rígidas,el
modelo juzga caso a caso, según dónde está el valor:

- **VER**, mostrar u organizar información (un lugar, fechas, una comparación, una
  explicación, un resumen): cosas que se entienden mejor al verlas → **sección**.
- **HACER / VISUAL A MEDIDA**, algo que manipulas (simular, mover variables, un quiz) o
  un dibujo que la librería no puede dar (un diagrama de un proceso, una ilustración) →
  **artefacto**.

Ante la duda, sección: más rápida y siempre encaja.

### Tipos de artefacto (los elige el router, no el usuario)

`auto`, `diagrama`, `simulacion`, `modelo` y **`quiz`** (autoexamen). El router devuelve
el `kind`; cada uno solo añade una directiva al prompt. El quiz es el más ligado al
estudio: genera un test interactivo del concepto (4-6 preguntas reales, feedback
inmediato con explicación y puntuación).

### El artefacto es un widget, no una página

Como el artefacto solo se invoca cuando de verdad hace falta interactividad o un visual
propio, su prompt pide **un widget para incrustar en la nota**, no un documento: sin
barra de título grande, sin intro larga, sin multi-sección. Va directo a la cosa
interactiva o al dibujo. Las guías/itinerarios/comparaciones son territorio de la
sección; el artefacto no las hace.

## El valor, aterrizado al estudio

AuraNote es una app de notas para **estudiar**, con generación cuando ayuda a
**comprender** o a **experimentar**. La interactividad entra solo cuando sirve a eso: el
caso estrella es "estudias un concepto y quieres tocarlo" (un simulador donde mueves una
variable y ves el efecto). No es un fin en sí; es exploración de una forma de interactuar
al servicio del estudio.

## Exploración aparcada (rumbo, no ahora)

Ideas que interesan pero que NO son el plato principal, guardadas para no perderlas:

- **Superficie viva**, que lo generado se pueda seguir moldeando apuntando a ello:
  clicar una parte, escribir una instrucción encima ("agrúpalo por barrio", "quita
  esto") y que se rehaga. La misma interacción del documento (seleccionar → actuar),
  recursiva, dentro de cada bloque.
- **Affordances perezosas**, un botón que existe antes que su comportamiento: al
  pulsarlo, el modelo genera lo que hace, en el momento. El modelo (o el usuario) planta
  botones cuya conducta se materializa al clicarlos.

Son especia, no estructura. Se probarían como experimentos acotados, empezando por las
secciones (que controlamos el DOM), no por los artefactos (iframe aislado).
