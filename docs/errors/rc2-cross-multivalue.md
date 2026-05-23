# RC2_CROSS_MULTIVALUE

> `crossed_above` / `crossed_below` requires single-value decimals on both sides.

## What it means

Crossover helpers work between two single-value indicators (or between a single-value indicator and a number). The multi-value `DMI` indicator exposes multiple fields (`.plus_di`, `.minus_di`, `.adx`, `.adxr`) and doesn't have a single "the value" to compare.

## Why it happens

```raamcode
dmi = DMI(14, on=self.trade)
if dmi.crossed_above(25):         # ❌ — dmi has multiple outputs
    ...
```

## How to fix it

Compare specific fields explicitly. Field-level `.crossed_above` is on the roadmap; for now, use direct comparison + persistent state to track the crossover yourself:

```raamcode
def execute(self):
    dmi = DMI(14, on=self.trade)

    # Compare fields directly
    if dmi.plus_di > dmi.minus_di and dmi.adx > 25 and self.trade.is_flat:
        self.buy(self.trade, reason=f"+DI={dmi.plus_di:.0f}")
```

For a true crossing detection on a multi-value field, track the previous bar's value in persistent state:

```raamcode
def execute(self):
    dmi = DMI(14, on=self.trade)

    # Detect +DI crossing above -DI
    crossed = dmi.plus_di > dmi.minus_di and self.last_plus_di <= self.last_minus_di
    self.last_plus_di = dmi.plus_di
    self.last_minus_di = dmi.minus_di

    if crossed and self.trade.is_flat:
        self.buy(self.trade)
```

## Related

- [`DMI`](../indicators/dmi)
- [Indicators](../language/indicators)
