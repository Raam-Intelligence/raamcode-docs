# RC2_CLASS_BODY

> Class body may only contain `Param()`, `Symbol()`, a sizing assignment, or plain literal assignments. Found `<construct>`.

## What it means

The class body of a `Strategy` runs **once at class-definition time**, not on every bar. It's used to declare static schema — Params, Symbols, sizing, constants. Anything that requires computation belongs in `execute()` (or a helper).

## Why it happens

You put logic, expressions, or calls in the class body that aren't `Param()`, `Symbol()`, or a sizing model.

```raamcode
class Bad(Strategy):
    trade = Symbol()
    sizing = FixedCapital()
    threshold = 30 + 5         # ❌ — arithmetic in class body
    if True:                   # ❌ — control flow in class body
        x = 1
    log("starting")            # ❌ — function call
```

## How to fix it

Move computed values into `execute()`. Use plain literals or `Param()` for the static parts.

```raamcode
class Good(Strategy):
    trade = Symbol()
    sizing = FixedCapital()
    threshold = 35             # ✅ plain literal
    overbought = Param(70, min=60, max=85)  # ✅ Param

    def execute(self):
        rsi = RSI(14, on=self.trade)
        if rsi.value > self.overbought:
            ...
```

## Related

- [Strategy Anatomy](../language/anatomy)
- [`Param()`](../language/params) — for tunable values
- [`Symbol()`](../language/symbols)
- [`Sizing`](../language/sizing)
