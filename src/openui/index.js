// Usamos el renderer oficial: @openuidev/vue-lang.
//
// Hubo un parser propio aquí. Se retiró al comprobar contra los paquetes
// oficiales que openui-lang usa argumentos POSICIONALES, no con nombre:
// el prompt generado dice literalmente que la sintaxis con dos puntos
// "is NOT supported and silently breaks". El parser casero soportaba
// justo esa forma, así que no era un plan B: era incorrecto.
//
// La librería vive en src/ui/library.js. Ver docs/decisiones.md
export { Renderer } from '@openuidev/vue-lang'
export { library } from '../ui/library.js'
