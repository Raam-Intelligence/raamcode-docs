# Why RaamCode

RaamCode is the language you write trading strategies in on Raamtrade. It looks like Python because it _is_ Python — a strict, statically-checked subset that runs in a fully sandboxed, deterministic environment.

This page explains the shape of the language in three minutes. If you'd rather start typing, jump to the [Quickstart](./getting-started).

## A strategy is a class

Every strategy is a Python class that inherits from `Strategy`. The class body declares your tunable parameters, the symbols you trade, and how you size positions. An `execute()` method contains the per-bar logic.

```raamcode
class MACross(Strategy):
    """Golden-cross trend follower."""

    fast = Param(7, min=2, max=50)
    slow = Param(21, min=10, max=200)
    trade = Symbol()
    sizing = FixedCapital()

    def execute(self):
        fast = SMA(self.fast, on=self.trade)
        slow = SMA(self.slow, on=self.trade)

        self.stop_loss(2.0)

        if fast.crossed_above(slow) and self.trade.is_flat:
            self.buy(self.trade, reason="Bullish crossover")

        if fast.crossed_below(slow) and self.trade.is_long:
            self.sell(self.trade, self.trade.position)
```

That is a complete, deployable strategy. Twelve lines.

## Five concepts you already understand

| Concept | Where you use it | What it is |
|---|---|---|
| **`Param()`** | Class body | A tunable value that participates in optimization. |
| **`Symbol()`** | Class body | A market instrument slot. Subscribers bind tickers at deploy time. |
| **Sizing** | Class body | How entry verbs size each trade — `FixedQuantity`, `FixedCapital`, or `Compounding`. |
| **Indicators** | Top of `execute()` | `SMA`, `EMA`, `RSI`, `DMI`, and custom indicators. |
| **Order verbs** | Anywhere in `execute()` | `buy`, `sell_short`, `sell`, `buy_to_cover`, `order`. |

## What RaamCode is not

It is not full Python. RaamCode refuses:

- `import` anything
- Network or file I/O, `eval()`, `exec()`, `open()` (`print()` is allowed)
- `try`/`except`, `async`/`await`, `yield`, `with`, `raise`, `lambda`
- Mutable persistent state beyond `int`, `float`, `bool`, `str`

The restrictions exist for two reasons: **determinism** (your strategy must produce identical results in backtest, paper, and live) and **isolation** (your strategy runs alongside thousands of others; nothing escapes its own sandbox).

If you can express your idea in arithmetic, comparisons, indicators, and order verbs — you can write it in RaamCode. That is intentionally almost every trading idea.

## Where to go next

<NextUp
  :links="[
    { href: '/docs/getting-started', title: 'Quickstart', sub: 'A complete strategy, line by line.' },
    { href: '/docs/language/anatomy', title: 'Strategy anatomy', sub: 'The exact shape every class must follow.' },
    { href: '/docs/concepts/execution-model', title: 'Execution model', sub: 'Bars, signals, fills, and what runs when.' }
  ]"
/>
