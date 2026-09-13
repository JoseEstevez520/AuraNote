# Concepto

## La frase

**Un documento cuya interfaz no está prediseñada: emerge del contenido que escribes.**

## Qué NO es

Esto importa tanto como lo que sí es, porque el espacio está lleno de cosas parecidas
que no son esto:

- ❌ **No es un asistente en la nota.** No hay chat lateral, no resume, no corrige.
- ❌ **No es un dashboard de widgets.** No hay bloques prediseñados esperando a que
  aparezca su palabra clave.
- ❌ **No es "insertar bloque".** El usuario no elige un componente de un menú.
- ❌ **No es autocompletado.** No escribe por ti.

La crítica al primer mockup fue exactamente esa: se veía como *notas + varias cards*.
La UI tiene que sentirse **nacida del documento**, no pegada encima.

## Qué sí es

Escribes normal:

> "El viernes voy a Lisboa para JunctionX. Llego el jueves y quiero aprovechar el
> viernes para conocer la ciudad y quizá hacer algo por el mar."

Seleccionas ese párrafo y el documento puede convertirlo en:

- una **sección compuesta**, mapa de Lisboa, línea temporal jueves→viernes→JunctionX,
  sugerencias costeras, montada con tus componentes, en un segundo; o
- un **artefacto**, una aplicación interactiva de verdad, código libre, lo que el
  modelo considere útil.

Y si en vez de eso hubieras escrito *"estoy comparando Spring Boot y FastAPI"*, la
misma acción produce una comparativa. **Texto distinto, interfaz distinta.**

## Un gesto, dos resultados

Seleccionas un fragmento y pulsas **Generar**. No eliges entre opciones: un router
pequeño decide qué aporta más valor.

```
                    FRAGMENTO SELECCIONADO
                            │
                    router (gpt-4.1-mini)
              ┌─────────────┴─────────────┐
              ↓                           ↓
           SECCIÓN                    ARTEFACTO
       (ver / organizar)          (hacer / visual a medida)
              │                           │
        openui-lang                  código libre
              │                           │
       tus componentes              iframe sandbox
              │                           │
     siempre encaja con         puede ser cualquier
        tu diseño                       cosa
```

### Por qué dos y no uno

Si ambos generasen lo mismo, el artefacto sería "la sección pero más lenta". El contraste
**es** la idea:

> Tu librería de componentes es el vocabulario del documento.
> El artefacto es la fuga de ese vocabulario.

La sección es la red de seguridad: lo cotidiano siempre se ve bien porque son tus piezas.
El artefacto es la ambición: aislado en un sandbox, puede intentar cualquier cosa.

## Por qué modelos pequeños

La tesis técnica del proyecto: **usar el modelo más pequeño que resuelva cada tarea**. Un
router de gpt-4.1-mini clasifica y enruta; el modelo grande (gpt-4.1) solo genera cuando
hace falta. La interactividad entra solo cuando ayuda a comprender o experimentar con lo
que estudias.

(Al principio se exploró OUI-1, un modelo de difusión de 4B para generar la interfaz en
~1 s; se descartó porque su servicio no lo ofrecía y autoalojarlo no compensaba. Queda en
[decisiones.md](decisiones.md) como registro.)

## Referentes

- **Google Disco / GenTabs** (Labs, dic 2025), Gemini 3 remezcla tus pestañas abiertas
  en aplicaciones a medida. Es el artefacto llevado al navegador entero.
- **Artifacts de Claude**, código generado que se renderiza y persiste.
- **Notion**, el lenguaje visual. Columna estrecha, mucho blanco, controles en hover.

La diferencia con todos ellos: aquí el contenedor es **el documento**, y lo generado
vive dentro de él en vez de en un panel, una pestaña o una ventana aparte.

## El nombre

La carpeta y el repositorio son **AuraNote**. El mockup dice *SynapseNotes* porque fue
generado antes de decidir. Sin cerrar.
