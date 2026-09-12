# UX

## La regla de oro

> **Nunca muevas el texto que el usuario está escribiendo.**

Todo lo demás sale de aquí. El layout shift mientras escribes es lo único imperdonable.
Así que la pregunta no es *"¿cuándo genero?"* sino *"¿qué puedo hacer sin mover nada?"*.

## Los tres escalones

| Escalón       | Cuándo             | ¿Mueve el layout? |
| ------------- | ------------------ | ----------------- |
| **Detectar**  | automático         | No — solo pinta   |
| **Ofrecer**   | al hover           | No — flota        |
| **Generar**   | click explícito    | Sí — pero lo pidió el usuario |

**Nada se genera solo. Nunca. Pero todo se ofrece sin que haya que buscarlo.**

### Detectar

Cuando entre GLiNER: corre en pausa (~800 ms sin teclear) y subraya entidades. Es seguro
hacerlo automático porque no mueve nada — es un subrayado de 1px sobre texto que ya
estaba ahí.

### Ofrecer

Al seleccionar texto aparece el `BubbleMenu` flotante, junto a negrita y cursiva:

- **Convertir en sección** → nivel 1
- **Generar artefacto** → nivel 2

Es el patrón de Notion y Medium: ya lo conoce todo el mundo y no añade nada de chrome
a la página. El botón no existe hasta que hace falta.

### Generar

Ahora sí se inserta el bloque y el layout se mueve. Pero lo pidió el usuario, así que es
esperado, no molesto.

---

## Por qué selección y no botón global

El botón de generar es **siempre sobre el fragmento seleccionado**, nunca global.

- **La selección es el prompt.** Desaparece el problema de "¿sobre qué genero?" — el
  usuario acaba de decirlo con el ratón.
- **El artefacto queda anclado a su origen.** El fragmento se marca sutilmente, el
  bloque se inserta debajo del párrafo donde acaba la selección, y ambos saben que están
  relacionados. Eso hace que "regenerar" esté bien definido y que se sienta que el
  artefacto salió de ahí, no de un chat en otro sitio.
- **Lo global es innecesario.** Quien quiera un artefacto de la nota entera, Ctrl+A.

Los dos niveles quedan como el mismo gesto en dos escalas: un **punto** (click en una
entidad, futuro) y un **rango** (selección). Misma familia de interacción, se descubre
solo.

---

## Reglas anti-molestia

No son extras. Sin ellas la app es insufrible al segundo día.

| Regla                              | Por qué                                             |
| ---------------------------------- | --------------------------------------------------- |
| Nada se genera automáticamente     | Detectar es automático; generar es siempre a petición |
| Nunca en el párrafo activo         | Si el cursor está ahí, estás escribiendo — te dejan en paz |
| Descartar es permanente            | Por nota y entidad. Sin esto, se hace insoportable  |
| Un bloque por sección              | Si no, acabas con el dashboard que no querías       |
| Interruptor global de detección    | Escape hatch                                        |

---

## Diseño visual

> **Revisado.** Lo que sigue describe **el documento**. Las piezas generadas usan un
> registro distinto —superficies, bordes suaves, radios— documentado en
> [diseno.md](diseno.md). El contraste entre ambos es deliberado.

Estética Notion, replicada a mano con Tailwind. Notion es deliberadamente poca cosa, y
eso es lo que hay que copiar:

| Aspecto        | Valor                                        |
| -------------- | -------------------------------------------- |
| Columna        | ~720px centrada (65-75 caracteres, la medida legible) |
| Tamaño         | 16px                                         |
| Interlineado   | 1.5 – 1.6                                    |
| Color de texto | Gris muy oscuro, **no** negro puro           |
| Acento         | Azul, muy contenido                          |
| Bordes         | Ninguno                                      |
| Sombras        | Ninguna                                      |
| Cards          | Ninguna                                      |
| Controles      | Aparecen en hover, desaparecen               |
| Padding lateral| Generoso — el espacio en blanco **es** el diseño |

### Por qué esto no es solo estética

Si los bloques generados respetan la columna y no llevan borde ni sombra, se sienten
**parte del documento** en vez de widgets pegados encima. Es exactamente la crítica que
se le hizo al primer mockup: se veía como *notas + cards*.

El minimalismo aquí es funcional: es lo que hace que la idea se lea.

### Ancho completo

Descartado por ahora. Se consideró que las secciones generadas rompieran la columna
para ganar espacio (Notion tiene bloques a ancho completo), pero **todo se queda dentro
de los 720px** hasta que haya una razón concreta para cambiarlo.

---

## Estados de carga

Los dos niveles tienen tiempos muy distintos y la interfaz tiene que reflejarlo:

- **Sección (~1 s):** casi instantáneo. Si `openui-lang` streamea, se puede renderizar
  mientras llega.
- **Artefacto (10-30 s):** necesita un estado de carga honesto. Nada de spinner mudo.
