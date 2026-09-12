<script setup>
// Banco de pruebas de la librería de componentes, sin openui-lang ni modelos de por
// medio. Sirve para verificar que cada pieza se ve bien por sí sola y compuesta.
import Stack from './Stack.vue'
import Row from './Row.vue'
import Grid from './Grid.vue'
import Section from './Section.vue'
import Map from './Map.vue'
import Timeline from './Timeline.vue'
import Table from './Table.vue'
import Card from './Card.vue'
import List from './List.vue'
import Stat from './Stat.vue'
import Text from './Text.vue'
import Steps from './Steps.vue'
import Tree from './Tree.vue'
import Code from './Code.vue'
import Callout from './Callout.vue'
</script>

<template>
  <div class="note-column py-16">
    <Stack :gap="56">
      <Stack :gap="4">
        <h1 class="text-2xl font-semibold text-ink">Librería de componentes de AuraNote</h1>
        <p class="text-base text-ink-muted">
          Banco de pruebas de <code>src/ui/</code>. Cada pieza se ve dentro de la
          columna de 720px, sin bordes ni cards.
        </p>
      </Stack>

      <!-- Text -->
      <Section title="Text">
        <Text
          content="El viernes voy a Lisboa para JunctionX. Llego el jueves y quiero aprovechar el viernes para conocer la ciudad."
          variant="body"
        />
        <Text content="Nota discreta sobre el viaje, generada automáticamente." variant="muted" />
        <Text content="Un viaje de trabajo" variant="heading" />
        <Text content="Actualizado hace 2 minutos" variant="caption" />
      </Section>

      <!-- Stat -->
      <Section title="Stat">
        <Row :gap="48">
          <Stat label="Distancia" value="1 450" unit="km" />
          <Stat label="Duración del vuelo" value="2h 35" unit="min" />
          <Stat label="Temperatura" value="21" unit="°C" />
        </Row>
      </Section>

      <!-- Card -->
      <Section title="Card">
        <Stack :gap="0">
          <Card
            title="Hotel Alfama"
            body="Habitación doble con vistas al Tajo, cerca del centro histórico."
            meta="4 noches · desde 89 €/noche"
          />
          <Card
            title="Vuelo TAP Air Portugal"
            body="Madrid → Lisboa, salida jueves 08:20."
            meta="Confirmado · asiento 14C"
          />
        </Stack>
      </Section>

      <!-- List -->
      <Section title="List">
        <List
          :items="[
            { label: 'Paseo en barco por el Tajo', description: 'Sale desde Cais do Sodré, 1h aprox.' },
            { label: 'Playa de Carcavelos', description: 'A 25 min en tren desde el centro.' },
            { label: 'Web oficial de JunctionX', href: 'https://junctionx.com' },
          ]"
        />
      </Section>

      <!-- Steps -->
      <Section title="Steps">
        <Steps
          :items="[
            { label: 'Crear la organización', description: 'En github.com/organizations/new, plan Free.' },
            { label: 'Invitar a la clase', description: 'Por correo del instituto, rol Member.' },
            { label: 'Crear los equipos', description: 'Uno por grupo de prácticas, con acceso de escritura.' },
            { label: 'Proteger la rama main', description: 'Exigir revisión antes de fusionar.' },
          ]"
        />
      </Section>

      <!-- Tree -->
      <Section title="Tree">
        <Tree
          title="Estructura del repositorio"
          :items="[
            {
              label: 'clase-daw/',
              description: 'Organización',
              children: [
                { label: 'apuntes/', description: 'Material común', children: [
                  { label: 'README.md' },
                  { label: 'entornos-de-desarrollo.md' },
                ] },
                { label: 'ejercicios-resueltos/', description: 'Uno por unidad' },
                { label: 'portafolios/', description: 'Un repo por alumno' },
              ],
            },
          ]"
        />
      </Section>

      <!-- Code -->
      <Section title="Code">
        <Code
          language="bash"
          content="gh repo create clase-daw/apuntes --public --clone
cd apuntes
git switch -c main"
        />
      </Section>

      <!-- Callout -->
      <Section title="Callout">
        <Stack :gap="12">
          <Callout
            title="Recomendación"
            content="Empieza con los repos privados y ábrelos al final de curso: es más fácil abrir que cerrar."
          />
          <Callout
            tone="warn"
            content="El plan Free no permite repos privados con equipos. Si los necesitáis, pedid GitHub Education."
          />
        </Stack>
      </Section>

      <!-- Table -->
      <Section title="Table">
        <Table
          :columns="['Framework', 'Lenguaje', 'Arranque en frío']"
          :rows="[
            ['Spring Boot', 'Java/Kotlin', '~2.5 s'],
            ['FastAPI', 'Python', '~0.3 s'],
            ['Express', 'JavaScript', '~0.2 s'],
          ]"
        />
      </Section>

      <!-- Timeline -->
      <Section title="Timeline">
        <Timeline
          :items="[
            { label: 'Jueves', date: '9 oct', description: 'Llegada a Lisboa' },
            { label: 'Viernes', date: '10 oct', description: 'Explorar la ciudad y la costa' },
            { label: 'JunctionX', date: '11-12 oct', description: 'Evento principal' },
          ]"
        />
      </Section>

      <!-- Map -->
      <Section title="Map">
        <Map place="Lisboa, Portugal" :zoom="12" />
      </Section>

      <!-- Grid -->
      <Section title="Grid">
        <Grid :cols="3" :gap="16">
          <Stat label="Día 1" value="Llegada" />
          <Stat label="Día 2" value="Ciudad" />
          <Stat label="Día 3" value="Evento" />
        </Grid>
      </Section>

      <!-- Row con align -->
      <Section title="Row (align)">
        <Row :gap="24" align="center">
          <Text content="Alineado al centro" variant="body" />
          <Stat label="Progreso" value="72" unit="%" />
        </Row>
      </Section>

      <!-- Composición completa: el ejemplo del viaje a Lisboa de docs/componentes.md -->
      <Section title="Composición completa — viaje a Lisboa">
        <Stack :gap="24">
          <Map place="Lisboa" :zoom="12" />
          <Timeline
            :items="[
              { label: 'Jueves', description: 'Llegada' },
              { label: 'Viernes', description: 'Explorar la ciudad' },
              { label: 'JunctionX', description: 'Evento' },
            ]"
          />
          <List
            :items="[
              { label: 'Paseo en barco por el Tajo' },
              { label: 'Playa de Carcavelos' },
            ]"
          />
        </Stack>
      </Section>
    </Stack>
  </div>
</template>
