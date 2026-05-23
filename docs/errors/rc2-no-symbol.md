# RC2_NO_SYMBOL

> Strategy needs at least one Symbol.

## What it means

Every strategy must declare at least one `Symbol()` — that's the slot subscribers bind a real ticker to. Without one, the strategy has nothing to trade and nothing to read data from.

## How to fix it

Add a `Symbol()` declaration to the class body.

```raamcode
class Strategy(Strategy):
    trade = Symbol()           # ✅ — fully open, subscriber picks the ticker
    sizing = FixedCapital()

    def execute(self):
        if self.trade.is_flat:
            self.buy(self.trade)
```

For more constrained slots:

```raamcode
trade = Symbol(broker="tradestation")
trade = Symbol(session="USEquityDaily")
trade = Symbol("SPY", broker="tradestation", session="USEquityDaily")
```

## Related

- [`Symbol()`](../language/symbols)
- [`RC2_NO_TRADE`](./rc2-no-trade) — multiple Symbols but none marked `trade=True`.
