# RC2_STATE_DICT_KEY

> Dict keys must be string literals.

## What it means

A class-body dict literal used a non-string key. Persistent-state dict keys are always strings.

## Why it happens

```raamcode
class Bad(Strategy):
    trade = Symbol()
    sizing = FixedCapital()

    by_index = {1: "long", 2: "short"}   # ❌ int keys
    flags = {True: 1}                    # ❌ bool keys
```

## How to fix it

Use string keys. If the original intent was integer indexing, switch to a list:

```raamcode
class Good(Strategy):
    trade = Symbol()
    sizing = FixedCapital()

    # String-keyed dict
    labels = {"1": "long", "2": "short"}

    # OR — a list when integer indexing is what you actually want
    states = ["long", "short", "flat"]   # access as self.states[0]
```

## Related

- [Persistent State](../language/persistent-state)
- [`RC2_STATE_MIXED`](./rc2-state-mixed) — mixed value types in a dict.
- [`RC2_STATE_NESTED`](./rc2-state-nested) — nested values.
