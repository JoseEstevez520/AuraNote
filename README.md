# AuraNote

> Un documento cuya interfaz no está prediseñada: emerge de lo que escribes.

![Concepto](docs/assets/mockup-concepto.png)

## Qué es

Una app de **notas para estudiar** donde el contenido genera la interfaz. No resume ni
corrige ni hay un chat lateral: seleccionas un fragmento, pulsas **Generar**, y el
documento lo convierte en la interfaz que ese texto merece. Escribes sobre un viaje a
Lisboa → un mapa con la ruta y un itinerario; escribes "simulador de tiro parabólico" →
un simulador interactivo con su trayectoria. Mismo gesto, resultado distinto, porque
**el texto es la materia prima de la interfaz**.

```
ESCRIBES  →  el modelo LO ENTIENDE  →  GENERA  →  EXPLORAS / TOCAS
```

## Un gesto, dos resultados — lo decide el modelo

Seleccionas texto, pulsas **Generar**, y un router pequeño decide qué aporta más valor,
sin que elijas tú entre opciones:

|                | Sección                          | Artefacto (widget)                     |
| -------------- | -------------------------------- | -------------------------------------- |
| **Cuándo**     | VER: mostrar/organizar info      | HACER: interactuar, o VISUAL a medida  |
| **Ejemplos**   | mapa, itinerario, comparación    | simulador, quiz, diagrama, modelo      |
| **Salida**     | `openui-lang` → tu librería      | HTML libre                             |
| **Render**     | componentes Vue nativos          | `<iframe sandbox>`                     |
| **Garantía**   | siempre encaja con el diseño     | puede ser cualquier cosa               |

> La sección muestra; el artefacto se toca. El router elige; ante la duda, sección.

## Stack

| Capa       | Elección                          | Notas                                              |
| ---------- | --------------------------------- | -------------------------------------------------- |
| Front      | Vue 3 + Vite + TipTap             | Editor Notion con node views y decorations         |
| Estilos    | Tailwind + Motion                 | Sistema propio (inspirado en Crayon, de OpenUI)    |
| Generar    | **gpt-4.1** (contenido)           | Secciones y artefactos                             |
| Router     | **gpt-4.1-mini**                  | Decide sección/artefacto y sugerencias ambiente    |
| Renderer   | `@openuidev/vue-lang`             | Oficial de OpenUI; el prompt sale de tu librería   |
| Mapas      | **Stadia** (Alidade Smooth)       | Estilo iOS; respaldo Esri sin key                  |
| Imágenes   | **Unsplash**                      | Fotos en secciones y artefactos                    |
| Iconos     | **Lucide** (incrustados)          | Offline, por `data-icon`                           |
| Back       | Ninguno (proxy dev para las keys) |                                                    |

## Documentación

| Documento                                        | Contenido                                          |
| ------------------------------------------------ | -------------------------------------------------- |
| [Concepto](docs/concepto.md)                     | La idea, los dos niveles, qué **no** es            |
| [Arquitectura](docs/arquitectura.md)             | Pipeline y decisiones técnicas razonadas           |
| [Componentes](docs/componentes.md)               | La librería que OUI-1 puede componer               |
| [UX](docs/ux.md)                                 | Cuándo generar, reglas anti-molestia               |
| [Diseño](docs/diseno.md)                         | Tokens, los dos registros visuales, movimiento     |
| [Agentes](docs/agentes.md)                       | Arquitectura agentizada: director + especialistas  |
| [Decisiones](docs/decisiones.md)                 | Registro de lo decidido **y lo descartado**        |
| [Roadmap](ROADMAP.md)                            | Fases con criterios de "listo"                     |
| [Referencias](docs/referencias.md)               | OUI-1, Disco, GLiNER, TipTap                       |
| [Conversación original](docs/conversacion-original.md) | De dónde salió todo esto                     |

## Estado

🌿 **Funcionando de punta a punta.** Un gesto "Generar" que el modelo enruta; secciones
con mapa iOS, fotos y composición; artefactos interactivos (simulador, quiz, diagrama);
sugerencias ambiente al cerrar párrafo. Checkpoint etiquetado en `v0.1-genui-notes`.
Exploración de una forma de interactuar al servicio del estudio — no un producto cerrado.

## Tesis técnica

Usar **el modelo más pequeño que resuelva cada tarea**: un router de gpt-4.1-mini decide
y clasifica; el modelo grande solo genera cuando hace falta. La interactividad entra solo
cuando ayuda a **comprender** o **experimentar** con lo que estudias. Ver
[interacción](docs/interaccion.md) y [decisiones](docs/decisiones.md).
