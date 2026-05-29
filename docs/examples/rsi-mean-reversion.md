# RSI Mean Reversion

Buy when RSI rebounds out of oversold territory; exit when it rebounds out of overbought. The textbook mean-reversion play.

```raamcode
class RSIMeanReversion(Strategy):
    """Buy oversold, sell overbought."""
    rsi_period = Param(14, min=5, max=30)
    oversold = Param(30, min=15, max=40)
    overbought = Param(70, min=60, max=85)
    trade = Symbol()
    sizing = FixedCapital()

    def execute(self):
        rsi = RSI(self.rsi_period, on=self.trade)

        if rsi.crossed_above(self.oversold) and self.trade.is_flat:
            self.buy(self.trade, reason=f"RSI oversold ({rsi.value:.1f})")

        if rsi.crossed_below(self.overbought) and self.trade.is_long:
            self.sell(self.trade, self.trade.position, reason=f"RSI overbought ({rsi.value:.1f})")
```

## Walkthrough

### Why crossover, not threshold

`if rsi.value < 30:` would fire on **every** bar RSI is below 30. That would either trigger a no-op (already long) or thrash if you cleared the position elsewhere.

`crossed_above(30)` fires for exactly **one** bar — the bar where RSI transitions from ≤ 30 to > 30. That's the "leaving oversold" moment, which is the classic mean-reversion entry.

### Threshold Params

Both 30 and 70 are `Param()` — let the optimizer find the best pair. Defaults match the Wilder convention; lower thresholds (40/60) trade more often, higher thresholds (20/80) trade more selectively.

### F-string reasons

`reason=f"RSI oversold ({rsi.value:.1f})"` captures the RSI value at signal time. Reasons are saved with every fill and show up in the trade log — distinct from `print(...)` output, which appears on the Console tab.

### No stop loss

Mean-reversion strategies often skip stops — the thesis is "price will revert to the mean," and a stop loss can lock in the trough. But a runaway loss is a runaway loss. A reasonable middle ground:

```raamcode
self.stop_loss(5.0)   # wider than typical to give the mean-reversion thesis room
```

## What to tune

| Param | Typical range | Effect |
|---|---|---|
| `rsi_period` | 5..30 | Lower = more sensitive (more signals); higher = smoother. |
| `oversold` | 15..40 | Lower = entries only on extreme dips. |
| `overbought` | 60..85 | Higher = ride the trend longer. |

## Common modifications

### Symmetric short side

```raamcode
if rsi.crossed_below(self.overbought) and self.trade.is_flat:
    self.sell_short(self.trade, reason=f"RSI overbought ({rsi.value:.1f})")

if rsi.crossed_above(self.oversold) and self.trade.is_short:
    self.buy_to_cover(self.trade, self.trade.position, reason="Cover short")
```

### Smoothed RSI

If signals fire too often, smooth the RSI with an EMA:

```raamcode
rsi = RSI(self.rsi_period, on=self.trade)
smooth = EMA(3, on=rsi)

if smooth.crossed_above(self.oversold) and self.trade.is_flat:
    self.buy(self.trade)
```

### Regime filter

Mean reversion fails in strong trends. Filter for trendless markets with `DMI`:

```raamcode
def execute(self):
    rsi = RSI(self.rsi_period, on=self.trade)
    dmi = DMI(14, on=self.trade)

    # Only enter when ADX is low (ranging market)
    if dmi.adx < 20 and rsi.crossed_above(self.oversold) and self.trade.is_flat:
        self.buy(self.trade)
```
