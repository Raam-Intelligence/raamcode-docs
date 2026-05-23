# Position Helpers

Position helpers are properties on the **symbol slot**, not on `self`.

```raamcode
self.trade.is_flat           # position == 0
self.trade.is_long           # position > 0
self.trade.is_short          # position < 0
self.trade.has_position      # position != 0
self.trade.position          # current quantity (int)
```

::: warning Common bug
`self.is_flat` does not exist. Always use `self.trade.is_flat`. This is the #1 mistake new RaamCode users make.
:::

## Why on the symbol slot?

A strategy can hold positions in multiple symbols in principle (multi-symbol trading is on the roadmap), and the position is a property of the symbol, not the strategy. Even in single-symbol strategies, the API is consistent.

## Reading position quantity

`self.trade.position` is an `int` — the current signed quantity. Positive = long, negative = short, zero = flat.

```raamcode
if self.trade.position > 100:
    self.sell(self.trade, self.trade.position - 100)   # reduce to 100
```

Common patterns:

```raamcode
# Full exit
self.sell(self.trade, self.trade.position)

# Partial exit
self.sell(self.trade, self.trade.position / 2)

# Scale out by thirds
if self.trade.is_long and rsi.value > 75:
    self.sell(self.trade, self.trade.position / 3)
```

## Data-feed restriction

Position helpers exist only on the **trading symbol**. On a data feed they emit `RC2_DATAFEED_HELPER`:

```raamcode
spy = Symbol(ticker="SPY")
if self.spy.is_flat:                # ❌ — SPY is a data feed
    ...
```

That's a feature: data feeds are read-only by design. If you need a position helper on a data feed, you actually want to make it your trading symbol.

## Common diagnostics

| Code | What it means |
|---|---|
| `RC2_DATAFEED_HELPER` | Position helper used on a data feed. |
