<script setup lang="ts">
interface Feature {
  icon: string
  title: string
  body: string
}
defineProps<{
  eyebrow?: string
  title?: string
  lead?: string
  features: Feature[]
}>()
</script>

<template>
  <section class="rc-features">
    <header class="rc-features__head">
      <div v-if="eyebrow" class="rc-features__eyebrow">{{ eyebrow }}</div>
      <h2 class="rc-features__title">{{ title }}</h2>
      <p v-if="lead" class="rc-features__lead">{{ lead }}</p>
    </header>
    <div class="rc-features__grid">
      <div v-for="(f, i) in features" :key="i" class="rc-feature">
        <div class="rc-feature__icon">{{ f.icon }}</div>
        <h3 class="rc-feature__title">{{ f.title }}</h3>
        <p class="rc-feature__body">{{ f.body }}</p>
      </div>
    </div>
  </section>
</template>
