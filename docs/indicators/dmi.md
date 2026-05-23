# DMI — Directional Movement Index

Welles Wilder's directional movement system. Multi-value: `.plus_di`, `.minus_di`, `.adx`, `.adxr`.

## Signature

```text
DMI(period, on=<source>)
```

| Argument | Type | Required | Notes |
|---|---|---|---|
| `period` | int Param or literal | Yes | Smoothing period. Wilder's default is 14. |
| `on=` | symbol | No | Source. Defaults to the trade symbol. (DMI needs HLC — pass the symbol, not a single field.) |

## Formula

For each bar:

$$
+\text{DM} = \begin{cases}\text{high}_t - \text{high}_{t-1} & \text{if greater than } \text{low}_{t-1} - \text{low}_t \text{ and positive} \\ 0 & \text{otherwise}\end{cases}
$$

$$
-\text{DM} = \begin{cases}\text{low}_{t-1} - \text{low}_t & \text{if greater than } \text{high}_t - \text{high}_{t-1} \text{ and positive} \\ 0 & \text{otherwise}\end{cases}
$$

$$
\text{TR} = \max(\text{high} - \text{low}, |\text{high} - \text{close}_{t-1}|, |\text{low} - \text{close}_{t-1}|)
$$

All three are Wilder-smoothed over `period` bars to produce `ATR`, `+DI14`, `−DI14`. Then:

$$
+\text{DI} = 100 \cdot \frac{+\text{DM}_{\text{smoothed}}}{\text{ATR}}, \qquad -\text{DI} = 100 \cdot \frac{-\text{DM}_{\text{smoothed}}}{\text{ATR}}
$$

$$
\text{DX} = 100 \cdot \frac{|+\text{DI} - -\text{DI}|}{+\text{DI} + -\text{DI}}, \qquad \text{ADX} = \text{Wilder-smooth}(\text{DX}, N)
$$

`ADXR` is the average of `ADX` today and `ADX` `N` bars ago.

## Warmup

`2 * period` bars. The first `period` to compute DX, the second to smooth ADX.

## Reading values

```raamcode
dmi = DMI(14, on=self.trade)

dmi.plus_di            # +DI
dmi.minus_di           # -DI
dmi.adx                # ADX (trend strength)
dmi.adxr               # ADXR (smoothed ADX)
```

| Field | Range | What it means |
|---|---|---|
| `plus_di` | 0..100 | Bullish pressure. |
| `minus_di` | 0..100 | Bearish pressure. |
| `adx` | 0..100 | Overall trend strength (direction-agnostic). |
| `adxr` | 0..100 | Lagged-smoothed ADX, used for ranging-vs-trending classification. |

Interpretation:

- **+DI > −DI** with ADX > 25 → strong uptrend.
- **−DI > +DI** with ADX > 25 → strong downtrend.
- **ADX < 20** → market is ranging, directional signals are unreliable.

## Example

```raamcode
class DMITrend(Strategy):
    """Long when +DI > -DI and trend is strong."""
    period = Param(14, min=7, max=28)
    adx_threshold = Param(25, min=15, max=40)
    trade = Symbol()
    sizing = FixedCapital()

    def execute(self):
        dmi = DMI(self.period, on=self.trade)
        self.stop_loss(2.5)

        bullish = dmi.plus_di > dmi.minus_di and dmi.adx > self.adx_threshold
        bearish = dmi.minus_di > dmi.plus_di and dmi.adx > self.adx_threshold

        if bullish and self.trade.is_flat:
            self.buy(self.trade, reason=f"+DI={dmi.plus_di:.0f}, ADX={dmi.adx:.0f}")

        if bearish and self.trade.is_long:
            self.sell(self.trade, self.trade.position, reason="DMI flipped bearish")
```

## Notes

- DMI is HLC-aware — it uses high, low, and previous close. Pass the symbol (`on=self.trade`), not a single field.
- ADX is **direction-agnostic** — a high ADX means "the market is trending hard," not "the market is going up." Use `+DI` vs `−DI` for direction.
- ADX < 20 is the classic "ranging" threshold. Mean-reversion strategies often filter for this; trend strategies filter against it.
- `crossed_above` / `crossed_below` don't work on `DMI` directly — extract a field (or compare two fields manually).
