# SMA — Simple Moving Average

The simple moving average of the last `N` bars of the input.

## Signature

```text
SMA(period, on=<source>)
```

| Argument | Type | Required | Notes |
|---|---|---|---|
| `period` | int Param or literal | Yes | Number of bars to average. Must be ≥ 2. |
| `on=` | symbol, OHLCV field, or indicator | No | Source. Defaults to the trade symbol's close. |

## Formula

$$
\text{SMA}_t = \frac{1}{N} \sum_{i=0}^{N-1} \text{close}_{t-i}
$$

Or simply: the average of the last `N` closes.

## Warmup

`period` bars. SMA is `0` until `period` closes have been observed.

## Reading the value

```raamcode
sma.value             # current value
sma.value_at(1)       # value from the previous bar
sma > 100             # comparison with a number
sma > other_sma       # comparison with another single-value indicator
sma.crossed_above(slow)
sma.crossed_below(slow)
```

## Example

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
            self.buy(self.trade)

        if fast.crossed_below(slow) and self.trade.is_long:
            self.sell(self.trade, self.trade.position)
```

## Variants

```raamcode
high_sma = SMA(20, on=self.trade.high)        # SMA of highs
vol_sma = SMA(30, on=self.trade.volume)       # SMA of volume
sma_of_rsi = SMA(5, on=RSI(14, on=self.trade))  # chained — smoothed RSI
```

## Notes

- SMA assigns equal weight to every bar in the window. For more weight on recent bars, use [`EMA`](./ema).
- `period=1` is technically allowed but produces a 1-bar lag of the source — usually you want to read the source directly.
- For "yesterday's close" tricks, `SMA(1, on=self.trade.close).value_at(1)` returns the previous bar's close.
