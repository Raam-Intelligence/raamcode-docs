# RC2_STATE_AUGASSIGN_UNINIT

> Augmented assignment requires the state to be declared first.

## What it means

You used an augmented operator (`+=`, `-=`, `*=`, etc.) on a `self.X` slot that doesn't exist yet. Augmented operators read the current value, apply the operation, and write the result back — without an initial declaration, there's no current value to read.

## Why it happens

```raamcode
class Bad(Strategy):
    trade = Symbol()
    sizing = FixedCapital()
    # (no `count` declared in class body)

    def execute(self):
        self.count += 1     # ❌ — count has no declaration to start from
```

## How to fix it

Declare the state first. For scalars, either class body or a first plain-assignment will do:

```raamcode
# Form A — class body
class GoodA(Strategy):
    trade = Symbol()
    sizing = FixedCapital()
    count = 0

    def execute(self):
        self.count += 1     # ✅ — initial value 0 from class body
```

```raamcode
# Form B — first plain assignment in execute(), then augmented
class GoodB(Strategy):
    trade = Symbol()
    sizing = FixedCapital()

    def execute(self):
        self.count = self.count + 1     # first assignment seeds the slot
        # (subsequent self.count += 1 works once the slot exists)
```

For collections, the class-body declaration is required:

```raamcode
class GoodC(Strategy):
    trade = Symbol()
    sizing = FixedCapital()
    vals = [0.0]*5
    counts = {"up": 0, "down": 0}

    def execute(self):
        self.vals[0] += self.trade.close      # ✅
        self.counts["up"] += 1                # ✅
```

## Why not auto-init for augmented assignment?

The semantics of `self.x += 1` are "read x, add 1, write back." If `x` doesn't exist yet, the natural "read" returns the type-default — but the type isn't known. We could default to `0` (int) but that's a footgun: if the user later writes `self.x = 1.5`, the `+=` site would have run with an int default and silently rounded. Requiring an explicit declaration avoids the ambiguity.

## Related

- [Persistent State](../language/persistent-state)
- [`RC2_STATE_DECL_REQUIRED`](./rc2-state-decl-required) — same idea for plain subscript writes.
- [For Loops](../language/for-loops) — augmented assignment combines naturally with for-loops.
