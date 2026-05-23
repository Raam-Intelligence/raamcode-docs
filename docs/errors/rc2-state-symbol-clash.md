# RC2_STATE_SYMBOL_CLASH

> Persistent state name `<name>` collides with a Symbol declared in the class body.

## What it means

A persistent state variable (`self.x = ...` inside `execute()`) cannot share a name with a `Symbol()` slot. If `trade = Symbol()` is in the class body, you can't later do `self.trade = 100`.

The reason: `self.trade` already means "the trading symbol slot." Assigning a value to it would shadow the slot and break access to OHLCV and position helpers.

## Why it happens

```raamcode
class Bad(Strategy):
    trade = Symbol()         # declares self.trade as the symbol slot
    sizing = FixedQuantity()

    def execute(self):
        self.trade = 100     # ❌ — collides with Symbol name
```

## How to fix it

Rename either the Symbol or the state variable. Common renames:

```raamcode
class Good(Strategy):
    trade = Symbol()             # keep the Symbol name
    sizing = FixedQuantity()

    def execute(self):
        self.trade_count = 100   # ✅ different name
```

Or reframe — if you wanted to count trades or track an entry price, use a more descriptive name that doesn't collide:

```raamcode
self.last_entry_price = self.trade.close
self.win_count = self.win_count + 1
```

## Related rules

- `RC2_STATE_PARAM_CLASH` — same idea for Param names.
- `RC2_STATE_RESERVED` — state name shadows a reserved strategy property (`capital`, `bar_count`, etc.).

## Related

- [Persistent State](../language/persistent-state)
- [Strategy Properties](../language/strategy-properties)
