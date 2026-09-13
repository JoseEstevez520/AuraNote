<script setup>
// Mapa con Leaflet + OpenStreetMap (sin API key).
// `place` se geocodifica con Nominatim; si se pasan `lat`/`lng` directos se usan esos.
// `markers[]` acepta { place } o { lat, lng, label }.
import { onMounted, onBeforeUnmount, ref, watch, nextTick } from 'vue'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png'
import markerIcon from 'leaflet/dist/images/marker-icon.png'
import markerShadow from 'leaflet/dist/images/marker-shadow.png'

// Bug conocido: con bundlers (Vite/webpack) Leaflet no encuentra las rutas por
// defecto de los iconos porque usa `import.meta.url` relativo. Se fuerzan a mano.
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
})

const props = defineProps({
  place: { type: String, default: '' },
  lat: { type: [String, Number], default: null },
  lng: { type: [String, Number], default: null },
  zoom: { type: [String, Number], default: 12 },
  markers: { type: Array, default: () => [] }, // { place } | { lat, lng, label }
})

const contenedor = ref(null)
const cargando = ref(true)
const error = ref('')
let mapa = null
let capaMarcadores = null

// Nominatim: geocodificación gratuita sin API key. Se pide un solo resultado.
async function geocodificar(consulta) {
  const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(consulta)}`
  const res = await fetch(url, { headers: { Accept: 'application/json' } })
  if (!res.ok) throw new Error('Fallo al geocodificar')
  const datos = await res.json()
  if (!datos.length) throw new Error(`No se encontró "${consulta}"`)
  return { lat: parseFloat(datos[0].lat), lng: parseFloat(datos[0].lon) }
}

async function resolverCoordenadas(item) {
  if (item.lat != null && item.lng != null) {
    return { lat: parseFloat(item.lat), lng: parseFloat(item.lng) }
  }
  if (item.place) return geocodificar(item.place)
  return null
}

async function construir() {
  cargando.value = true
  error.value = ''
  try {
    let centro
    if (props.lat != null && props.lng != null) {
      centro = { lat: parseFloat(props.lat), lng: parseFloat(props.lng) }
    } else if (props.place) {
      centro = await geocodificar(props.place)
    } else if (props.markers.length) {
      centro = await resolverCoordenadas(props.markers[0])
    } else {
      throw new Error('Map necesita "place", lat/lng o al menos un marcador')
    }

    if (!mapa) {
      mapa = L.map(contenedor.value, {
        zoomControl: true,
        scrollWheelZoom: false, // no capturar el scroll de la nota
      })
      // Teselas Stadia "Alidade Smooth": estilo limpio y suave, muy tipo Apple
      // Maps. Requiere API key (gratis). {r} sirve teselas @2x en retina.
      const stadiaKey = import.meta.env.VITE_STADIA_KEY || ''
      const estilo = stadiaKey
        ? 'https://tiles.stadiamaps.com/tiles/alidade_smooth/{z}/{x}/{y}{r}.png?api_key=' +
          stadiaKey
        : // Respaldo sin key: Esri Light Gray.
          'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}'
      L.tileLayer(estilo, {
        attribution: stadiaKey
          ? '&copy; Stadia Maps &copy; OpenStreetMap'
          : '&copy; Esri',
        maxZoom: 20,
      }).addTo(mapa)
      capaMarcadores = L.layerGroup().addTo(mapa)
    }

    mapa.setView([centro.lat, centro.lng], Number(props.zoom) || 12)
    capaMarcadores.clearLayers()

    // Marcador del centro si viene de `place`/lat-lng directos.
    if (props.place || (props.lat != null && props.lng != null)) {
      L.marker([centro.lat, centro.lng])
        .addTo(capaMarcadores)
        .bindPopup(props.place || 'Ubicación')
    }

    for (const item of props.markers) {
      const coords = await resolverCoordenadas(item)
      if (!coords) continue
      const m = L.marker([coords.lat, coords.lng]).addTo(capaMarcadores)
      if (item.label) m.bindPopup(item.label)
    }

    // El contenedor puede tener ancho 0 en el primer render (layout flex aún no
    // asentado), así que se recalcula el tamaño y se vuelve a centrar tras el pintado.
    await nextTick()
    requestAnimationFrame(() => {
      if (!mapa) return
      mapa.invalidateSize()
      mapa.setView([centro.lat, centro.lng], Number(props.zoom) || 12)
    })
  } catch (e) {
    error.value = e.message || 'No se pudo cargar el mapa'
  } finally {
    cargando.value = false
  }
}

let observador = null

onMounted(() => {
  construir()
  // Si el contenedor cambia de tamaño (p. ej. anidado en Row/Grid con anchos
  // que se resuelven tarde), Leaflet necesita que se lo digamos explícitamente.
  observador = new ResizeObserver(() => mapa && mapa.invalidateSize())
  if (contenedor.value) observador.observe(contenedor.value)
})
watch(() => [props.place, props.lat, props.lng, props.zoom, props.markers], construir, {
  deep: true,
})

onBeforeUnmount(() => {
  if (observador) observador.disconnect()
  if (mapa) {
    mapa.remove()
    mapa = null
  }
})
</script>

<template>
  <div class="w-full">
    <!-- Wrapper aparte para el fondo de "cargando/error": el div de dentro lo
         gestiona Leaflet directamente (le añade clases como "leaflet-container"
         fuera del control de Vue), así que nunca debe llevar :class reactivo o
         el siguiente render lo pisaría y rompería el mapa. -->
    <div class="w-full h-72 rounded-xl overflow-hidden" :class="{ 'bg-rule/40': cargando || error }">
      <div ref="contenedor" class="w-full h-full" />
    </div>
    <p v-if="cargando" class="text-sm text-ink-faint mt-1">Cargando mapa…</p>
    <p v-else-if="error" class="text-sm text-ink-faint mt-1">{{ error }}</p>
  </div>
</template>

<style>
/* Otro bug de bundlers: el "preflight" de Tailwind pone `img { max-width: 100%;
   height: auto }`, lo que pisa el tamaño fijo (256x256) que Leaflet asigna a los
   tiles y los deja con width 0. Se restaura solo dentro del mapa. */
.leaflet-container img {
  max-width: none !important;
}
.leaflet-container .leaflet-tile {
  width: 256px !important;
  height: 256px !important;
}
</style>
