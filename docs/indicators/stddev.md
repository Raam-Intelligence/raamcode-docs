# StdDev — Rolling Standard Deviation

Sample standard deviation of the input over the last `N` bars. The volatility primitive.

## Signature

```text
StdDev(period, on=<source>)
```

| Argument | Type | Required | Notes |
|---|---|---|---|
| `period` | int Param or literal | Yes | Lookback. |
| `on=` | symbol, OHLCV field, or indicator | No | Source. Defaults to the trade symbol's close. |

## Formula

$$
\bar{x} = \frac{1}{N} \sum_{i=0}^{N-1} \text{close}_{t-i}, \qquad \text{StdDev} = \sqrt{\frac{1}{N-1} \sum_{i=0}^{N-1} (\text{close}_{t-i} - \bar{x})^2}
$$

Sample standard deviation (divide-by-N−1), not population. Returns `0` when fewer than 2 bars are observed.

## Warmup

`period` bars.

## Reading the value

```raamcode
sd.value
sd > some_threshold
```

## Example — Bollinger Bands

```raamcode
class BollingerBounce(Strategy):
    """Mean reversion on Bollinger Band touches."""
    period = Param(20, min=10, max=50)
    num_std = Param(2, min=1, max=3)
    trade = Symbol()
    sizing = FixedCapital()

    def execute(self):
        sma = SMA(self.period, on=self.trade)
        sd = StdDev(self.period, on=self.trade)

        lower = sma.value - self.num_std * sd.value
        upper = sma.value + self.num_std * sd.value

        self.stop_loss(3.0)

        if self.trade.close < lower and self.trade.is_flat:
            self.buy(self.trade, reason="Touch lower band")

        if self.trade.close > upper and self.trade.is_long:
            self.sell(self.trade, self.trade.position, reason="Touch upper band")
```

## Notes

- StdDev is unbounded — values scale with the source. To compare across instruments, normalize by price (`sd.value / self.trade.close`).
- The Bollinger Bands pattern above is canonical — compose `SMA + StdDev` rather than waiting for a `BollingerBands` indicator.
- For volatility regimes ("am I in a calm or noisy market?"), compare current StdDev to historical: e.g. is `sd.value > sd.value_at(20)`?
