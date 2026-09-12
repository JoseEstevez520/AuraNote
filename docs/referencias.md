# Referencias

## OUI-1 — el modelo del nivel 1

Primer modelo de pesos abiertos para Generative UI. Finetune de DiffusionGemma 26B-A4B
(26B totales, 4B activos). Apache 2.0. Septiembre de 2026.

71.7% en Generative UI Bench, por encima de Gemma 4 31B (46.7%) con 8× menos parámetros
activos. Difusión por bloques: 256 tokens de golpe, 48 pasos de denoising, ~1 s por
pantalla simple.

- [Anuncio oficial](https://www.openui.com/blog/oui-1)
- [Pesos en Hugging Face](https://huggingface.co/thesysdev/OUI-1)
- [Cuantizaciones GGUF](https://huggingface.co/Abiray/OUI-1-GGUF)
- [Documentación de openui-lang](https://openui.com/docs/openui-lang)
- [Thesys C1 — API hospedada y precios](https://www.thesys.dev/pricing)
- [Discusión en Hacker News](https://news.ycombinator.com/item?id=49613182)

> ⚠️ Modelo muy reciente. La documentación de `openui-lang` está incompleta y el tooling
> tiene aristas. Bien para experimentar; no esperes que todo esté pulido.

### Paquetes

| Paquete                  | Para qué                          |
| ------------------------ | --------------------------------- |
| `@openuidev/react-lang`  | Renderer (hay versiones Vue y Svelte) |
| `@openuidev/lang-core`   | Validación de `openui-lang`       |

---

## Google Disco / GenTabs — el referente del nivel 2

Experimento de Google Labs (diciembre de 2025): un navegador que coge tus pestañas
abiertas y, con Gemini 3, las remezcla en una aplicación interactiva a medida —
un plan de comidas, un itinerario de viaje, lo que sea. No un resumen: una app.

Es exactamente el nivel 2, pero aplicado al navegador entero en vez de a un documento.

- [Anuncio en blog.google](https://blog.google/innovation-and-ai/models-and-research/google-labs/gentabs-gemini-3/)
- [9to5Google](https://9to5google.com/2025/12/11/google-disco-gentab-browser/)
- [Android Central](https://www.androidcentral.com/apps-software/ai/googles-disco-experiment-is-an-ai-browser-that-turns-your-tabs-into-mini-apps)

---

## GLiNER — aplazado

Generalist and Lightweight NER. Transformer bidireccional tipo BERT que hace NER
**zero-shot**: le pasas las etiquetas que quieras y las encuentra aunque no estuvieran
en su entrenamiento. Diseñado para CPU, hardware de consumo, cuantización y ONNX.

```python
from gliner import GLiNER

model = GLiNER.from_pretrained("gliner-community/gliner_small-v2.5")

entities = model.predict_entities(
    "El viernes voy a Lisboa para JunctionX.",
    ["lugar", "fecha", "evento"],
    threshold=0.5,
)
```

Las versiones actuales van más allá del NER: extracción de relaciones, detección de PII,
clasificación, NER en streaming. Admite fine-tuning con datos propios.

- [Repositorio](https://github.com/urchade/GLiNER)
- [Modelos en Hugging Face](https://huggingface.co/gliner-community)

Ver [decisión 8](decisiones.md) sobre por qué está fuera de la v1.

---

## Herramientas

| Qué                | Para qué                                    |
| ------------------ | ------------------------------------------- |
| [TipTap](https://tiptap.dev/) | Editor. Node views y decorations |
| [ProseMirror](https://prosemirror.net/) | La base sobre la que va TipTap |
| [Leaflet](https://leafletjs.com/) | Mapas, sin API key            |
| [Tailwind](https://tailwindcss.com/) | Estilos                      |

---

## Origen

La idea salió de una conversación previa sobre modelos pequeños y especializados.
Está en [conversacion-original.md](conversacion-original.md) — sin editar, incluyendo
el prompt que generó el mockup.
