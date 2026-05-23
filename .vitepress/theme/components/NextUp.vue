<script setup lang="ts">
import { withBase } from 'vitepress'

defineProps<{
  label?: string
  links: { href: string; title: string; sub: string }[]
}>()
</script>

<template>
  <nav class="rc-nextup" :aria-label="label || 'Where to go next'">
    <a v-for="l in links" :key="l.href" :href="withBase(l.href)">
      <div class="rc-nextup__title">{{ l.title }} <span class="arrow">→</span></div>
      <div class="rc-nextup__sub">{{ l.sub }}</div>
    </a>
  </nav>
</template>
