// Artifact types.
//
// A plain click on "Artifact" uses 'auto' and lets the model decide. The
// dropdown lets you steer it when you already know what you want. Each type
// only appends a directive to the system prompt — nothing else in the flow
// changes.
//
// The underlying idea: an artifact is only justified when it CANNOT be built
// from the component library in src/ui/. If the answer is a list or a table,
// that is the section level's job. See docs/interaccion.md
//
// The directives below encode findings from published practice on LLM SVG and
// interactive-artifact generation — see docs/referencias.md:
//   · Pin the coordinate space explicitly; out-of-viewBox output is the single
//     most common failure.
//   · Prefer primitive shapes over <path>; models are unreliable with curve data.
//   · Show a skeleton of the expected structure (few-shot beats description).
//   · Plan the layout before emitting markup.

const DIAGRAM = `REQUIRED TYPE: DIAGRAM.

Draw an inline SVG diagram: nodes, edges, hierarchies, flows or relationships.
Real geometry — not HTML boxes stacked on top of each other.

Before writing any markup, plan the layout: list the nodes, decide their
columns and rows, and only then assign coordinates.

Coordinate rules (this is where these diagrams usually fail):
- Use exactly: <svg viewBox="0 0 800 H" width="100%" style="max-width:100%;height:auto">
  where H is the height you actually need.
- EVERY x coordinate must fall between 20 and 780. EVERY y between 20 and H-20.
  Never emit negative coordinates.
- Leave at least 40px of horizontal and 30px of vertical space between node
  boxes. Nothing may overlap.
- Size each box to its label: roughly 9px per character, minimum 110px wide.

Shape rules:
- Use <rect rx="10">, <line>, <circle>, <polyline> and <text>. Do NOT use <path>
  unless a curve is genuinely required — coordinate data in paths is error-prone.
- Arrowheads go through a single <marker> defined once in <defs>.
- Labels: <text> with text-anchor="middle" and dominant-baseline="middle",
  font-size 13, font-family inherit. Never smaller than 12.
- Strokes 1.5px. Node fill var(--surface), stroke var(--rule), text var(--ink).
  Accent colour only to highlight one node, never all of them.

Skeleton to follow:

  <svg viewBox="0 0 800 260" width="100%" style="max-width:100%;height:auto">
    <defs>
      <marker id="a" viewBox="0 0 10 10" refX="9" refY="5"
              markerWidth="6" markerHeight="6" orient="auto-start-reverse">
        <path d="M0,0 L10,5 L0,10 z" fill="#9b9a97"/>
      </marker>
    </defs>
    <rect x="40" y="90" width="160" height="56" rx="10"
          fill="#fbfbfa" stroke="#e9e9e7"/>
    <text x="120" y="118" text-anchor="middle" dominant-baseline="middle"
          font-size="13" fill="#37352f">Label</text>
    <line x1="200" y1="118" x2="300" y2="118"
          stroke="#9b9a97" stroke-width="1.5" marker-end="url(#a)"/>
  </svg>

Light interaction is welcome: highlight a node on hover.
Do not hand back a bulleted list dressed up as a diagram.`

const SIMULATION = `REQUIRED TYPE: SIMULATION.

Build something with parameters the user changes and a result that recomputes
live: sliders, number inputs, selects.

- ALWAYS start from sensible pre-filled defaults. Never an empty form.
- The result updates on 'input', instantly. No "calculate" button.
- Show the working, not just the final number: which values are summed,
  multiplied or divided. The user must be able to see why the number moved.
- Label every control with its unit.
- Range sliders show their current value next to the label.
- Keep it to 3-6 parameters. More becomes a form, and a form is not a simulation.

If the fragment contains no obvious numbers, pick the variables that would
matter, state the assumption you made, and let the user change it.`

const MODEL = `REQUIRED TYPE: MANIPULABLE MODEL.

Build something the user handles directly: items that reorder, drag, toggle
or connect, with the effect visible immediately.

- Start from an initial state that is already assembled and meaningful, never
  empty.
- Every change reflects instantly in the rest of the interface — a count, a
  total, a summary line.
- Drag and drop with the native HTML API or pointer events. No libraries.
- Provide a keyboard path too (arrow keys or move up/down buttons): drag-only
  is unusable for some people.
- Make drop targets obvious on hover.`

export const TIPOS = [
  { id: 'auto', clave: 'auto', directiva: '' },
  { id: 'diagrama', clave: 'diagram', directiva: DIAGRAM },
  { id: 'simulacion', clave: 'simulation', directiva: SIMULATION },
  { id: 'modelo', clave: 'model', directiva: MODEL },
]

export const porId = (id) => TIPOS.find((t) => t.id === id) ?? TIPOS[0]
