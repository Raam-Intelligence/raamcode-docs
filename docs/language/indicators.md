# Indicators

Indicators are computed once per bar and feed into your trading logic. RaamCode enforces three rules: declare them at the top of `execute()`, give every one a source, and only chain onto single-value outputs.

## Declaration

All indicator constructions must appear **at the top of `execute()`**, before any other statement. RaamCode hoists them so each indicator receives every bar's data — not just the bars where a conditional branch fires.

```raamcode
def execute(self):
    # ✅ All indicators first
    fast = SMA(self.fast_period, on=self.trade)
    slow = SMA(self.slow_period, on=self.trade)
    rsi = RSI(14)                                 # implicit source: trade symbol
    smooth = EMA(5, on=rsi)                       # chained — EMA of RSI
    high_sma = SMA(20, on=self.trade.high)        # specific OHLCV field

    # Logic starts AFTER all indicators
    self.stop_loss(2.0)
    if fast.crossed_above(slow):
        self.buy(self.trade, reason="...")
```

Putting an indicator inside an `if` or `for` block emits `RC2_IND_IN_BODY`.

## `on=` source

The `on=` keyword names the indicator's input:

| Pattern | What it means |
|---|---|
| `SMA(20, on=self.trade)` | Close price of the trade symbol. |
| `SMA(20, on=self.spy)` | Close price of a data feed. |
| `SMA(20, on=self.trade.high)` | A specific OHLCV field. |
| `EMA(5, on=rsi)` | Chain — input is another indicator's output. |
| `SMA(20)` | Omitted — defaults to the trade symbol's close. |

Explicit `on=self.trade` is recommended even when optional — it makes intent obvious to a reader (and to a code review six months from now).

## Built-in indicators

| Name | Values | Notes |
|---|---|---|
| [`SMA`](../indicators/sma) | Single decimal | Simple Moving Average. |
| [`EMA`](../indicators/ema) | Single decimal | Exponential Moving Average. |
| [`RSI`](../indicators/rsi) | Single decimal | Relative Strength Index. |
| [`Momentum`](../indicators/momentum) | Single decimal | Price momentum (close − close N bars ago). |
| [`StdDev`](../indicators/stddev) | Single decimal | Rolling standard deviation. |
| [`DMI`](../indicators/dmi) | `.plus_di`, `.minus_di`, `.adx`, `.adxr` | Directional movement. |

See the [Indicator Catalog](../indicators/) for parameters, formulas, and warmup requirements.

## Reading values

```raamcode
fast.value                # current value (explicit)
fast > slow               # comparison reads .value implicitly on both sides
fast > 100                # comparison with a number
fast.value_at(1)          # value from 1 bar ago
fast.value_at(self.bar_count - self.entry_bar)  # any past bar (within history window)
```

`value_at(0)` is equivalent to `.value`. Negative offsets are not supported.

## Crossover detection

```raamcode
# Indicator vs indicator
fast.crossed_above(slow)       # True for the single bar fast goes from ≤ slow to > slow
fast.crossed_below(slow)       # True for the single bar fast goes from ≥ slow to < slow

# Indicator vs numeric threshold
rsi.crossed_above(30)
rsi.crossed_below(self.overbought)
```

Both sides must be **single-value decimals**. The multi-value `DMI` indicator can't use crossover helpers directly — extract a field first:

```raamcode
dmi = DMI(14, on=self.trade)
dmi.crossed_above(25)             # ❌ RC2_CROSS_MULTIVALUE
dmi.plus_di.crossed_above(25)     # ✅ (field-level crossover not yet supported — see roadmap)
```

For now, multi-value crossovers can be expressed manually:

```raamcode
dmi = DMI(14, on=self.trade)
if dmi.plus_di > dmi.minus_di and dmi.adx > 25:
    ...
```

## Chaining

```raamcode
rsi = RSI(14, on=self.trade)
smooth_rsi = EMA(5, on=rsi)            # chain a single-value indicator
high_ema = EMA(10, on=self.trade.high) # chain onto an OHLCV field
```

Chaining onto a multi-value indicator output is rejected — `EMA(5, on=dmi)` raises `RC2_IND_ON_MULTIVALUE_CHAIN`. Field-level chaining (`EMA(5, on=dmi.plus_di)`) is on the roadmap.

## Warmup

Each indicator declares the number of bars it needs before producing valid output. The platform automatically prefills history so `execute()` only runs once every indicator is ready. You never see the warmup phase — your first `execute()` call already has fully-warmed indicators.

See [Warmup →](../concepts/warmup) for the full lifecycle.

## Common diagnostics

| Code | What it means |
|---|---|
| [`RC2_IND_IN_BODY`](../errors/rc2-ind-in-body) | Indicator declared inside a conditional or loop. |
| `RC2_IND_ON` | `on=` argument is missing or malformed. |
| `RC2_IND_ON_UNKNOWN` | `on=` refers to an unknown symbol or indicator. |
| `RC2_IND_ON_FIELD` | OHLCV field doesn't exist on the source. |
| `RC2_IND_ON_MULTIVALUE` | `on=` points at a multi-value indicator without a field selector. |
| `RC2_IND_ON_MULTIVALUE_CHAIN` | Chained an indicator onto a multi-value output. |
| `RC2_IND_PERIOD` | Period argument is missing or non-positive. |
| `RC2_IND_CYCLE` | Indicators form a cycle (A depends on B depends on A). |
| [`RC2_UNKNOWN_INDICATOR`](../errors/rc2-unknown-indicator) | Unknown indicator name. |
| [`RC2_CROSS_MULTIVALUE`](../errors/rc2-cross-multivalue) | `crossed_above` / `crossed_below` on a multi-value indicator. |
