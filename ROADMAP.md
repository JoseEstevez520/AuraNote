# Roadmap

AuraNote es una **exploración** de interfaces generativas sobre notas de estudio, no un
producto en camino a una release. Así que esto no es una lista de features con fechas: es
por dónde seguir probando.

## Dónde está ahora

- Un gesto **Generar**: un router pequeño (gpt-4.1-mini) decide entre sección o artefacto.
- Secciones con mapa estilo iOS, fotos (Unsplash), iconos (Lucide) y composición espacial.
- Artefactos interactivos: simulador, quiz, diagrama, modelo manipulable.
- Sugerencias ambiente al cerrar un párrafo.

## Por dónde seguir

### Calidad de lo generado
- Afinar los prompts de sección y artefacto con lo que se vea al usarlo.
- Que la composición de las secciones varíe más y encaje mejor con el contenido.

### Un modelo para SVG complejos
- OmniSVG se probó y se quedó corto (solo formas simples); se eliminó del repo.
- Volver a intentarlo cuando haya un modelo texto a SVG lo bastante bueno (StarVector u
  otras versiones). La idea sigue en pie: un modelo pequeño y especializado para el dibujo,
  y el grande solo para componer alrededor.

### Formas de interactuar
- Afinar las sugerencias ambiente (cuándo aparecen, cómo de frecuentes).
- Tantear la **superficie viva**: remodelar un bloque generado apuntándolo (clic o
  instrucción encima) y que se rehaga.
- Tantear las **affordances perezosas**: un botón cuyo comportamiento se genera al pulsarlo.
- Explorar el **autoexamen** desde tus propias notas más allá del quiz actual.

Estas dos últimas son experimentos acotados, no estructura. Se prueban primero en las
secciones (controlamos el DOM), no en los artefactos (iframe aislado). Ver
[docs/interaccion.md](docs/interaccion.md).

## Fuera del alcance por ahora

- No es un producto: nada de cuentas, sincronización ni publicación.
- Sin backend real; las claves viven en `.env` para desarrollo.
