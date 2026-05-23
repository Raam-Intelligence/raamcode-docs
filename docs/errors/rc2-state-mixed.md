# RC2_STATE_MIXED

> List elements (or dict values) must all have the same type.

## What it means

A class-body list or dict literal contained elements of mixed types. Persistent-state lists are typed `list[int]`, `list[float]`, `list[bool]`, or `list[str]` — pick one element type and stay with it. Same for dict values.

## Why it happens

```raamcode
class Bad(Strategy):
    trade = Symbol()
    sizing = FixedCapital()

    weird = [1, 2.0]                  # ❌ int + float
    weird_dict = {"a": 1, "b": True}  # ❌ int + bool
```

RaamCode infers the element type from the first element. The second one disagrees, so the literal is rejected up front rather than letting mismatched values into a single typed collection.

## How to fix it

Pick one type. If the list is conceptually numeric, write all elements as floats:

```raamcode
class Good(Strategy):
    trade = Symbol()
    sizing = FixedCapital()

    weird = [1.0, 2.0]                  # ✅ all decimal
    flags = {"a": True, "b": False}     # ✅ all bool
    counts = {"a": 1, "b": 0}           # ✅ all int
```

If you really need two different types side by side, declare two parallel slots:

```raamcode
ints = [1, 2, 3]            # list[int]
decimals = [0.5, 1.5, 2.5]  # list[decimal]
```

## Related

- [Persistent State](../language/persistent-state)
- [`RC2_STATE_NESTED`](./rc2-state-nested) — nested collections are also rejected.
- [`RC2_STATE_EMPTY_LIST`](./rc2-state-empty-list) — bare `[]` can't infer an element type.
