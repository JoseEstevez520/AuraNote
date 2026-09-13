# Arquitectura agentizada (diseño)

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
| Ilustración a medida | **OmniSVG 4B** (texto→SVG) | ✅ probado | `server/omnisvg.mjs` + `/api/omnisvg`. ~20-40 s, cola en gratis |
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
