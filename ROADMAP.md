# Roadmap

Estimaciones para una persona. El objetivo del fin de semana es **validar el concepto**,
no terminar un producto.

---

## Fase 0, Esqueleto · ~45 min

- [ ] Vite + Vue 3 + Tailwind
- [ ] TipTap (`@tiptap/vue-3`, `@tiptap/starter-kit`)
- [ ] Variables de entorno para las API keys

**Listo cuando:** escribes en un div y sale texto.

---

## Fase 1, El documento · ~2 h

- [ ] Columna centrada de 720px, 16px, `line-height` 1.6, gris oscuro (no negro puro)
- [ ] Títulos, negrita, cursiva, listas
- [ ] Sin bordes, sin sombras, sin cards en ningún sitio
- [ ] Autoguardado del JSON de TipTap en `localStorage`, con debounce
- [ ] Recargar la página no pierde nada

**Listo cuando:** parece Notion y no pierdes lo escrito.

---

## Fase 2, Selección · ~1 h

- [ ] `BubbleMenu` al seleccionar texto
- [ ] Negrita / cursiva
- [ ] Botón **Generar artefacto** (aún sin funcionalidad)
- [ ] Botón **Convertir en sección** (aún sin funcionalidad)

**Listo cuando:** el gesto completo existe aunque no genere nada.

---

## Fase 3, Nivel 2: el artefacto · ~3 h ⭐

La primera vez que funciona de verdad.

- [ ] Nodo custom `artifactBlock` + node view en Vue
- [ ] Proxy mínimo hacia el modelo grande
- [ ] Prompt: **un único HTML autocontenido**, CSS y JS inline, sin dependencias externas
- [ ] Render en `<iframe sandbox>`
- [ ] Insertar bajo el párrafo donde acaba la selección
- [ ] Estado de carga honesto (tarda 10-30 s)
- [ ] El bloque se guarda en el JSON del documento

**Listo cuando:** seleccionas el párrafo de Lisboa, pulsas, y a los 20 s tienes algo
interactivo dentro de la nota, y sigue ahí tras recargar.

> 👉 **Aquí ya hay demo.** Todo lo posterior es mejora, no rescate.

---

## Fase 4, La librería de componentes · ✅ hecha

Sin modelos todavía.

- [x] Layout: `Stack`, `Row`, `Grid`, `Section`
- [x] Contenido: `Map` (Leaflet + OSM), `Timeline`, `Table`, `Card`, `List`, `Stat`, `Text`
- [x] Renderer oficial `@openuidev/vue-lang` + `src/ui/library.js`
- [x] **Escribir `openui-lang` a mano** y verificar que renderiza bien

```
map      = Map("Lisboa", 12)
timeline = Timeline([{ label: "Jueves", description: "Llegada" }])
root     = Stack([map, timeline])
```

Argumentos **posicionales**, en el orden del esquema. La sintaxis con nombres
(`Map(place: "Lisboa")`) rompe en silencio.

**Listo cuando:** un `openui-lang` escrito por ti renderiza bonito.

> Este paso es el que más tiempo salva: separa *"¿mi renderer funciona?"* de
> *"¿el modelo genera bien?"*. Si se juntan y falla algo, no sabes cuál de los dos es.

---

## Fase 5, Nivel 1: OUI-1 · ~3 h

- [ ] Proxy hacia Thesys C1
- [x] System prompt: lo genera `library.prompt()` desde `src/ui/library.js`
- [ ] Nodo `sectionBlock` que renderiza el `openui-lang` devuelto
- [ ] Conectar el botón **Convertir en sección**

**Listo cuando:** el mismo párrafo da resultados distintos por cada vía, sección
compuesta en 1 s, o aplicación libre en 20 s.

> ⚠️ **Fase de mayor riesgo.** OUI-1 se publicó en septiembre de 2026 y la
> documentación de `openui-lang` está incompleta. Va la última a propósito: la fase 3
> ya dejó una demo a salvo.

---

## Fase 6, Pulir · lo que quede

- [ ] Borrar y regenerar bloques
- [ ] Refinar con instrucción ("hazlo con presupuesto")
- [ ] Transiciones al insertar
- [ ] Estados de error

---

## Reparto del fin de semana

| Cuándo           | Qué                                    |
| ---------------- | -------------------------------------- |
| **Sáb mañana**   | Fases 0-1, el documento               |
| **Sáb tarde**    | Fases 2-3, **demo funcionando**       |
| **Dom mañana**   | Fase 4, librería, sin modelos         |
| **Dom tarde**    | Fase 5, OUI-1, y pulir lo que dé      |

Si vas justo: **recorta a lo ancho, no a lo alto.** Dos componentes en vez de once.
Lo que hay que demostrar es que existen los dos niveles, no que tengas catálogo.

---

## Calidad de los artefactos (hecho)

- [x] gpt-4.1 y prompt reescrito: ilustración en vez de cajas
- [x] Dos registros (chrome sobrio / contenido rico)
- [x] Iconos Lucide incrustados por nombre (`data-icon`), offline
- [x] OmniSVG probado y accesible en dev (`/api/omnisvg`)
- [ ] Director → especialistas → ensamblador (ver docs/agentes.md)
- [ ] Mermaid para diagramas estructurales
- [ ] OmniSVG en Inference Endpoint para producción

## Después del fin de semana

| Idea                          | Nota                                                       |
| ----------------------------- | ---------------------------------------------------------- |
| GLiNER + subrayados           | La affordance que hace visible que el documento está vivo  |
| Precarga predictiva           | GLiNER es tan barato que puede adelantarse a los clicks    |
| Datos reales                  | Eventos, sitios, ahora mismo sale del conocimiento del modelo |
| Estado persistente            | Que marcar una casilla del artefacto sobreviva a recargar  |
| Varias notas                  | Ahora mismo hay una                                        |
| Backend real                  | FastAPI, cuando entre GLiNER                               |
| OUI-1 autoalojado             | FP8 en una 5090, o GGUF                                    |
| Grounding con búsqueda web    | Lo que hace Disco abriendo pestañas                        |
