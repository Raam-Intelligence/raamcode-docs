# EMA — Exponential Moving Average

An exponentially-weighted moving average. More weight on recent bars, less on old ones.

## Signature

```text
EMA(period, on=<source>)
```

| Argument | Type | Required | Notes |
|---|---|---|---|
| `period` | int Param or literal | Yes | The effective lookback. Smoothing constant α = 2 / (period + 1). |
| `on=` | symbol, OHLCV field, or indicator | No | Source. Defaults to the trade symbol's close. |

## Formula

$$
\alpha = \frac{2}{N + 1}, \quad \text{EMA}_t = \alpha \cdot \text{close}_t + (1 - \alpha) \cdot \text{EMA}_{t-1}
$$

The first value is seeded with the simple average of the first `period` closes (Wilder-style initialization).

## Warmup

`period` bars before EMA returns a meaningful value (during warmup it returns `0`).

## Reading the value

```raamcode
ema.value
ema.value_at(1)
ema > sma
ema.crossed_above(other)
ema.crossed_below(other)
```

## Example

```raamcode
class EmaPullback(Strategy):
    """Buy pullbacks below EMA, exit on close above."""
    period = Param(20, min=5, max=100)
    trade = Symbol()
    sizing = FixedCapital()

    def execute(self):
        ema = EMA(self.period, on=self.trade)

        self.stop_loss(2.5)

        if self.trade.close < ema.value * 0.98 and self.trade.is_flat:
            self.buy(self.trade, reason="Pullback below EMA")

        if self.trade.close > ema.value and self.trade.is_long:
            self.sell(self.trade, self.trade.position, reason="Reclaimed EMA")
```

## Notes

- EMA reacts faster than SMA of the same period — useful when SMA feels too lagged.
- Chain an EMA onto another indicator to smooth it: `smooth_rsi = EMA(5, on=RSI(14, on=self.trade))`.
- For trend confirmation, pair EMA with SMA of the same period — gap between them signals momentum.
