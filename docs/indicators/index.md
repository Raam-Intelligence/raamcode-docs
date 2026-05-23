# Indicator Catalog

Built-in indicators ship with the platform. Custom indicators (see [Custom Indicators](../language/custom-indicators)) can be defined inline or published to your organization's catalog.

| Indicator | Output | Common use |
|---|---|---|
| [`SMA`](./sma) | single decimal | Trend baseline, crossover signals. |
| [`EMA`](./ema) | single decimal | Faster-reacting trend baseline. |
| [`RSI`](./rsi) | single decimal | Overbought / oversold (mean reversion). |
| [`Momentum`](./momentum) | single decimal | Rate-of-change, trend confirmation. |
| [`StdDev`](./stddev) | single decimal | Volatility, Bollinger bands. |
| [`DMI`](./dmi) | `.plus_di`, `.minus_di`, `.adx`, `.adxr` | Directional movement + trend strength. |

## How to read each page

Every indicator page has the same shape:

1. **Signature** — exact constructor with required and optional args.
2. **Formula** — what it computes, in math.
3. **Warmup** — how many bars before output is valid.
4. **Reading the value** — single-value vs multi-value access.
5. **Example** — minimal strategy using it.
6. **Notes** — edge cases, common bugs.

## Declaration convention

All indicators are constructed at the **top of `execute()`**. RaamCode hoists them so every bar feeds the indicator — not just bars where a conditional fires.

```raamcode
def execute(self):
    # ── indicators at the top ──
    sma = SMA(20, on=self.trade)
    rsi = RSI(14, on=self.trade)

    # ── logic afterwards ──
    if rsi.crossed_above(30) and self.trade.is_flat:
        self.buy(self.trade)
```

[More on indicator declaration →](../language/indicators)
