# Sistema de diseño

> Fuente única de verdad. Los tokens viven en `src/styles/main.css` y se replican
> literalmente en el prompt del artefacto (`src/artifact/client.js`).
> **Si cambian en un sitio, cámbialos en el otro.**

## Dos registros

AuraNote mezcla dos cosas que deben verse distintas:

| | **El documento** | **Lo generado** |
| --- | --- | --- |
| Qué es | prosa | interfaz |
| Referencia | Notion | sistema de componentes moderno |
| Cajas | ninguna | superficies con borde y radio |
| Objetivo | que el texto no compita con nada | que parezca producto |

El contraste **es** la señal. Comunica "esto lo generó el documento" sin necesidad de
etiquetas, badges ni bordes de color.

> Esto revisa la regla original de "sin bordes, sin sombras, sin cards" de
> [ux.md](ux.md): sigue valiendo para la prosa, no para lo generado.

## Tokens

```css
--color-ink: #37352f;          /* texto principal, NUNCA negro puro */
--color-ink-muted: #6b6a66;    /* secundario */
--color-ink-faint: #9b9a97;    /* terciario, etiquetas */

--color-accent: #2383e2;       /* azul, SOLO interacción */
--color-accent-hover: #1a6dc0;
--color-accent-soft: #eff6fd;

--color-rule: #e9e9e7;         /* bordes, 1px */
--color-rule-strong: #dcdcd9;
--color-surface: #fbfbfa;      /* superficie elevada */
--color-surface-hover: #f4f4f2;

--radius-sm: 6px;   /* controles: botones, ítems de menú */
--radius-md: 10px;  /* superficies y tarjetas */
--radius-lg: 16px;  /* contenedores grandes */
```

## De dónde sale

**OpenUI no distribuye componentes** — su paquete de Vue trae un CSS de 76 bytes con
un único `@keyframes`. Los componentes de sus demos son **Crayon**
([`@crayonai/react-ui`](https://github.com/thesysdev/crayon), MIT), el kit propio de
Thesys, y es solo React.

Así que el sistema es nuestro, pero con dos cosas tomadas de Crayon tras leer su CSS:

- **La escala de radios** (6/10/16), más contenida que los 12px de partida.
- **El patrón del conector** en `Steps` y `Timeline`: el círculo y la línea son
  hermanos dentro de una columna y la línea crece con `flex-grow`. La versión anterior
  posicionaba la línea en absoluto y el número se descentraba en cuanto el texto del
  paso cambiaba de alto.

## Primitivas

| Clase | Para qué |
| --- | --- |
| `.note-column` | La columna del documento, 720px, con padding responsivo |
| `.ui-surface` | Superficie base de cualquier pieza generada |
| `.ui-interactive` | Superficie accionable, con hover |
| `.ui-eyebrow` | Etiqueta en versalitas para encabezar agrupaciones |

## Reglas

- **Sin degradados, sin neón, sin colores saturados.** Fondo del documento: blanco.
- **El azul solo donde se puede actuar.** Nunca títulos azules ni cabeceras de color.
- **Sombras: ninguna, o `0 1px 2px rgba(15,15,15,.04)`.** La jerarquía se hace con
  superficie y espacio, no con elevación.
- **Pesos tipográficos hasta 600.** Nada de 700+ salvo en el título del documento.
- **Espaciado generoso**: 16px dentro de las piezas, 12-16px entre ellas.
- **Sin emojis decorativos.** Iconos como SVG inline de trazo 1.4px.

## Movimiento

Con [Motion](https://motion.dev) (`motion-v`). Discreto: acompaña, no llama la atención.

| Dónde | Qué |
| --- | --- |
| Barra de selección | entrada 160 ms, `opacity` + `y` + `scale` |
| Bloque generado | entrada 350 ms, `opacity` + `y: 8` |
| Estado de carga | punto de acento pulsando a 1,4 s |
| Hover | transiciones de color de 150 ms |

Curva estándar: `[0.22, 1, 0.36, 1]`.

## Responsive

- La columna baja de padding en móvil (`px-5` → `sm:px-6`).
- `Row` **envuelve** en lugar de desbordar: la columna es de 720px y no siempre caben
  dos piezas anchas.
- La barra de selección oculta las etiquetas de texto por debajo de `sm` y deja solo
  los iconos, con anti-desbordamiento de tippy activado.
- Los artefactos reciben la instrucción explícita de ser responsivos y no usar anchos
  fijos ni scroll horizontal.

## Cómo se lo damos al modelo

**Nivel 1** — no hace falta: solo puede usar los componentes de `src/ui/`, así que el
diseño está garantizado por construcción.

**Nivel 2** — el artefacto es código libre, así que los tokens y las reglas van
literalmente en el system prompt (constante `SISTEMA_DE_DISENO` en
`src/artifact/client.js`).


## Los artefactos: dos registros

Un artefacto mezcla dos cosas que deben verse distintas, y confundirlas era lo que hacía
que salieran pobres:

- **Chrome** (controles, paneles, botones): sobrio, como el documento. Tokens de arriba,
  sin degradados, sin color saturado.
- **Contenido** (un diagrama, una ilustración, una gráfica): libre. Color pleno,
  degradados, formas SVG a medida, `<path>`, profundidad. Un ciclo del agua tiene que
  parecer un paisaje, no un diagrama de flujo.

El contraste entre ambos es lo que hace que se vea diseñado. La primera versión aplicaba
las reglas sobrias del chrome también al contenido —"sin degradados, iconos de trazo
fino"— y por eso los diagramas salían en gris plano. Ver `src/artifact/client.js`.

### Diagramas: ilustrar, no encajonar

El prompt de diagrama (`src/artifact/tipos.js`) distingue dos casos:

- **Ilustrativo** — el tema existe en el mundo real (un ciclo, una anatomía, una
  máquina). Se dibuja *la cosa*, descomponiéndola en formas primitivas (sol = círculo +
  rayos; nube = elipses solapadas; montaña = polígono + cima nevada).
- **Estructural** — solo cuando la relación es abstracta (organigrama, arquitectura).
  Ahí sí, cajas redondeadas y flechas, pero limpias.

La versión anterior prohibía `<path>` y forzaba cajas para todo; por eso un "diagrama del
ciclo del agua" salía como cuatro rectángulos.

### Modelo

Los artefactos usan **gpt-5.2** (vía la clave de OpenAI). gpt-4o servía para el texto,
pero para SVG ilustrativo y composiciones ricas la diferencia es enorme. Tarda más
(1-3 min por artefacto), lo cual es aceptable para una acción deliberada. gpt-5 y la
serie o solo aceptan la temperatura por defecto, así que el cliente no la envía para
esos modelos.
