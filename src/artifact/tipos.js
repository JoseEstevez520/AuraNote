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

const DIAGRAM = String.raw`REQUIRED TYPE: DIAGRAM.

Draw an inline SVG that makes the idea visible. There are two kinds; pick the right one.

A) ILLUSTRATIVE — when the subject exists in the real world (a natural cycle, a piece of
   anatomy, how a machine works, a physical process, a scene). DRAW THE ACTUAL THING,
   not abstract boxes. This is where you use full colour, gradients and custom shapes.
   Method: decompose the subject into parts and build each from primitive shapes:
     · a sun  = a circle (radial-gradient fill) + short <line> rays
     · a cloud = 3-4 overlapping <ellipse>s
     · a mountain = a <polygon> + a small snow-cap <polygon>
     · water = a <path> wavy top over a filled rect, in blues
   Add labels near each part and coloured arrows for each process/flow (a <marker> in
   <defs>, reused). Give it depth: gradients, layered shapes, a subtle background wash
   appropriate to the subject. A water cycle should look like a little landscape, not a
   flowchart.

B) STRUCTURAL — only when the relationship is genuinely abstract (an org chart, a
   software architecture, a decision tree). Then rounded-rect nodes + arrows are right,
   kept clean: node fill var(--surface), stroke var(--rule), one accent node at most.

Either way, layout discipline:
- Plan positions before drawing. Nothing overlaps that should not; leave breathing room.
- Use <svg viewBox="0 0 W H" width="100%" style="max-width:100%;height:auto"> and keep
  EVERY coordinate inside the viewBox with a small margin. Out-of-viewBox output is the
  most common failure — check your extremes.
- Text via <text>, min 12px, readable against whatever is behind it.
- One <marker> in <defs> for arrowheads, reused. Never leave a dangling arrow that
  points at nothing.
- Paths and gradients are allowed and encouraged for illustrations; keep individual
  paths simple (a handful of points), compose complexity from many simple shapes.

Do not hand back a bulleted list dressed up as a diagram.`

const SIMULATION = String.raw`REQUIRED TYPE: SIMULATION.

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

const MODEL = String.raw`REQUIRED TYPE: MANIPULABLE MODEL.

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

const QUIZ = String.raw`REQUIRED TYPE: QUIZ / SELF-TEST.

Build an interactive self-test to study the concept in the fragment. It must let the
user actually practise, not just read.

- 4-6 questions drawn from the concept: multiple choice (one correct) or true/false.
  Write real, specific questions and options about the topic — never placeholders.
- Immediate feedback on answering: mark right/wrong, and show a one-line explanation of
  why. Do not reveal the answer before the user picks.
- Track score and show it at the end, with a "retry" that resets.
- One question visible at a time OR a clean vertical list; keep it calm and legible.
- All logic self-contained in JS. Chrome sober (Notion-like); accent only on the
  selected/correct state. Use <span data-icon="check"></span> / "x" for feedback marks.

This is for studying, so accuracy of the content matters as much as the interaction.`

export const TIPOS = [
  { id: 'auto', clave: 'auto', directiva: '' },
  { id: 'diagrama', clave: 'diagram', directiva: DIAGRAM },
  { id: 'simulacion', clave: 'simulation', directiva: SIMULATION },
  { id: 'modelo', clave: 'model', directiva: MODEL },
  { id: 'quiz', clave: 'quiz', directiva: QUIZ },
]

export const porId = (id) => TIPOS.find((t) => t.id === id) ?? TIPOS[0]
