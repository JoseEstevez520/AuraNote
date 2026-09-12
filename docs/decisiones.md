# Registro de decisiones

Lo decidido **y lo descartado**, con el motivo. Lo segundo suele valer más que lo
primero: evita volver a proponer lo mismo dentro de tres semanas.

---

### 1 · Dos niveles de generación, no uno

**Decisión:** una vía rápida y constreñida (OUI-1 + tus componentes) y otra lenta y
libre (modelo grande + iframe).

**Por qué:** si ambas generasen lo mismo, la segunda sería "la primera pero más lenta".
El contraste es el producto: la librería es el vocabulario del documento, el artefacto
es la fuga de ese vocabulario.

---

### 2 · OUI-1 compone, no elige ⭐

**Decisión:** la unidad de generación es **fragmento → sección compuesta**.

**Descartado:** una tabla de afinidad `tipo de entidad → componente` (`lugar` → `Map`,
`fecha` → `Timeline`…).

**Por qué:** esa tabla es un `switch`, no un modelo. Si `lugar` siempre da `Map`, OUI-1
sobra — estaríamos pagando un modelo generativo para hacer de router. Su valor está en
decidir que *este* párrafo merece un mapa grande arriba, un timeline al lado y una lista
debajo, y que el siguiente merece otra cosa. Eso una tabla no lo hace.

> Corrección importante que reescribió media arquitectura. Ver [componentes](componentes.md).

---

### 3 · Siempre sobre la selección, nunca global

**Decisión:** los dos botones viven en la barra flotante que aparece al seleccionar texto.

**Descartado:** un botón global arriba que trabaje sobre la nota entera.

**Por qué:** la selección *es* el prompt — desaparece el problema de "¿sobre qué genero?".
Además ancla el resultado a su origen, lo que hace que "regenerar" esté bien definido.
Quien quiera la nota entera, Ctrl+A.

---

### 4 · El nivel 2 emite código libre, no `openui-lang`

**Decisión:** HTML autocontenido en un `<iframe sandbox>`.

**Descartado:** que también emitiera `openui-lang`.

**Por qué:** encerrarlo en la librería lo dejaría sin poder hacer nada que no estuviera
previsto, y entonces los dos niveles se solapan de forma tonta. La generación libre es
justo la parte que se quiere experimentar.

---

### 5 · Vue

**Decisión:** Vue 3 sobre React.

**Por qué:** TipTap nació como librería de Vue (v1 era Vue-only), así que
`@tiptap/vue-3` no es un puerto de segunda. El renderer de `openui-lang` también tiene
versión Vue.

**Riesgo asumido:** OUI-1 es de septiembre de 2026; el renderer de Vue estará menos
rodado que el de React.

---

### 6 · TipTap, no `contenteditable`

**Decisión:** TipTap sobre ProseMirror.

**Por qué:** más allá de no reimplementar un editor, sus dos primitivas encajan solas —
**node views** (los bloques generados son nodos del documento, así que persisten gratis)
y **decorations** (los futuros subrayados de GLiNER no ensucian el contenido guardado).

---

### 7 · Todo dentro de la columna de 720px

**Decisión:** las secciones generadas respetan la columna del texto.

**Descartado:** bloques a ancho completo, como los de Notion.

**Por qué:** el cambio de ancho comunicaría "esto es generado", pero rompe la sensación
de que lo generado *es parte del documento*. Reconsiderable si el espacio aprieta.

---

### 8 · GLiNER aplazado

**Decisión:** fuera de la primera versión.

**Por qué:** su trabajo original —enrutar entidad → componente— desapareció con la
decisión 2. Como enriquecedor es marginal: un modelo grande ya entiende que Lisboa es
una ciudad sin que se lo anoten.

**Lo que sí le queda, para después:** ser la **affordance** (los subrayados son lo único
que le dice al usuario que el documento está vivo) y hacer **precarga predictiva** (es
tan barato que puede adelantarse a lo que se va a pulsar). Lo segundo es una
optimización, y las optimizaciones no van en un PoC.

---

### 9 · Sin backend al principio

**Decisión:** solo un proxy para esconder las API keys. El de Vite en desarrollo vale.

**Por qué:** consecuencia de la 8. Sin GLiNER no hay nada que ejecutar en servidor.
Montar Python, descargar pesos y desplegar un servicio el día que hay que arrancar es
gasto puro. FastAPI entra cuando entre GLiNER — y entonces sí, porque `gliner` es una
librería de Python.

---

### 10 · OUI-1 hospedado (Thesys C1)

**Decisión:** empezar por la API hospedada, no por los pesos.

**Por qué:** 100 páginas/mes gratis, compatible con OpenAI, cero setup. Los pesos son
Apache 2.0, así que autoalojar más tarde es cambiar una URL. Pelearse con vLLM antes de
saber si la idea funciona sería tirar el sábado.

---

### 11 · Mapa real

