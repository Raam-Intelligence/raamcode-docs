# RSI — Relative Strength Index

A momentum oscillator bounded between 0 and 100. Originally Welles Wilder's design.

## Signature

```text
RSI(period, on=<source>)
```

| Argument | Type | Required | Notes |
|---|---|---|---|
| `period` | int Param or literal | Yes | Lookback. Wilder's default is 14. |
| `on=` | symbol, OHLCV field, or indicator | No | Source. Defaults to the trade symbol's close. |

## Formula

For each bar, compute change Δ = close − previous_close. Split into:

$$
\text{gain}_t = \max(\Delta, 0), \qquad \text{loss}_t = \max(-\Delta, 0)
$$

Smooth with Wilder's exponential moving average over `period` bars:

$$
\bar{G}_t = \frac{(N-1) \bar{G}_{t-1} + \text{gain}_t}{N}, \qquad \bar{L}_t = \frac{(N-1) \bar{L}_{t-1} + \text{loss}_t}{N}
$$

Then:

$$
\text{RS} = \frac{\bar{G}_t}{\bar{L}_t}, \qquad \text{RSI} = 100 - \frac{100}{1 + \text{RS}}
$$

When `loss = 0`, RSI is `100` (max). When `gain = 0`, RSI is `0` (min).

## Warmup

`period + 1` bars (you need one bar to compute the first change, then `period` to smooth).

## Reading the value

```raamcode
rsi.value
rsi > 70
rsi < 30
rsi.crossed_above(30)       # leaving oversold
rsi.crossed_below(70)       # leaving overbought
```

## Example

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

## Notes

- Lower `period` (5–10) reacts to short swings; higher (14–30) tracks longer trends.
- The classic 30/70 thresholds are starting points — different instruments and timeframes calibrate differently. Make them `Param()`s and let the optimizer find the right pair.
- Smooth RSI to reduce false signals: `smooth = EMA(3, on=rsi)`.
