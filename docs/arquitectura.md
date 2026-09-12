# Arquitectura

## Pipeline

```
                        DOCUMENTO (TipTap)
                               │
                        seleccionas un fragmento
                               │
              ┌────────────────┴────────────────┐
              ↓                                 ↓
       NIVEL 1 · sección                 NIVEL 2 · artefacto
              │                                 │
       proxy → Thesys C1                 proxy → modelo grande
              │                                 │
        OUI-1 (4B, difusión)              HTML autocontenido
              │                                 │
        openui-lang                        iframe sandbox
              │                                 │
    renderer → componentes Vue                  │
              │                                 │
              └────────────────┬────────────────┘
                               ↓
                    nodo insertado en el documento
                       (persiste en el JSON)
```

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

Marcas visuales que se pintan *encima* del texto sin modificar el documento. Cuando
entre GLiNER, los subrayados de entidades serán esto: capa efímera, texto guardado
limpio. Si se cambia de modelo de entidades, no se ha ensuciado ninguna nota.

### Vue

TipTap nació como librería de Vue (v1 era Vue-only, se volvió agnóstica en v2), así que
`@tiptap/vue-3` no es un puerto de segunda. El renderer de `openui-lang` también tiene
versión Vue.

Único riesgo asumido: OUI-1 es de septiembre de 2026, así que el renderer de Vue estará
menos rodado que el de React.

---

## Nivel 1 — OUI-1

### Qué es

Finetune de DiffusionGemma 26B-A4B (26B totales, **4B activos**) que escribe interfaces
en `openui-lang`. Apache 2.0.

No es autoregresivo: genera bloques de 256 tokens partiendo de ruido, comprometiendo
cada token cuando está seguro (48 pasos de denoising). **~1 s** para pantallas simples,
3-6 s para complejas. Eso es lo que lo hace viable dentro de una interacción.

`openui-lang` cuesta ~67% menos tokens que JSON y **streamea**, así que la interfaz
empieza a renderizar antes de terminar de generarse.

### Cómo lo llamamos

**Thesys C1** hospedado — endpoint compatible con OpenAI, 100 páginas/mes gratis,
$0.01 después. Cero setup.

Como el modelo es abierto, se puede autoalojar más tarde cambiando la URL:

| Modo   | VRAM      | Nota                              |
| ------ | --------- | --------------------------------- |
| bf16   | ~52 GiB   | A100 / H100                       |
| FP8    | ~25.8 GiB | RTX 5090 sí; 4090 (24 GB) no      |
| GGUF   | menos     | Ollama, LM Studio, llama.cpp      |

No merece la pena pelearse con vLLM antes de saber si la idea funciona.

### El punto clave: composición, no selección

**OUI-1 no elige un componente. Compone una sección.**

Una tabla `tipo de entidad → componente` sería un `switch`, no un modelo — no haría
falta IA para eso. El valor está en decidir que *este* párrafo merece un mapa grande
arriba, un timeline estrecho al lado y una lista debajo a dos columnas; y que el
siguiente párrafo merece algo completamente distinto.

Por eso la unidad de generación es **fragmento → sección**, no **entidad → widget**.

---

## Nivel 2 — el artefacto

- **Disparo:** selección + botón en el `BubbleMenu`. Nunca automático, nunca global.
  La selección *es* el prompt: el usuario acaba de decir sobre qué generar.
- **Contexto:** el fragmento manda; el resto de la nota va como contexto de fondo.
- **Salida:** un único HTML autocontenido, CSS y JS inline, sin dependencias externas.
- **Render:** `<iframe sandbox>`. Aislamiento obligatorio — es código generado.
- **Anclaje:** el fragmento origen queda marcado y el bloque se inserta bajo el párrafo
  donde acaba la selección. Eso hace que "regenerar" esté bien definido y que el usuario
  sienta que el artefacto *salió de ahí*.

---

## Backend

**Al principio, ninguno.** Solo hace falta esconder las API keys: el proxy de Vite en
desarrollo, o 30 líneas de lo que sea.

FastAPI entra cuando entre GLiNER, y entonces sí tiene sentido, porque GLiNER es una
librería de Python (`pip install gliner`). En cualquier otro lenguaje habría que ir por
ONNX Runtime y montar a mano el pre y post-procesado.

```
POST /extract     texto → entidades              (GLiNER, local)   ← futuro
POST /section     fragmento → openui-lang        (proxy C1)
POST /artifact    fragmento + contexto → HTML    (proxy modelo grande)
```

---

## GLiNER — aplazado, no descartado

NER zero-shot: le pasas las etiquetas que quieras (`lugar`, `fecha`, `evento`,
`tecnología`…) y las encuentra aunque no las viera en entrenamiento. Corre en CPU en
milisegundos.

Su papel **original** era enrutar entidad → componente. Ese trabajo desapareció al
decidir que OUI-1 compone en vez de elegir. Y como enriquecedor es marginal: un modelo
grande ya entiende que Lisboa es una ciudad sin que se lo anoten.

Le quedan dos trabajos, ambos buenos, ninguno urgente:

1. **Affordance.** Los subrayados son lo único que le dice al usuario que el documento
   está vivo. Sin ellos hay un editor normal y una barra de selección que nadie sabe que
   existe. Es la parte central del mockup, de hecho.
2. **Precarga predictiva.** Es tan barato que puede correr sobre la nota entera
   constantemente: sabes qué hay, precalientas lo que probablemente se pulse, y el click
   responde en cero en vez de en un segundo.

Lo segundo es una optimización de latencia, y las optimizaciones no van en un PoC.
Aplazado al post-fin de semana.
