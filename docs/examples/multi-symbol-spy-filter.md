# SPY-Filtered Entries

A two-symbol strategy that trades **anything** subscribers pick — but only when SPY confirms a market-wide uptrend. Demonstrates data feeds, regime filtering, and `Compounding` sizing.

```raamcode
class SPYFiltered(Strategy):
    """Only buy when SPY confirms uptrend."""
    sma_period = Param(50, min=20, max=200)
    rsi_period = Param(14, min=5, max=30)
    trade = Symbol(session="USEquityDaily", trade=True)
    spy = Symbol(ticker="SPY")
    sizing = Compounding(percent=Param(95, min=50, max=100))

    def execute(self):
        spy_sma = SMA(self.sma_period, on=self.spy)
        rsi = RSI(self.rsi_period, on=self.trade)

        spy_bullish = self.spy.close > spy_sma.value

        if spy_bullish and rsi.crossed_above(30) and self.trade.is_flat:
            self.buy(self.trade, reason="SPY uptrend + RSI oversold")

        if not spy_bullish and self.trade.is_long:
            self.sell(self.trade, self.trade.position, reason="SPY lost uptrend")
```

## Walkthrough

### Two Symbols

```raamcode
trade = Symbol(session="USEquityDaily", trade=True)   # the trading slot
spy = Symbol(ticker="SPY")                            # data feed (read-only)
```

When more than one Symbol is declared, exactly one must be marked `trade=True`. The other is a data feed — its OHLCV is readable, but you can't place orders against it (`self.buy(self.spy, ...)` is `RC2_SIG_DATAFEED`).

The `trade` slot is session-locked but ticker-open — subscribers pick the actual instrument they want filtered by SPY.

### Indicators on different symbols

```raamcode
spy_sma = SMA(self.sma_period, on=self.spy)     # SMA of SPY's close
rsi = RSI(self.rsi_period, on=self.trade)        # RSI of the trading instrument
```

Each indicator picks its own source. The strategy sees SPY's trend as a regime filter while reading RSI of whatever the subscriber bound to `trade`.

### Two-condition entry

```raamcode
if spy_bullish and rsi.crossed_above(30) and self.trade.is_flat:
```

Both must be true: SPY trading above its 50-day SMA **and** the trading instrument's RSI just exited oversold. Either condition alone wouldn't be enough.

### Regime-driven exit

```raamcode
if not spy_bullish and self.trade.is_long:
    self.sell(self.trade, self.trade.position, reason="SPY lost uptrend")
```

When SPY drops below its trend line, exit immediately — even if the instrument's own RSI says nothing's wrong. The thesis is "I only want exposure during market uptrends," and this enforces it.

### Compounding sizing

```raamcode
sizing = Compounding(percent=Param(95, min=50, max=100))
```

`Compounding` means "use 95% of **current** equity" — winners grow the position over time. Combined with the `Param`, the optimizer can find the right risk fraction.

In walk-forward, `Compounding` chains equity across windows (unlike `FixedCapital`, which resets to initial per window). For long-horizon backtests where compound growth matters, this is the right model.

## What to tune

| Param | Typical range | Effect |
|---|---|---|
| `sma_period` | 20..200 | Lower = more responsive regime; higher = smoother. |
| `rsi_period` | 5..30 | Lower = more entries; higher = fewer but cleaner. |
| `sizing percent` | 50..100 | Risk control — lower = less drawdown, less upside. |

## Common modifications

### VIX as a second filter

Add VIX as a third symbol and skip entries when fear is high:

```raamcode
trade = Symbol(session="USEquityDaily", trade=True)
spy = Symbol(ticker="SPY")
vix = Symbol(ticker="VIX")
sizing = Compounding()

def execute(self):
    spy_sma = SMA(50, on=self.spy)

    spy_bullish = self.spy.close > spy_sma.value
    low_fear = self.vix.close < 20

    if spy_bullish and low_fear and self.trade.is_flat:
        self.buy(self.trade)
```

### Sector rotation pattern

Pair a sector ETF as the trading symbol with SPY as the filter — buy the sector when both it and SPY are trending:

```raamcode
trade = Symbol(session="USEquityDaily", trade=True)   # subscriber binds XLK, XLF, etc.
spy = Symbol(ticker="SPY")
```

Each subscriber gets a different sector — but the SPY filter applies identically.
