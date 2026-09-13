<h1 align="center">The interface a note deserves is not designed in advance — it emerges from what you write</h1>

<p align="center">
  <strong>AuraNote turns a passage you select into the interface it deserves: a live section built from your own component library, or a sandboxed interactive artifact.</strong>
</p>

<p align="center">
  A note-taking app for studying — things to see, and things to touch.
</p>

<p align="center">
  <a href="docs/concepto.md"><img src="https://img.shields.io/badge/Docs-Read-2563eb?style=flat-square&logo=readthedocs&logoColor=white" alt="AuraNote documentation"></a>
</p>

<p align="center">
  <a href="docs/desarrollo.md">Run locally</a> ·
  <a href="README.es.md">Español</a>
</p>

<p align="center">
  <img src="docs/assets/mockup-concepto.png" alt="A study note whose passages turn into a map, a timeline and an interactive widget" width="100%">
</p>

## What is AuraNote?

Study notes tend to end up in one of two places: plain text you reread, or a wall of
pre-built widgets waiting for their keyword to appear. Neither reacts to what the passage
actually is. AuraNote takes the opposite bet — the interface is not designed in advance, it
is generated from the content you just wrote.

You write normally. You select a fragment, you press **Generar**, and the document turns
that text into the interface it deserves. Write about a trip to Lisbon and you get a map
with the route and an itinerary; write "parabolic-shot simulator" and you get an
interactive simulator with its trajectory. Same gesture, different result, because the text
is the raw material of the interface. There is no side chat, no summariser, no corrector,
and no "insert block" menu: the UI is born from the document, not pasted on top of it.

## How it works

One gesture, two outcomes. When you press **Generar**, a small router (gpt-4.1-mini) decides
which one adds more value, so you never have to choose between options. The heavy model
(gpt-4.1) only generates when it is actually needed. When in doubt, the router picks a
section.

|              | Section                          | Artifact (widget)                       |
| ------------ | -------------------------------- | --------------------------------------- |
| **When**     | SEE: show / organise information | DO: interact, or a bespoke visual       |
| **Examples** | map, itinerary, comparison       | simulator, quiz, diagram, model         |
| **Output**   | `openui-lang` → your library     | free-form HTML                          |
| **Render**   | native Vue components            | `<iframe sandbox>`                       |
| **Guarantee**| always fits the design system    | can be anything                         |

The section shows; the artifact is touched. The technical thesis is to use the smallest
model that solves each task: the mini router classifies and routes, the large model only
generates on demand.

## What you can do today

- **Generate a section** from a selected passage, rendered with the native Vue component
  library (maps, timelines, tables, cards, stats) via `@openuidev/vue-lang`.
- **Generate an artifact** as self-contained interactive HTML — a simulator, quiz or
  diagram — isolated inside a sandboxed iframe under the paragraph you selected.
- **Let the model route** each request between section and artifact with gpt-4.1-mini,
  falling back to a section when unsure.
- **Keep everything in the document**: generated blocks are stored in the TipTap JSON and
  survive a page reload, autosaved to `localStorage`.
- **Switch language** at runtime between English and Spanish; the UI resolves it from your
  choice, the browser, then English.

## Stack

| Layer      | Choice                            | Notes                                              |
| ---------- | --------------------------------- | -------------------------------------------------- |
| Front      | Vue 3 + Vite + TipTap             | Notion-like editor with node views and decorations |
| Styles     | Tailwind + Motion                 | In-house system                                    |
| Generate   | **gpt-4.1**                       | Sections and artifacts                             |
| Router     | **gpt-4.1-mini**                  | Decides section vs. artifact                        |
| Renderer   | `@openuidev/vue-lang`             | Prompt derived from your own library               |
| Maps       | **Stadia** (Alidade Smooth)       | iOS look; Esri fallback with no key                |
| Images     | **Unsplash**                      | Photos in sections and artifacts                   |
| Icons      | **Lucide** (embedded)             | Offline, via `data-icon`                           |
| Back       | None (dev proxy for the keys)     |                                                    |

## Run it locally

Requires Node 24.

```bash
npm install
cp .env.example .env   # fill in your keys
npm run dev
```

Full guide, directory ownership and test pages in [docs/desarrollo.md](docs/desarrollo.md).

## Documentation

- [Concepto](docs/concepto.md): the idea, the two levels, and what it is **not**.
- [Arquitectura](docs/arquitectura.md): pipeline and reasoned technical decisions.
- [Componentes](docs/componentes.md): the library the model can compose.
- [Interacción](docs/interaccion.md): when generating helps and when it gets in the way.
- [UX](docs/ux.md): when to generate, anti-annoyance rules.
- [Diseño](docs/diseno.md): tokens, the two visual registers, motion.
- [Agentes](docs/agentes.md): agentised architecture — director + specialists.
- [Decisiones](docs/decisiones.md): what was decided **and what was ruled out**.
- [Referencias](docs/referencias.md): OUI-1, Disco, GLiNER, TipTap.
- [Desarrollo](docs/desarrollo.md): how to run it and directory ownership.
- [Roadmap](ROADMAP.md): phases with "done" criteria.

## Status

Private proof of concept, working end to end: one **Generar** gesture that the model routes;
sections with an iOS map, photos and composition; interactive artifacts (simulator, quiz,
diagram); ambient suggestions when a paragraph closes. It is an exploration of a way to
interact in service of studying, not a finished product, and it is not open source yet.
