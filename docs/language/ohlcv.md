# OHLCV Access

Every declared `Symbol()` exposes the current bar's price data:

```raamcode
self.trade.close             # current bar close
self.trade.open              # current bar open
self.trade.high              # current bar high
self.trade.low               # current bar low
self.trade.volume            # current bar volume
```

All return `decimal` (financial precision — never `float`).

OHLCV access works on **any** symbol slot — trading symbol or data feed.

```raamcode
class SPYFiltered(Strategy):
    trade = Symbol(session="USEquityDaily", trade=True)
    spy = Symbol(ticker="SPY")
    sizing = FixedCapital()

    def execute(self):
        if self.spy.close > self.spy.open and self.trade.is_flat:
            self.buy(self.trade)
```

## Using OHLCV in indicators

Pass an OHLCV field as the `on=` argument to compute an indicator on something other than close:

```raamcode
high_sma = SMA(20, on=self.trade.high)
low_ema = EMA(10, on=self.trade.low)
vol_sma = SMA(30, on=self.trade.volume)
```

[More on `on=` →](./indicators#on-source)

## "Current bar" — what does it mean?

`self.trade.close` always returns the **closed** bar's value. By the time `execute()` runs, the bar has finished forming — its OHLC are final.

For values from earlier bars, you need an indicator. There is no `self.trade.close_at(1)` for direct historical access — wrap with `SMA(1)`, `EMA(1)`, or a custom indicator using `Series`:

```raamcode
yesterday = SMA(1, on=self.trade.close).value_at(1)
```

This is intentional. Direct historical-price arrays would let strategies snapshot arbitrary windows, which complicates the determinism story (warmup, walk-forward, live replay). Indicators encapsulate "look back N bars" with explicit warmup semantics.
