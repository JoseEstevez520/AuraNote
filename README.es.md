<h1 align="center">La interfaz que una nota merece no se diseña de antemano: emerge de lo que escribes</h1>

<p align="center">
  <strong>AuraNote convierte el fragmento que seleccionas en la interfaz que merece: una sección viva construida con tu propia librería de componentes, o un artefacto interactivo aislado en un sandbox.</strong>
</p>

<p align="center">
  Una app de notas para estudiar — cosas para ver, y cosas para tocar.
</p>

<p align="center">
  <a href="docs/concepto.md"><img src="https://img.shields.io/badge/Docs-Read-2563eb?style=flat-square&logo=readthedocs&logoColor=white" alt="Documentación de AuraNote"></a>
</p>

<p align="center">
  <a href="docs/desarrollo.md">Ejecutar en local</a> ·
  <a href="README.md">English</a>
</p>

<p align="center">
  <img src="docs/assets/mockup-concepto.png" alt="Una nota de estudio cuyos fragmentos se convierten en un mapa, una línea temporal y un widget interactivo" width="100%">
</p>

## Qué es AuraNote

Las notas de estudio suelen acabar en uno de dos sitios: texto plano que relees, o un muro
de widgets prediseñados esperando a que aparezca su palabra clave. Ninguno reacciona a lo
que el fragmento realmente es. AuraNote apuesta por lo contrario: la interfaz no está
prediseñada, se genera a partir del contenido que acabas de escribir.

Escribes normal. Seleccionas un fragmento, pulsas **Generar**, y el documento convierte ese
texto en la interfaz que merece. Escribes sobre un viaje a Lisboa y obtienes un mapa con la
ruta y un itinerario; escribes "simulador de tiro parabólico" y obtienes un simulador
interactivo con su trayectoria. Mismo gesto, resultado distinto, porque el texto es la
materia prima de la interfaz. No hay chat lateral, ni resumen, ni corrector, ni un menú de
"insertar bloque": la UI nace del documento, no se pega encima.

## Cómo funciona

Un gesto, dos resultados. Al pulsar **Generar**, un router pequeño (gpt-4.1-mini) decide cuál
aporta más valor, sin que elijas tú entre opciones. El modelo grande (gpt-4.1) solo genera
cuando de verdad hace falta. Ante la duda, el router elige sección.

|                | Sección                          | Artefacto (widget)                     |
| -------------- | -------------------------------- | -------------------------------------- |
| **Cuándo**     | VER: mostrar / organizar info    | HACER: interactuar, o visual a medida  |
| **Ejemplos**   | mapa, itinerario, comparación    | simulador, quiz, diagrama, modelo      |
| **Salida**     | `openui-lang` → tu librería      | HTML libre                             |
| **Render**     | componentes Vue nativos          | `<iframe sandbox>`                     |
| **Garantía**   | siempre encaja con el diseño     | puede ser cualquier cosa               |

La sección muestra; el artefacto se toca. La tesis técnica es usar el modelo más pequeño que
resuelva cada tarea: el router mini clasifica y enruta, el modelo grande solo genera cuando
se le pide.

## Qué puedes hacer hoy

- **Genera una sección** a partir de un fragmento seleccionado, renderizada con la librería
  de componentes Vue nativos (mapas, líneas de tiempo, tablas, tarjetas, stats) vía
  `@openuidev/vue-lang`.
- **Genera un artefacto** como HTML interactivo autocontenido — un simulador, quiz o
  diagrama — aislado en un iframe sandbox bajo el párrafo que seleccionaste.
- **Deja que el modelo enrute** cada petición entre sección y artefacto con gpt-4.1-mini,
  cayendo a sección ante la duda.
- **Mantén todo en el documento**: los bloques generados se guardan en el JSON de TipTap y
  sobreviven a una recarga, autoguardados en `localStorage`.
- **Cambia de idioma** en tiempo de ejecución entre inglés y español; la UI lo resuelve desde
  tu elección, el navegador, y luego inglés.

## Stack

| Capa       | Elección                          | Notas                                              |
| ---------- | --------------------------------- | -------------------------------------------------- |
| Front      | Vue 3 + Vite + TipTap             | Editor tipo Notion con node views y decorations    |
| Estilos    | Tailwind + Motion                 | Sistema propio                                      |
| Generar    | **gpt-4.1**                       | Secciones y artefactos                             |
| Router     | **gpt-4.1-mini**                  | Decide sección vs. artefacto                        |
| Renderer   | `@openuidev/vue-lang`             | El prompt sale de tu propia librería               |
| Mapas      | **Stadia** (Alidade Smooth)       | Estilo iOS; respaldo Esri sin key                  |
| Imágenes   | **Unsplash**                      | Fotos en secciones y artefactos                    |
| Iconos     | **Lucide** (incrustados)          | Offline, por `data-icon`                           |
| Back       | Ninguno (proxy dev para las keys) |                                                    |

## Ejecutarlo en local

Requiere Node 24.

```bash
npm install
cp .env.example .env   # rellena tus claves
npm run dev
```

Guía completa, propiedad de directorios y páginas de prueba en
[docs/desarrollo.md](docs/desarrollo.md).

## Documentación

- [Concepto](docs/concepto.md): la idea, los dos niveles, qué **no** es.
- [Arquitectura](docs/arquitectura.md): pipeline y decisiones técnicas razonadas.
- [Componentes](docs/componentes.md): la librería que el modelo puede componer.
- [Interacción](docs/interaccion.md): cuándo generar ayuda y cuándo estorba.
- [UX](docs/ux.md): cuándo generar, reglas anti-molestia.
- [Diseño](docs/diseno.md): tokens, los dos registros visuales, movimiento.
- [Agentes](docs/agentes.md): arquitectura agentizada — director + especialistas.
- [Decisiones](docs/decisiones.md): lo decidido **y lo descartado**.
- [Referencias](docs/referencias.md): OUI-1, Disco, GLiNER, TipTap.
- [Desarrollo](docs/desarrollo.md): cómo ejecutarlo y propiedad de directorios.
- [Roadmap](ROADMAP.md): fases con criterios de "listo".

## Estado

Prueba de concepto privada, funcionando de punta a punta: un gesto **Generar** que el modelo
enruta; secciones con mapa iOS, fotos y composición; artefactos interactivos (simulador,
quiz, diagrama); sugerencias ambiente al cerrar un párrafo. Es una exploración de una forma
de interactuar al servicio del estudio, no un producto cerrado, y todavía no es open source.
