# Arquitectura agentizada (diseño)

> **Actualización: OmniSVG ELIMINADO del repo.** Se probó, no dio la talla en ilustración, y se ha retirado el código (cliente, endpoint `/api/omnisvg` y demo). Lo que sigue queda como registro de por qué.
>
> **Prueba original (13 sep):** OmniSVG se descartó del camino real. En
> pruebas con Pro (sin cuota), el 4B y el 8B solo producen iconos de formas simples;
> en cuanto el objeto tiene estructura (un zorro, un gato) fallan (triángulos, líneas).
> El 8B es más lento (~100 s) y peor. Para iconos Lucide ya gana; para ilustración
> gpt-4.1 es muy superior (el ciclo del agua). Así que OmniSVG queda **fuera del camino
> por defecto**: el cliente y el endpoint siguen en el repo por si aparece un modelo de
> SVG mejor (StarVector u otra versión), pero no se usa. Lo que sigue es el diseño
> original, conservado como referencia.

---


> Estado: **diseño + piezas probadas**. El sistema completo aún no está montado; lo que
> sí está probado y en uso se marca ✅.

## La idea

Hoy un solo modelo (gpt-4.1) hace **todo** el artefacto: decide el plan, maqueta,
escribe la lógica y dibuja cada icono e ilustración. Es como usar el LLM gigante para
el NER en vez de GLiNER: malgasta al grande en tareas que resuelve mejor un
especialista.

La dirección: un **director** reparte el trabajo entre **especialistas**, cada uno con
la herramienta adecuada.

```
                    DIRECTOR  (gpt-4.1)
        lee el fragmento y emite un PLAN en JSON:
        layout + lista de piezas visuales que hacen falta
                          │
      ┌───────────────────┼─────────────────────┐
      ↓                   ↓                     ↓
  Lucide ✅          OmniSVG ✅             gpt-4.1
  iconos por         ilustración a          maquetación +
  nombre, offline    medida (texto→SVG)     lógica/HTML
      │                   │                     │
      └───────────────────┼─────────────────────┘
                          ↓
                    ENSAMBLADOR
        compone el HTML final autocontenido
```

Cada especialista hace lo que mejor sabe, las piezas visuales se pueden pedir **en
paralelo**, y el director nunca vuelve a dibujar un icono de reloj a mano.

## Las piezas

| Pieza | Herramienta | Estado | Notas |
| --- | --- | --- | --- |
| Iconos ubicuos | **Lucide** (set curado, incrustado) | ✅ en uso | `src/artifact/icons.js`, offline, instantáneo |
| Ilustración a medida | ~~OmniSVG 4B~~ → **gpt-4.1** | ❌ descartado | OmniSVG falla en objetos con estructura; ver nota arriba |
| Maquetación + lógica | **gpt-4.1** | ✅ en uso | El artefacto actual |
| Diagrama estructural | **Mermaid** (determinista) | ⏳ pendiente | Nunca se sale del viewBox |
| Director + ensamblador | **gpt-4.1** | ⏳ pendiente | El orquestador |

## Por qué aún no está montado del todo

Lo honesto tras probarlo:

- **OmniSVG es lento en el plan gratis** (~28 s por SVG, con cola ZeroGPU). Paralelizar
  ayuda, pero orquestar N llamadas seguirá siendo más lento que gpt-4.1 de una sola vez.
  El valor de la arquitectura es **calidad y separación**, no velocidad.
- **El solape con Lucide.** OmniSVG brilla en *un* objeto (un icono, un logo, una
  ilustración suelta). Para iconos ubicuos, Lucide ya gana en velocidad y consistencia.
  El hueco real de OmniSVG es la ilustración que no existe en ninguna librería.
- **El ensamblado es lo difícil.** Juntar SVGs de varias fuentes en un HTML coherente y
  bien maquetado es donde está el trabajo de verdad, no en las llamadas.

Por eso el orden de construcción es incremental y cada paso vale por sí solo:

1. ✅ **Lucide incrustado** — arregla los iconos ya, sin infraestructura.
2. ✅ **OmniSVG probado** — endpoint `/api/omnisvg` en dev; capacidad disponible.
3. ⏳ **Director → ensamblador** — cuando compense la latencia. Empezar por: el director
   emite el plan, se piden los SVG en paralelo, gpt-4.1 ensambla con placeholders.
4. ⏳ **Mermaid** para diagramas estructurales.

## Hospedaje de OmniSVG

- **Ahora:** su Space de HuggingFace (ZeroGPU), gratis, vía `/api/omnisvg` (el
  `HF_TOKEN` vive en el servidor de dev, nunca en el navegador).
- **Producción:** HF Inference Endpoint dedicado (una GPU de 24 GB sobra para los 16 GB
  que pide el 4B), se apaga solo, ~0,80 $/h. O autoalojar si hay GPU ≥16 GB — la de este
  equipo (RTX 4060, 8 GB) no llega al 4B.


---

## Pipeline dividido (en uso) — actualización 13 sep

Tras descartar OmniSVG, se mantuvo la idea de **dividir** pero con gpt-4.1 como
ilustrador. Validado con A/B (`docs/agentes.md`): cuando un agente **solo** dibuja el
SVG, la ilustración sale más limpia que si un único prompt hace ilustración + texto +
lógica a la vez. La clave no era el modelo pequeño, era el **foco**.

Montado en `src/artifact/pipeline.js` y enchufado vía `generateArtifactSmart`:

- **diagrama** → pipeline, ilustración forzada
- **auto + tema visual** → pipeline (el director lo detecta)
- **auto + no visual** → llamada única (mejor con el prompt base)
- **simulacion / modelo** → llamada única con su directiva (interactivo)
- Si el pipeline falla, cae a la llamada única.

**Estado honesto:** el texto y la estructura salen muy bien; la **ilustración es
irregular** — a veces limpia (ciclo del agua), a veces con flechas mal dibujadas
(fotosíntesis: triángulos negros). Se reforzó el prompt del ilustrador para que las
flechas vayan siempre por `<marker>` y nunca como polígonos sueltos. Sigue siendo la
parte a pulir.
