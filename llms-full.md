---
title: Full documentation (single page)
description: The entire RaamCode documentation as one plain-text file.
aside: false
outline: false
---

<script setup>
import { ref, onMounted } from 'vue'
import { withBase } from 'vitepress'

const text = ref('Loading…')
const raw = withBase('/llms-full.txt')

onMounted(async () => {
  try {
    const res = await fetch(raw)
    text.value = await res.text()
  } catch (e) {
    text.value = 'Could not load the full text here. Open the raw file directly at ' + raw
  }
})
</script>

# Full documentation — single page

The entire RaamCode documentation, concatenated into one plain-text file. Handy for feeding to an LLM, for full-text search, or for reading everything in one place.

- **Raw file:** <a :href="raw" target="_blank" rel="noopener">llms-full.txt</a>
- **Structured index:** <a :href="withBase('/llms.txt')" target="_blank" rel="noopener">llms.txt</a>

<pre style="white-space:pre-wrap;word-break:break-word;font-size:12px;line-height:1.55;padding:16px;border:1px solid var(--vp-c-divider);border-radius:8px;background:var(--vp-c-bg-soft);overflow-x:auto;margin-top:16px">{{ text }}</pre>
