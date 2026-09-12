// Tipos de artefacto.
//
// El clic normal en "Artefacto" usa 'auto': el modelo decide. El desplegable
// permite dirigirlo cuando ya sabes qué quieres. Cada tipo añade una directiva
// al system prompt; no cambia nada más del flujo.
//
// La idea de fondo: el artefacto solo se justifica si NO se puede hacer con la
// librería de src/ui/. Si el resultado es una lista o una tabla, ese trabajo
// es del nivel 1. Ver docs/interaccion.md

export const TIPOS = [
  {
    id: 'auto',
    etiqueta: 'Automático',
    descripcion: 'El modelo decide',
    directiva: '',
  },
  {
    id: 'diagrama',
    etiqueta: 'Diagrama',
    descripcion: 'SVG: nodos, flechas, jerarquías',
    directiva: `TIPO EXIGIDO: DIAGRAMA.
Dibuja un diagrama en SVG inline: nodos, aristas, jerarquías, flujos o relaciones.
Geometría de verdad, no cajas de HTML apiladas una debajo de otra.
- Usa viewBox y preserveAspectRatio para que escale con el ancho disponible.
- Texto dentro del SVG con <text>, tamaño mínimo 12px, legible.
- Trazos de 1.5px, esquinas redondeadas, la paleta de tokens.
- Puede tener interacción ligera: resaltar un nodo al pasar por encima.
No entregues una lista con viñetas disfrazada de diagrama.`,
  },
  {
    id: 'simulacion',
    etiqueta: 'Simulación',
    descripcion: 'Parámetros que recalculan',
    directiva: `TIPO EXIGIDO: SIMULACIÓN.
Construye algo con parámetros que el usuario cambia y un resultado que se
recalcula en vivo: sliders, inputs numéricos, selects.
- Parte SIEMPRE de valores por defecto razonables ya rellenos, nunca vacíos.
- El resultado se actualiza al instante, sin botón de "calcular".
- Muestra el cálculo, no solo el número final: qué suma, qué multiplica.
Si no hay nada que calcular en el fragmento, elige las variables que tendrían
sentido y explícalas.`,
  },
  {
    id: 'modelo',
    etiqueta: 'Modelo manipulable',
    descripcion: 'Reordenar, arrastrar, activar',
    directiva: `TIPO EXIGIDO: MODELO MANIPULABLE.
Construye algo que se toca: elementos que se reordenan, se arrastran, se activan
o se conectan, y cuyo efecto se ve al momento.
- Empieza con un estado inicial ya montado y con sentido, no vacío.
- El cambio se refleja de inmediato en el resto de la interfaz.
- Arrastrar con drag & drop nativo o con eventos de puntero, sin librerías.`,
  },
]

export const porId = (id) => TIPOS.find((t) => t.id === id) ?? TIPOS[0]
