# RC2_UNKNOWN_INDICATOR

> `<name>` is not a recognized indicator.

## What it means

You called something at the top of `execute()` that RaamCode can't resolve to a built-in indicator or a custom indicator in scope.

## Common causes

- **Typo.** `Sma`, `sma`, `MovingAverage` instead of `SMA`.
- **Indicator from another file.** Custom indicators must be in the same file (or, in a future release, imported from your organization's catalog).
- **Indicator from a stripped import.** RaamCode doesn't support `import` — you can't pull in a third-party TA library.

## How to fix it

Check the spelling and capitalization. Built-ins are case-sensitive:

| Wrong | Right |
|---|---|
| `sma(20)` | `SMA(20)` |
| `Sma(20)` | `SMA(20)` |
| `ema(50)` | `EMA(50)` |
| `Rsi(14)` | `RSI(14)` |
| `Movingaverage(20)` | `SMA(20)` or `EMA(20)` |

For a custom indicator, make sure the class is defined in the same file:

```raamcode
class TR(Indicator):
    """True Range."""
    prev_close = Series(2)
    def compute(self, high, low, close):
        ...

class MyStrategy(Strategy):
    trade = Symbol()
    sizing = FixedCapital()
    def execute(self):
        tr = TR(on=self.trade)        # ✅ TR is defined above
```

## Available built-ins

| Name | What it is |
|---|---|
| [`SMA`](../indicators/sma) | Simple moving average |
| [`EMA`](../indicators/ema) | Exponential moving average |
| [`RSI`](../indicators/rsi) | Relative strength index |
| [`Momentum`](../indicators/momentum) | Price momentum |
| [`StdDev`](../indicators/stddev) | Standard deviation |
| [`Aroon`](../indicators/aroon) | Aroon oscillator |
| [`DMI`](../indicators/dmi) | Directional movement index |

## Related

- [Indicators](../language/indicators)
- [Indicator Catalog](../indicators/)
- [Custom Indicators](../language/custom-indicators)
