# RC2_NO_SIZING

> Strategy must declare a sizing model.

## What it means

Every strategy is required to declare `sizing = ...` at the class level. The sizing model tells entry verbs (`self.buy`, `self.sell_short`) how to compute quantity. Without it, RaamCode doesn't know whether to size by contract count, by initial capital, or by current equity.

## How to fix it

Pick one of three sizing models and declare it in the class body:

```raamcode
class Strategy(Strategy):
    trade = Symbol()
    sizing = FixedCapital()        # ✅ 100% of initial capital
    # sizing = FixedQuantity(5)    # ✅ always 5 contracts/shares
    # sizing = Compounding()       # ✅ 100% of current equity (grows with wins)

    def execute(self):
        if self.trade.is_flat:
            self.buy(self.trade)
```

## Which model?

| Model | Use when |
|---|---|
| `FixedCapital()` | Backtest comparison — every run starts from the same dollar amount. |
| `FixedQuantity(n)` | Futures, options, or risk-based sizing. |
| `Compounding()` | Long-horizon "let winners run" — equity chains across walks. |

[More on sizing models →](../language/sizing)

## Related

- [Sizing](../language/sizing)
- [`RC2_OVERRIDE_INVALID`](./rc2-override-invalid)
