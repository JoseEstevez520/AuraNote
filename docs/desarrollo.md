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
| `src/generate/` | Router de generación     | Decide sección o artefacto para el gesto "Generar"     |
| `src/ui/`       | Librería de componentes  | Las piezas que el modelo compone en una sección        |
| `src/section/`  | Sección (nivel 1)        | Nodo de sección, cliente del modelo, render con `@openuidev/vue-lang` |
| `src/artifact/` | Artefacto (nivel 2)      | Nodo de artefacto, iframe sandbox, cliente y pipeline  |
| `src/suggest/`  | Sugerencias ambiente     | Router al cerrar párrafo + extensión de TipTap         |
| `src/i18n/`     | Idiomas                  | Cadenas EN/ES y el resolutor                           |
| `src/styles/`   | Lenguaje visual          | Tokens y la columna del documento                      |

`src/App.vue` es el punto de integración: une las áreas.

## Convenciones

- **Todo dentro de la columna de 972px** (`.note-column`). Sin bordes, sin sombras,
  sin cards. Ver [ux.md](ux.md).
- Tokens de color desde `src/styles/main.css`: `ink`, `ink-muted`, `ink-faint`,
  `accent`, `rule`. Nada de colores sueltos de Tailwind para texto.
- Alias `@` → `src/`.
- Vue 3 `<script setup>`.
- Comentarios y nombres de cara al usuario en español.

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


