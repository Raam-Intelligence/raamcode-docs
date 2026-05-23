---
layout: home
title: RaamCode
titleTemplate: The Python-syntax DSL for automated trading
pageClass: rc-home
---

<HomeHero
  title="Write trading rules"
  accent="in Python."
  lead="RaamCode is the Python-syntax DSL that powers Raamtrade strategies. Familiar syntax, deterministic execution, fully sandboxed — no imports, no I/O, just trading math."
  primaryText="Quickstart"
  primaryLink="/docs/getting-started"
  secondaryText="Language reference"
  secondaryLink="/docs/language/overview"
/>

<FeatureGrid
  eyebrow="Why RaamCode"
  title="The shape of a trading DSL, in syntax you already know"
  lead="Familiar Python on the outside. A trade-aware execution model on the inside. Same code runs in backtest, paper, and live."
  :features="[
    {
      icon: 'PY',
      title: 'Python you already write',
      body: 'Classes, methods, f-strings, ternaries, control flow — RaamCode is a strict subset of Python. No new syntax to learn.'
    },
    {
      icon: '⚡',
      title: 'Native-speed & deterministic',
      body: 'Strategies run at native speed with deterministic results — the same inputs always produce the same trades, in every mode.'
    },
    {
      icon: '🛡️',
      title: 'Sandboxed by design',
      body: 'No imports, no I/O, no network, no threading. Every strategy is fully isolated — only trading math runs.'
    },
    {
      icon: '📈',
      title: 'Trade-native primitives',
      body: 'Symbol slots, sizing models, order verbs, exit rules — all first-class. No glue code between you and your broker.'
    },
    {
      icon: '🧪',
      title: 'Optimizer-aware Params',
      body: 'Every Param() declares an optimization range. Grid search, walk-forward, and parameter sweeps come for free.'
    },
    {
      icon: '🔁',
      title: 'One code path, all venues',
      body: 'The same source runs across backtest, paper, and live. Behavior is identical in every mode.'
    }
  ]"
/>

<section class="rc-features" style="margin-top: 32px">
  <header class="rc-features__head">
    <div class="rc-features__eyebrow">A first taste</div>
    <h2 class="rc-features__title">What a complete strategy looks like</h2>
    <p class="rc-features__lead">RSI mean reversion with a stop loss. Twelve lines of Python. Production-ready.</p>
  </header>

```raamcode
class RSIMeanReversion(Strategy):
    """Buy oversold, sell overbought."""
    period = Param(14, min=5, max=30)
    oversold = Param(30, min=15, max=40)
    overbought = Param(70, min=60, max=85)
    trade = Symbol()
    sizing = FixedCapital()

    def execute(self):
        rsi = RSI(self.period, on=self.trade)
        self.stop_loss(3.0)

        if rsi.crossed_above(self.oversold) and self.trade.is_flat:
            self.buy(self.trade, reason=f"RSI {rsi.value:.1f}")

        if rsi.crossed_below(self.overbought) and self.trade.is_long:
            self.sell(self.trade, self.trade.position)
```

</section>

<NextUp
  label="Pick a starting point"
  :links="[
    { href: '/docs/getting-started', title: 'Quickstart', sub: 'Your first strategy in five minutes.' },
    { href: '/docs/language/overview', title: 'Language reference', sub: 'Every primitive, verb, and rule.' },
    { href: '/docs/indicators/', title: 'Indicator catalog', sub: 'SMA, EMA, RSI, DMI, and more.' },
    { href: '/docs/examples/', title: 'Examples', sub: 'Real strategies you can copy and run.' },
    { href: '/docs/concepts/execution-model', title: 'Execution model', sub: 'How bars flow through your strategy.' },
    { href: '/docs/errors/', title: 'Error reference', sub: 'Every error code, explained.' }
  ]"
/>
