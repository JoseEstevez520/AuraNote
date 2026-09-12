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

--radius-sm: 8px;
--radius-md: 12px;             /* por defecto */
--radius-lg: 16px;
```

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
