# RC2_OVERRIDE_INVALID

> Override kwarg (`qty=` or `percent=`) doesn't match the sizing model.

## What it means

Each sizing model accepts exactly one override kwarg, and rejects the other:

| Sizing model | `qty=` | `percent=` |
|---|---|---|
| `FixedQuantity` | ✅ Allowed | ❌ `RC2_OVERRIDE_INVALID` |
| `FixedCapital` | ❌ `RC2_OVERRIDE_INVALID` | ✅ Allowed |
| `Compounding` | ❌ `RC2_OVERRIDE_INVALID` | ✅ Allowed |

## Why it happens

```raamcode
class Bad(Strategy):
    trade = Symbol()
    sizing = FixedCapital()

    def execute(self):
        if self.trade.is_flat:
            self.buy(self.trade, qty=100)   # ❌ qty= on FixedCapital
```

`FixedCapital` computes quantity from dollars and price. Override by adjusting the percentage; `qty=` doesn't make sense in that model.

## How to fix it

Match the kwarg to the sizing model:

```raamcode
sizing = FixedCapital()
self.buy(self.trade, percent=50)        # ✅ — 50% of initial capital

sizing = FixedQuantity(5)
self.buy(self.trade, qty=100)           # ✅ — 100 contracts

sizing = Compounding()
self.buy(self.trade, percent=80)        # ✅ — 80% of current equity
```

Or — drop the override entirely and let the sizing model take over:

```raamcode
sizing = FixedCapital(percent=80)
self.buy(self.trade)                    # ✅ — 80% as declared
```

`percent=` is always a **replacement** of the class-level setting, not multiplicative.

## Related

- [Sizing](../language/sizing)
- [Order Verbs](../language/order-verbs)
