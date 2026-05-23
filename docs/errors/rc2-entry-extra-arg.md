# RC2_ENTRY_EXTRA_ARG

> Entry verbs (`buy`, `sell_short`) take exactly one positional arg — the symbol slot.

## What it means

Entry verbs are auto-sized from the class-level `sizing` declaration. They take exactly one positional argument: the trading symbol. Everything else (`stop`, `reason`, sizing overrides) is a keyword arg.

## Why it happens

You probably tried to pass quantity positionally — habit from `self.sell(self.trade, qty)`:

```raamcode
self.buy(self.trade, 100)               # ❌ — second positional arg
self.buy(self.trade, 100, stop=price)   # ❌ — same
```

## How to fix it

If you want to override the sizing model on this trade, use the kwarg that matches your sizing model:

```raamcode
# FixedQuantity → use qty=
sizing = FixedQuantity(5)
self.buy(self.trade, qty=100, stop=price)        # ✅

# FixedCapital or Compounding → use percent=
sizing = FixedCapital()
self.buy(self.trade, percent=50, stop=price)     # ✅
```

If you just want the default-sized buy:

```raamcode
self.buy(self.trade, stop=price)                 # ✅ uses sizing model
self.buy(self.trade, reason="Long signal")       # ✅
self.buy(self.trade)                             # ✅
```

## Related

- [Order Verbs — entry verbs](../language/order-verbs#entry-verbs-buy-sell-short)
- [Sizing](../language/sizing)
- [`RC2_OVERRIDE_INVALID`](./rc2-override-invalid)
