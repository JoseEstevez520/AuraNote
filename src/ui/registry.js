// Registro de componentes: nombre → componente Vue.
// El renderer de `openui-lang` (src/openui/) consume exactamente este objeto,
// así que el modelo solo puede componer con lo que aparece aquí.
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

export const registry = {
  Stack,
  Row,
  Grid,
  Section,
  Map,
  Timeline,
  Table,
  Card,
  List,
  Stat,
  Text,
}

export default registry
