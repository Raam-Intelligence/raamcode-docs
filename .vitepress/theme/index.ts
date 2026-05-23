import DefaultTheme from 'vitepress/theme'
import type { Theme } from 'vitepress'
import HomeHero from './components/HomeHero.vue'
import FeatureGrid from './components/FeatureGrid.vue'
import CodePreview from './components/CodePreview.vue'
import NextUp from './components/NextUp.vue'
import './style.css'

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    app.component('HomeHero', HomeHero)
    app.component('FeatureGrid', FeatureGrid)
    app.component('CodePreview', CodePreview)
    app.component('NextUp', NextUp)
  },
} satisfies Theme
