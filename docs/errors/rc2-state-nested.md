# RC2_STATE_NESTED

> Nested collections are not allowed in persistent-state literals.

## What it means

A class-body list or dict literal contained a nested collection — a `list` element that was itself a `list` or `dict`, or a `dict` value that was a `list` or `dict`. Persistent-state collections are one level deep only.

## Why it happens

```raamcode
class Bad(Strategy):
    trade = Symbol()
    sizing = FixedCapital()

    matrix = [[1, 2], [3, 4]]              # ❌ list of lists
    per_session = {"asian": [0.0, 0.0]}    # ❌ dict of list
    config = {"limits": {"max": 100}}      # ❌ dict of dict
```

Persistent-state lists and dicts hold a single scalar type (int, decimal, bool, or string), one level deep. Multi-level structures would need a more complex storage and serialization story.

## How to fix it

Flatten the data. Two parallel collections are usually the cleanest substitute:

```raamcode
class Good(Strategy):
    trade = Symbol()
    sizing = FixedCapital()

    # Was: per_session = {"asian": [0.0, 0.0]}
    # Now: index-paired lists or named flat keys.
    asian_high = 0.0
    asian_low = 999999.0
    london_high = 0.0
    london_low = 999999.0
```

Or two flat parallel dicts:

```raamcode
session_highs = {"asian": 0.0, "london": 0.0, "ny": 0.0}
session_lows = {"asian": 999999.0, "london": 999999.0, "ny": 999999.0}
```

## Related

- [Persistent State](../language/persistent-state)
- [`RC2_STATE_MIXED`](./rc2-state-mixed) — mixed element types in a single list/dict.
- [`RC2_STATE_DICT_KEY`](./rc2-state-dict-key) — non-string dict keys.
