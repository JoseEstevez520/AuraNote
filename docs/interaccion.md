# Interacción

## La regla

> **La interfaz cierra el hueco que abre el texto. No abre uno nuevo.**

El error más grave no es generar algo feo: es **equivocarse de modo**. Ante
*"no sé cómo organizarlo"*, devolver un formulario vacío no cierra el hueco —
convierte una pregunta en deberes.

## Los cuatro modos

| El texto | Hueco | Qué genera | Componentes |
| --- | --- | --- | --- |
| **Declara hechos**<br>*"El viernes voy a Lisboa"* | ninguno | **Espejo** — renderiza lo dicho | `Map`, `Timeline` |
| **Compara**<br>*"Spring Boot y FastAPI"* | estructura | **Estructura** | `Table` |
| **No sabe**<br>*"no sé cómo organizarlo"* | conocimiento | **Respuesta** | `Steps`, `Tree`, `Code`, `Callout` |
| **Quiere algo abierto**<br>*"algo por el mar"* | opciones | **Propuestas** | `List`, `Card` |

**Señales de bloqueo** que activan el modo 3: *no sé*, *cómo*, *qué debería*,
*estoy pensando en*, *busco*, *no tengo claro*.

El modo lo infiere el modelo, no lo elige el usuario. Darle botones
—*Mostrar* / *Explicar* / *Comparar*— rompería la premisa: la interfaz debe emerger del
texto, no de un menú. Cuando falle, la salida es regenerar.

## Reglas duras del modo 3

- **Prohibido devolver el trabajo.** Nada de formularios vacíos, listas de preguntas ni
  "considera estas opciones".
- **Prohibidas las plantillas.** Nada de `Equipo-A`, `Proyecto-1`, `Ejemplo: ...`.
  Nombres reales y decisiones tomadas, como si tuviera que montarlo hoy.

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

## Abierto

- **Refinar un bloque ya generado** — la salida cuando el modo falla.
- **Sustituir el párrafo** en lugar de añadir debajo, para que el documento *se
  transforme* en vez de crecer.
- **Qué debe ser un artefacto** — ver la discusión sobre simulaciones y diagramas.
