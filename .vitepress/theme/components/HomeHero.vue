<script setup lang="ts">
import { withBase } from 'vitepress'

defineProps<{
  title?: string
  accent?: string
  lead?: string
  primaryText?: string
  primaryLink?: string
  secondaryText?: string
  secondaryLink?: string
}>()
</script>

<template>
  <section class="rc-hero">
    <div class="rc-hero__bg" aria-hidden="true" />
    <div class="rc-hero__inner">
      <div>
        <span class="rc-hero__eyebrow">
          <span class="dot" />
          RaamCode v1 · stable
        </span>
        <h1 class="rc-hero__title">
          {{ title || 'Write trading rules' }}
          <span class="accent">{{ accent || 'in Python.' }}</span>
        </h1>
        <p class="rc-hero__lead">
          {{
            lead ||
            'RaamCode is the Python-syntax DSL that powers Raamtrade strategies. Familiar syntax, deterministic execution, fully sandboxed. No imports, no I/O — just trading math.'
          }}
        </p>
        <div class="rc-hero__cta">
          <a class="rc-cta rc-cta--primary" :href="withBase(primaryLink || '/docs/getting-started')">
            {{ primaryText || 'Quickstart' }}
            <span aria-hidden="true">→</span>
          </a>
          <a class="rc-cta rc-cta--secondary" :href="withBase(secondaryLink || '/docs/language/overview')">
            {{ secondaryText || 'Language reference' }}
          </a>
        </div>
      </div>

      <div class="rc-hero__code" aria-hidden="true">
        <header>
          <span class="dots">
            <span class="dot r" />
            <span class="dot y" />
            <span class="dot g" />
          </span>
          <span class="filename">ma_cross.raam</span>
        </header>
<pre><code><span class="kw">class</span> <span class="fn">MACross</span>(<span class="var">Strategy</span>):
    <span class="str">"""Golden cross trend follower."""</span>
    fast = <span class="fn">Param</span>(<span class="num">7</span>, min=<span class="num">2</span>, max=<span class="num">50</span>)
    slow = <span class="fn">Param</span>(<span class="num">21</span>, min=<span class="num">10</span>, max=<span class="num">200</span>)
    trade = <span class="fn">Symbol</span>()
    sizing = <span class="fn">FixedCapital</span>()

    <span class="kw">def</span> <span class="fn">execute</span>(<span class="self">self</span>):
        fast = <span class="fn">SMA</span>(<span class="self">self</span>.fast, on=<span class="self">self</span>.trade)
        slow = <span class="fn">SMA</span>(<span class="self">self</span>.slow, on=<span class="self">self</span>.trade)

        <span class="self">self</span>.<span class="fn">stop_loss</span>(<span class="num">2.0</span>)

        <span class="kw">if</span> fast.<span class="fn">crossed_above</span>(slow) <span class="kw">and</span> <span class="self">self</span>.trade.is_flat:
            <span class="self">self</span>.<span class="fn">buy</span>(<span class="self">self</span>.trade, reason=<span class="str">"Golden cross"</span>)

        <span class="kw">if</span> fast.<span class="fn">crossed_below</span>(slow) <span class="kw">and</span> <span class="self">self</span>.trade.is_long:
            <span class="self">self</span>.<span class="fn">sell</span>(<span class="self">self</span>.trade, <span class="self">self</span>.trade.position)
</code></pre>
      </div>
    </div>
  </section>
</template>
