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

- una **sección compuesta** — mapa de Lisboa, línea temporal jueves→viernes→JunctionX,
  sugerencias costeras — montada con tus componentes, en un segundo; o
- un **artefacto** — una aplicación interactiva de verdad, código libre, lo que el
  modelo considere útil.

Y si en vez de eso hubieras escrito *"estoy comparando Spring Boot y FastAPI"*, la
misma acción produce una comparativa. **Texto distinto, interfaz distinta.**

## Los dos niveles

Ambos operan sobre **un fragmento seleccionado**. Es el mismo gesto en dos ambiciones.

```
                    FRAGMENTO SELECCIONADO
                            │
              ┌─────────────┴─────────────┐
              ↓                           ↓
      "conviértelo en            "conviértelo en
          una sección"             una aplicación"
              │                           │
           OUI-1                    Modelo grande
        (4B, difusión)                 (API)
              │                           │
        openui-lang                  código libre
              │                           │
       tus componentes              iframe sandbox
              │                           │
            ~1 s                       10-30 s
              │                           │
     siempre encaja con         puede ser cualquier
        tu diseño                       cosa
```

### Por qué dos y no uno

Si ambos generasen lo mismo, el nivel 2 sería "el nivel 1 pero más lento". El contraste
**es** el producto:

> Tu librería de componentes es el vocabulario del documento.
> El artefacto es la fuga de ese vocabulario.

El nivel 1 es la red de seguridad: lo cotidiano siempre se ve bien porque son tus
piezas. El nivel 2 es la ambición: aislado en un sandbox, puede intentar cualquier cosa.

## Por qué modelos pequeños

La tesis técnica del proyecto: **usar el modelo más pequeño que resuelva cada tarea**.

OUI-1 tiene 4B de parámetros activos y es de difusión, no autoregresivo — genera bloques
de 256 tokens partiendo de ruido, así que una pantalla llega en ~1 segundo. Eso hace
viable generar interfaz *como parte de la interacción*, no como algo que esperas.

El modelo grande solo aparece cuando pides algo ambicioso, y entonces sí se le perdona
tardar 20 segundos porque lo has pedido explícitamente.

## Referentes

- **Google Disco / GenTabs** (Labs, dic 2025) — Gemini 3 remezcla tus pestañas abiertas
  en aplicaciones a medida. Es el nivel 2 llevado al navegador entero.
- **Artifacts de Claude** — código generado que se renderiza y persiste.
- **Notion** — el lenguaje visual. Columna estrecha, mucho blanco, controles en hover.

La diferencia con todos ellos: aquí el contenedor es **el documento**, y lo generado
vive dentro de él en vez de en un panel, una pestaña o una ventana aparte.

## El nombre

La carpeta y el repositorio son **AuraNote**. El mockup dice *SynapseNotes* porque fue
generado antes de decidir. Sin cerrar.
