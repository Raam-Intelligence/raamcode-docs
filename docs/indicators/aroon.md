# Aroon

A trend-strength + direction indicator. Multi-value: `.up`, `.down`, and `.oscillator`.

## Signature

```text
Aroon(period, on=<source>)
```

| Argument | Type | Required | Notes |
|---|---|---|---|
| `period` | int Param or literal | Yes | Lookback window for the high/low search. |
| `on=` | symbol or OHLCV field | No | Source. Defaults to the trade symbol's close. |

## Formula

Within the last `period + 1` bars:

- Let `i_max` = bars since the highest high (0 = most recent bar is the high).
- Let `i_min` = bars since the lowest low.

Then:

$$
\text{up} = \frac{N - i_{\max}}{N} \times 100
$$

$$
\text{down} = \frac{N - i_{\min}}{N} \times 100
$$

$$
\text{oscillator} = \text{up} - \text{down}
$$

Both `.up` and `.down` are bounded `[0, 100]`. The oscillator is bounded `[-100, 100]`.

Interpretation:

- **up ≈ 100** — a new high was hit very recently → strong uptrend.
- **down ≈ 100** — a new low was hit very recently → strong downtrend.
- **both low (< 50)** — no recent extreme → ranging market.

## Warmup

`period + 1` bars.

## Reading values

Aroon is multi-value — you access fields with attributes, not `.value`.

```raamcode
aroon = Aroon(14, on=self.trade)

aroon.up               # decimal 0..100
aroon.down             # decimal 0..100
aroon.oscillator       # decimal -100..100

if aroon.up > 70 and aroon.down < 30:
    ...
```

::: warning No crossed_above on multi-value
`aroon.crossed_above(50)` is `RC2_CROSS_MULTIVALUE`. Compare fields explicitly:

```raamcode
if aroon.up > 70 and self.trade.is_flat:    # ✅
```
:::

## Example

```raamcode
class AroonTrend(Strategy):
    """Long when Aroon flags a strong uptrend."""
    period = Param(14, min=5, max=30)
    trade = Symbol()
    sizing = FixedCapital()

    def execute(self):
        aroon = Aroon(self.period, on=self.trade)
        self.stop_loss(2.5)

        if aroon.up > 80 and aroon.down < 20 and self.trade.is_flat:
            self.buy(self.trade, reason=f"Aroon up={aroon.up:.0f}")

        if aroon.oscillator < 0 and self.trade.is_long:
            self.sell(self.trade, self.trade.position, reason="Aroon flipped down")
```

## Notes

- Aroon is a **trend identification** tool — it tells you *whether* you're trending, not in which direction by itself (both fields are positive). Use the oscillator (`up - down`) for direction.
- Pair with a momentum indicator for entry timing — Aroon confirms regime, momentum times the trigger.
- Field-level chaining (`EMA(5, on=aroon.up)`) is on the roadmap. For now, smooth the oscillator yourself: track a manual moving average in persistent state.
