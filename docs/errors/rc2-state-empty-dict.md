# RC2_STATE_EMPTY_DICT

> A bare `{}` literal has no value type to infer.

## What it means

A class-body dict declared as `name = {}` — but the empty literal carries no value-type information. RaamCode can't tell whether the dict's values are ints, decimals, bools, or strings.

## Why it happens

```raamcode
class Bad(Strategy):
    trade = Symbol()
    sizing = FixedCapital()

    empty = {}              # ❌ — what's the value type?
```

## How to fix it

Declare with one entry to pin the value type, then clear it in `execute()` if you want to start empty:

```raamcode
class Good(Strategy):
    trade = Symbol()
    sizing = FixedCapital()

    # Pins the value type as decimal
    stops = {"_": 0.0}

    def execute(self):
        if self.bar_count == 1:
            self.stops["entry"] = self.trade.close
```

Or — if you know the keys you'll use up front — declare them with their initial values:

```raamcode
counts = {"up": 0, "down": 0, "doji": 0}    # ✅ pre-populated
```

## Why we don't allow bare `{}`

Same reason as [`RC2_STATE_EMPTY_LIST`](./rc2-state-empty-list) — RaamCode pins the value type from the literal you declare, and an empty literal gives it nothing to bind to. The one-entry workaround is the smallest cost that removes the ambiguity.

A future release may add a `dict[str, decimal]()` constructor syntax. For now, the single-entry idiom does the job.

## Related

- [Persistent State](../language/persistent-state)
- [`RC2_STATE_EMPTY_LIST`](./rc2-state-empty-list) — same idea for lists.
- [`RC2_STATE_DICT_KEY`](./rc2-state-dict-key) — dict keys must be string literals.
