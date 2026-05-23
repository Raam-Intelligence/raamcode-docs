# RC2_EXIT_NO_QTY

> Exit verbs (`sell`, `buy_to_cover`) require an explicit quantity.

## What it means

Exit verbs aren't auto-sized by the strategy's sizing model — they need to know exactly how much to exit. RaamCode refuses an exit call without a quantity, even when the intent looks obvious.

## Why it happens

```raamcode
if self.trade.is_long:
    self.sell(self.trade, stop=price)   # ❌ — no quantity given
```

You probably meant "sell everything I hold." RaamCode doesn't infer that — it makes you say it.

## How to fix it

Pass the quantity as the second positional argument. `self.trade.position` is "everything I hold":

```raamcode
if self.trade.is_long:
    self.sell(self.trade, self.trade.position, stop=price)   # ✅ full exit
```

Other common forms:

```raamcode
self.sell(self.trade, self.trade.position / 2)   # exit half
self.sell(self.trade, 50)                         # exit fixed 50 units
self.buy_to_cover(self.trade, self.trade.position)  # close a short
```

## Why no `qty=` kwarg?

Quantity for exits is always positional. `self.sell(self.trade, qty=100)` is `RC2_EXIT_NO_KWARGS`. The positional convention matches the brokerage vocabulary RaamCode adopts from TradeStation.

## Related

- [Order Verbs](../language/order-verbs)
- [Position Helpers](../language/position-helpers)
