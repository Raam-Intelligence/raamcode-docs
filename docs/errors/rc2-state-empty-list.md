# RC2_STATE_EMPTY_LIST

> A bare `[]` literal has no element type to infer.

## What it means

A class-body list declared as `name = []` — but the empty literal carries no element-type information. RaamCode can't tell whether the list holds ints, decimals, bools, or strings.

## Why it happens

```raamcode
class Bad(Strategy):
    trade = Symbol()
    sizing = FixedCapital()

    empty = []          # ❌ — what's the element type?
```

## How to fix it

Pin the element type with the `[<literal>]*0` idiom. The literal in the brackets fixes the type; `*0` produces a zero-length list:

```raamcode
class Good(Strategy):
    trade = Symbol()
    sizing = FixedCapital()

    empty = [0.0]*0     # ✅ empty list of decimal
    empty = [0]*0       # ✅ empty list of int
    empty = [False]*0   # ✅ empty list of bool
    empty = [""]*0      # ✅ empty list of string
```

Or — if you know the contents — write them out:

```raamcode
nq_highs = [0.0, 0.0, 0.0, 0.0, 0.0]   # ✅ five decimals
```

## Why we don't allow bare `[]`

RaamCode pins each list to a single element type from the literal you declare. An empty literal gives it nothing to pin to — inferring one would require either a silent default ("always decimal") or a guess based on the first place you use it, both of which add ambiguity for no real benefit. The `[<literal>]*0` idiom is two characters longer and removes the ambiguity entirely.

## Related

- [Persistent State](../language/persistent-state)
- [`RC2_STATE_EMPTY_DICT`](./rc2-state-empty-dict) — same idea for dicts.
- [`RC2_STATE_MIXED`](./rc2-state-mixed) — mixed elements in a non-empty literal.
