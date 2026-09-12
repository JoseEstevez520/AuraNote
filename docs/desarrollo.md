# Desarrollo

```bash
npm install
npm run dev
```

## Estructura y propiedad de directorios

El trabajo está repartido en áreas que **no se solapan**. Cada una es autónoma y
verificable por su cuenta.

| Directorio      | Área                     | Contenido                                              |
| --------------- | ------------------------ | ------------------------------------------------------ |
| `src/editor/`   | El documento             | TipTap, estilos Notion, autoguardado, barra de selección |
| `src/ui/`       | Librería de componentes  | Las piezas que OUI-1 puede componer                    |
| `src/openui/`   | Renderer                 | Parser de `openui-lang` → componentes Vue              |
| `src/artifact/` | Nivel 2                  | Nodo de artefacto, iframe sandbox, cliente del modelo  |
| `src/styles/`   | Lenguaje visual          | Tokens y la columna del documento                      |

`src/App.vue` es el punto de integración: une las áreas cuando cada una funciona sola.

## Convenciones

- **Todo dentro de la columna de 720px** (`.note-column`). Sin bordes, sin sombras,
  sin cards. Ver [ux.md](ux.md).
- Tokens de color desde `src/styles/main.css`: `ink`, `ink-muted`, `ink-faint`,
  `accent`, `rule`. Nada de colores sueltos de Tailwind para texto.
- Alias `@` → `src/`.
- Vue 3 `<script setup>`.
- Comentarios y nombres de cara al usuario en español.

## Páginas de prueba

Vite sirve en desarrollo cualquier `.html` de la raíz, así que cada área puede tener su
banco de pruebas aislado sin tocar la app:

| Página                | Para qué                                        |
| --------------------- | ----------------------------------------------- |
| `/`                   | La aplicación                                   |
| `/ui-demo.html`       | La librería de componentes, sin modelos          |
| `/openui-demo.html`   | El renderer oficial + el system prompt generado  |

Esa separación es deliberada: permite saber si un fallo viene del renderer o del modelo.
Ver [roadmap](../ROADMAP.md), fase 4.

## Antes de dar algo por terminado

```bash
npm run build
```

## Claves

Copia `.env.example` a `.env`. Nunca se suben: `.gitignore` bloquea todo `.env*`.
