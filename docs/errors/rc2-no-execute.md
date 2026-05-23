# RC2_NO_EXECUTE

> Strategy must have an `execute(self)` method.

## What it means

`execute(self)` is where your per-bar logic lives. Without it, the platform has nothing to call when a bar closes.

## How to fix it

Add an `execute()` method to the class:

```raamcode
class Strategy(Strategy):
    trade = Symbol()
    sizing = FixedCapital()

    def execute(self):           # ✅ required
        if self.trade.is_flat:
            self.buy(self.trade)
```

Even a buy-and-hold strategy needs an `execute()` — that's where the entry signal fires once.

## Related

- [Strategy Anatomy](../language/anatomy)
- [Execution Model](../concepts/execution-model)
