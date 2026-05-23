# For Loops

`for` loops in `execute()` and helper methods support three shapes: `range(...)` iteration, list iteration, and dict-key iteration.

```raamcode
class Demo(Strategy):
    trade = Symbol()
    sizing = FixedCapital()
    recent_highs = [0.0]*5
    counts = {"up": 0, "down": 0}

    def execute(self):
        # Integer ranges
        for i in range(5):                  # 0..4
            ...

        for i in range(2, 7):               # 2..6
            ...

        # List iteration — yields each element
        for h in self.recent_highs:
            ...

        # Dict iteration — yields each KEY (Python default)
        for k in self.counts:
            value = self.counts[k]
```

## `range(n)` / `range(start, stop)`

Two argument forms. `start` defaults to `0`. Both are exclusive on the upper bound.

```raamcode
for i in range(4):              # i = 0, 1, 2, 3
    self.recent_highs[i] = self.recent_highs[i+1]

for i in range(1, 5):           # i = 1, 2, 3, 4
    ...
```

`range(start, stop, step)` (the three-arg form) is **not** supported in v1. For decreasing iteration or non-unit steps, write the body explicitly.

## Iterating a list

`for x in self.<list>:` yields each element. The loop variable is a fresh local; its type matches the list's element type.

```raamcode
class Sum(Strategy):
    trade = Symbol()
    sizing = FixedCapital()
    samples = [0.0, 1.5, 2.25, 3.125, 4.0]
    total = 0.0

    def execute(self):
        self.total = 0.0
        for x in self.samples:
            self.total = self.total + x
```

## Iterating a dict

`for k in self.<dict>:` yields each **key** (string). Pair it with `self.<dict>[k]` to access the value.

```raamcode
class CountAggregate(Strategy):
    trade = Symbol()
    sizing = FixedCapital()
    counts = {"up": 0, "down": 0, "doji": 0}
    total = 0

    def execute(self):
        self.total = 0
        for k in self.counts:
            self.total = self.total + self.counts[k]
```

`.items()`, `.keys()`, and `.values()` are not supported in v1. Use the key-then-lookup pattern above.

## `len()`

`len(self.<list>)` and `len(self.<dict>)` return the element count as an `int`:

```raamcode
n = len(self.recent_highs)              # 5
seen = len(self.counts)                  # 3
```

`len()` is supported **only** on persistent-state lists and dicts — not on strings, locals, or other expressions. Using it elsewhere emits `RC2_BUILTIN_ARG`.

## Rolling-window idiom

The canonical use case: shift the buffer left and write the newest value at the right edge.

```raamcode
class RollingHigh(Strategy):
    trade = Symbol()
    sizing = FixedCapital()
    recent_highs = [0.0]*5      # 5-bar rolling high buffer

    def execute(self):
        for i in range(4):
            self.recent_highs[i] = self.recent_highs[i+1]
        self.recent_highs[4] = self.trade.high

        # Now compare against the oldest in the window:
        if self.trade.close > self.recent_highs[0] and self.trade.is_flat:
            self.buy(self.trade, reason="Break above 5-bar high")
```

## Loop-variable scope

The loop variable is declared by the `for` statement and lives in the loop's scope. Reuse outside the loop reads its last value (Python-true):

```raamcode
def execute(self):
    for i in range(3):
        ...
    # `i` is now 2 (last value). Avoid relying on this — declare a separate
    # named local if you need the final index.
```

RaamCode does NOT track loop variables as persistent state. They reset on every bar.

## What's not supported in v1

- `range(start, stop, step)` (three-arg form)
- `while` loops
- `break` / `continue`
- `for ... else` clauses
- `enumerate()`, `zip()`, `reversed()`, `sorted()`
- `.items()` / `.keys()` / `.values()` on dicts
- `len()` on anything other than a persistent-state list or dict

If a real strategy pattern hits one of these, file a ticket — most of them are mechanical follow-ups we'll add over time.

## Common diagnostics

| Code | What it means |
|---|---|
| `RC2_FOR_TARGET` | The loop variable isn't a simple name. |
| `RC2_FOR_ITER` | The iterable isn't `range(...)` or a persistent-state list / dict. |
| `RC2_FOR_RANGE` | `range()` called with wrong arity. |
| `RC2_BUILTIN_ARG` | `len(...)` called with an unsupported argument. |
| `SDK012` | A builtin (`map`, `filter`, `enumerate`, etc.) is not allowed. |