**Decisión:** Leaflet + OpenStreetMap.

**Descartado:** un `Map` estilizado sin datos reales.

**Por qué:** sin API key y 15 minutos de trabajo. Un mapa falso se nota.

---

### 12 · Construir el nivel 2 antes que el nivel 1

**Decisión:** el artefacto primero, aunque conceptualmente sea el nivel "avanzado".

**Por qué:** es mucho más barato (selección → API → iframe, sin librería ni renderer) y
deja una demo funcionando el sábado por la tarde. Quita presión y protege el fin de
semana: la fase de riesgo (OUI-1, documentación incompleta) ya no puede hundir el
proyecto entero.

---

### 13 · La librería antes que el modelo

**Decisión:** construir los componentes y verificarlos con `openui-lang` escrito a mano,
antes de conectar OUI-1.

**Por qué:** separa *"¿mi renderer funciona?"* de *"¿el modelo genera bien?"*. Si se
juntan y falla algo, no hay forma de saber cuál de los dos es.

---

### 14 · Sin grounding web en la v1

**Decisión:** los artefactos salen del conocimiento del modelo, sin búsqueda.

**Por qué:** Disco abre pestañas reales y sus resultados son mejores por eso, pero es un
proyecto en sí mismo. Si el concepto se sostiene sin datos frescos, añadir grounding
después es incremental, no estructural.

---

### 15 · Usar los paquetes oficiales de OpenUI ⭐

**Decisión:** `@openuidev/lang-core` + `@openuidev/vue-lang`.

**Descartado:** un parser propio de `openui-lang` (existió, se retiró).

**Por qué:** al probarlos se descubrió que **la sintaxis real usa argumentos
posicionales, no con nombre**. Es `Map("Lisboa", 12)`, no `Map(place: "Lisboa")`.
El system prompt que genera la propia librería lo dice literalmente:

> *"Arguments are POSITIONAL (order matters, not names) — colon syntax is NOT
> supported and silently breaks"*

El parser casero soportaba exactamente esa forma prohibida, así que no era un plan B:
era incorrecto. Habría parseado un formato que el modelo nunca emite.

Además los paquetes oficiales aportan tres cosas que no se pueden adivinar:

1. **`library.prompt()`** — genera el system prompt desde los esquemas Zod y las
   descripciones de tus componentes, en el formato con el que el modelo fue entrenado.
   Es lo más valioso de los tres.
2. **Streaming** — `createStreamingParser` y el `Renderer` pintan según llega el texto.
3. **La spec real de v0.5** — errores tipados (`missing-required`, `unknown-component`,
   `excess-args`), referencias adelantadas, validación contra el esquema.

**Coste:** los componentes de `src/ui/` reciben props normales de Vue, pero
`openui-lang` los invoca con `{ props, renderNode }`. Hay un adaptador en
`src/ui/library.js` que traduce entre ambos.

**Nota:** este descubrimiento fue consecuencia de una instrucción equivocada. A los
agentes que construyeron el proyecto se les prohibió instalar paquetes para que no se
pisaran en `package.json`, y por eso uno escribió el parser a mano.

---

### 16 · C1 no sirve OUI-1 — el nivel 1 va contra un LLM normal ⭐

**Corrección de la decisión 10.** Se dio por hecho que Thesys C1 servía OUI-1. **No es
así.** Consultando `GET /v1/embed/models` con una clave real, C1 ofrece 34 modelos y
todos son `c1/anthropic/claude-*` y `c1/openai/gpt-*`. Ni OUI-1 ni DiffusionGemma.

Son dos productos distintos del mismo equipo:

| | |
| --- | --- |
| **C1** | Servicio hospedado de generative UI que envuelve modelos frontera |
| **OUI-1** | Modelo de difusión de 4B con pesos abiertos, para autoalojar |

**Decisión:** el nivel 1 apunta a un LLM normal (OpenAI) con el prompt que genera
`library.prompt()`. Es exactamente el flujo para el que está diseñado `lang-core`:
generas el prompt desde tu librería y se lo mandas al modelo que quieras.

**Verificado:** GPT-4o produce `openui-lang` válido con nuestra librería —argumentos
posicionales, `Section` anidada, referencias adelantadas— y renderiza correctamente.

**Lo que se pierde:** la latencia. OUI-1 tarda ~1 s por ser de difusión; un LLM
autoregresivo tarda varios segundos. La promesa de "UI que aparece mientras escribes"
necesita OUI-1 autoalojado. Queda como mejora, no como bloqueo.

---

## Abierto

| Cuestión                                          | Estado                          |
| ------------------------------------------------- | ------------------------------- |
| Autoalojar OUI-1 para bajar la latencia del nivel 1 | Necesita GPU (FP8 ~26 GB) o GGUF |
| Nombre definitivo (AuraNote / SynapseNotes)       | Sin cerrar                      |
| Dónde vive el proxy en producción                 | Sin decidir                     |
