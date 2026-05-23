# Momentum

The raw rate of change over `N` bars. Positive = trending up, negative = trending down.

## Signature

```text
Momentum(period, on=<source>)
```

| Argument | Type | Required | Notes |
|---|---|---|---|
| `period` | int Param or literal | Yes | Lookback. |
| `on=` | symbol, OHLCV field, or indicator | No | Source. Defaults to the trade symbol's close. |

## Formula

$$
\text{Momentum}_t = \text{close}_t - \text{close}_{t-N}
$$

That's it — current price minus price `N` bars ago. The result is in the same units as the source (typically price), so values are not bounded.

## Warmup

`period + 1` bars.

## Reading the value

```raamcode
mom.value             # signed change
mom > 0               # uptrend
mom < 0               # downtrend
mom.crossed_above(0)  # trend flipped positive
mom.crossed_below(0)  # trend flipped negative
```

## Example

```raamcode
class MomentumBreakout(Strategy):
    """Enter on positive momentum, exit on flip."""
    period = Param(10, min=3, max=30)
    trade = Symbol()
    sizing = FixedCapital()

    def execute(self):
        mom = Momentum(self.period, on=self.trade)
        self.stop_loss(2.0)

        if mom.crossed_above(0) and self.trade.is_flat:
            self.buy(self.trade, reason=f"Momentum flipped to +{mom.value:.2f}")

        if mom.crossed_below(0) and self.trade.is_long:
            self.sell(self.trade, self.trade.position)
```

## Notes

- Momentum is unbounded — values scale with price. Compare against a threshold proportional to price (`mom > self.trade.close * 0.01`) rather than a fixed number.
- For a normalized version, divide by previous price: `pct_mom = mom.value / self.trade.close * 100` — though that's a strategy-side computation, not a separate indicator.
- Momentum on volume (`Momentum(10, on=self.trade.volume)`) gauges volume trends — useful as a confirmation filter.
