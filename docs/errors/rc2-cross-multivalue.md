# RC2_CROSS_MULTIVALUE

> `crossed_above` / `crossed_below` requires single-value decimals on both sides.

## What it means

Crossover helpers work between two single-value indicators (or between a single-value indicator and a number). Multi-value indicators like `Aroon` and `DMI` expose multiple fields (`.up`, `.down`, `.plus_di`, etc.) and don't have a single "the value" to compare.

## Why it happens

```raamcode
aroon = Aroon(14, on=self.trade)
if aroon.crossed_above(50):       # ❌ — aroon has multiple outputs
    ...
```

## How to fix it

Compare specific fields explicitly. Field-level `.crossed_above` is on the roadmap; for now, use direct comparison + persistent state to track the crossover yourself:

```raamcode
def execute(self):
    aroon = Aroon(14, on=self.trade)

    # Compare fields directly
    if aroon.up > 70 and aroon.down < 30 and self.trade.is_flat:
        self.buy(self.trade, reason=f"Aroon up={aroon.up:.0f}")
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

- [`Aroon`](../indicators/aroon)
- [`DMI`](../indicators/dmi)
- [Indicators](../language/indicators)
