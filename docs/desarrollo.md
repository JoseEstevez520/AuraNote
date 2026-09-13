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

- **Todo dentro de la columna de 972px** (`.note-column`). Sin bordes, sin sombras,
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

## Idiomas

La interfaz está en inglés y español. **El idioma no va en `.env`**: `.env` es de tiempo
de compilación y esto es de tiempo de ejecución. El orden de resolución es:

1. Lo que el usuario eligió, guardado en `localStorage`
2. El idioma del navegador (`navigator.language`)
3. **Inglés** como último recurso

El selector vive abajo a la derecha. Las cadenas están en `src/i18n/{en,es}.js` y se
usan con `textos.algo.otro` desde las vistas.

Con ~40 cadenas, `vue-i18n` sería más peso que valor: `src/i18n/index.js` son cuarenta
líneas. Si el proyecto crece, se cambia sin tocar las vistas.

**Los prompts van siempre en inglés**, independientemente de la interfaz: los modelos
rinden mejor y evita mantener dos juegos. Llevan la instrucción explícita de escribir
el texto visible en el idioma del fragmento.


