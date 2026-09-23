# Roadmap

AuraNote es una **exploración** de interfaces generativas sobre notas, no un producto en
camino a una release. Así que esto no es una lista de features con fechas: es por dónde
seguir probando.

## Cómo está organizado

Separación de responsabilidades, como en cualquier programa:

- **Entrada**: produce texto. El teclado lo da directamente; la voz es solo audio
  transcrito a texto, nada más. El resto del sistema no sabe de dónde vino el texto.
- **Generación de UI**: entra texto, sale interfaz (sección o artefacto). Es lo que existe hoy.
- **Superficie**: la página (el documento TipTap) donde vive todo.

## Dónde está ahora

- Entrada: solo teclado.
- Un gesto **Generar**: un router pequeño (gpt-4.1-mini, `src/generate/router.js`) decide
  entre sección o artefacto.
- Sugerencias ambiente al cerrar un párrafo, con el mismo router en modo exigente.
- Secciones con mapa estilo iOS, fotos (Unsplash), iconos (Lucide) y composición espacial.
- Artefactos interactivos: simulador, quiz, diagrama, modelo manipulable.

## Siguientes pasos

1. ~~**Un solo router.**~~ Hecho: `decidir(texto, { exigente })` en
   `src/generate/router.js` sirve a Generar y a las sugerencias.
2. **Voz como entrada** (en el plan, sin empezar). Dictado que escribe en la nota;
   Generar y las sugerencias trabajan sobre ese texto sin cambios. Empezar con la Web
   Speech API del navegador (gratis, texto en vivo) y cambiar a una API de transcripción
   solo si la calidad se queda corta.

## Por dónde seguir

### Generación de UI
- Afinar los prompts de sección y artefacto con lo que se vea al usarlo.
- Que la composición de las secciones varíe más y encaje mejor con el contenido.
- Un modelo para SVG complejos: OmniSVG se probó y se quedó corto (solo formas simples),
  así que se eliminó. Volver a intentarlo cuando haya un modelo texto a SVG lo bastante
  bueno (StarVector u otros). La idea sigue en pie: un modelo pequeño y especializado para
  el dibujo, y el grande solo para componer alrededor.
- Afinar las sugerencias ambiente (cuándo aparecen, cómo de frecuentes).

### Superficie
- Tantear la **superficie viva**: remodelar un bloque generado apuntándolo (clic o
  instrucción encima) y que se rehaga.
- Tantear las **affordances perezosas**: un botón cuyo comportamiento se genera al pulsarlo.
- Una idea más entre otras: ponerse a prueba sobre las propias notas, más allá del quiz actual.

Son experimentos acotados, no estructura. Se prueban primero en las secciones
(controlamos el DOM), no en los artefactos (iframe aislado). Ver
[docs/interaccion.md](docs/interaccion.md).

## Ideas aparcadas

Anotadas para no perderlas. Ninguna se mete aún.

### Jev como motor del router
Jev (TypeSafe, sept. 2026) es un clasificador que no genera texto: devuelve elecciones,
puntuaciones y verdadero/falso con probabilidad, en 70 a 500 ms y muy barato. `decidir()`
es justo eso (sección o artefacto, si merece, qué tipo). Solo la etiqueta del chip
necesita un modelo que escriba. Es cerrado y está en acceso anticipado: esperar a poder
usarlo y probarlo en español, que no es su idioma fuerte.

### Sistema de coherencia
Como "buscar usos" al cambiar una función, pero en la nota:

1. Un LLM, de vez en cuando, propone las **categorías** de la nota (ej. "Viaje Lisboa",
   "Presupuesto"). Solo añade o divide, nunca renombra por su cuenta.
2. Jev clasifica cada párrafo y cada bloque generado dentro de esas categorías (puede ser
   más de una).
3. Al cambiar algo, Jev pregunta a lo que comparte categoría si le afecta el cambio y
   marca lo afectado.
4. Un LLM propone la corrección solo para lo marcado; tú aceptas o no.

Detectar es automático, modificar sigue siendo un clic. Los bloques generados siguen
siendo fotos, pero se sabe cuándo se han quedado desfasados. Por decidir: dentro de una
nota o también entre notas.

### Opciones en ajustes
Es una exploración, así que las variantes que chocan entre sí no hace falta elegirlas: se
dejan como opciones en ajustes y se prueban.

- **Quién manda.** Por defecto manda el texto: lo generado y los metadatos se derivan de
  él y nunca lo reescriben solos. Opción: que lo generado **sustituya al texto** (escribes
  y la nota se organiza sola).

## Fuera del alcance por ahora

- No es un producto: nada de cuentas, sincronización ni publicación.
- Sin backend real; las claves viven en `.env` para desarrollo.
- El **Canvas** (una superficie espacial en vez de la página).
- Una capa de **comprensión del conjunto** de la nota: entender relaciones e intención de
  todo lo escrito y anticipar.

Estas dos últimas serían capas futuras encima de la estructura, no parte de ella ahora.
