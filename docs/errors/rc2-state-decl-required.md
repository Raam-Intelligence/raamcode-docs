# RC2_STATE_DECL_REQUIRED

> Lists and dicts must be declared in the class body with an initial-value literal.

## What it means

You tried to write to a list or dict that wasn't declared in the class body. Persistent-state collections need an explicit class-body declaration so RaamCode can pin the element type and seed the slot at warmup.

This diagnostic fires when execute()-body code references a collection that doesn't exist as a class-body declaration:

```raamcode
class Bad(Strategy):
    trade = Symbol()
    sizing = FixedCapital()

    def execute(self):
        self.nq_highs[0] = self.trade.high   # ❌ — nq_highs was never declared
```

## How to fix it

Add the class-body declaration with a literal initial value:

```raamcode
class Good(Strategy):
    trade = Symbol()
    sizing = FixedCapital()

    nq_highs = [0.0]*5         # ← declared with initial value

    def execute(self):
        self.nq_highs[0] = self.trade.high   # ✅
```

The literal in the class body fixes both the **element type** and the **initial contents**. There's no implicit "create empty list of `decimal` when first referenced" — the class body is where that decision lives.

## Why not auto-create?

Scalars auto-init via execute()-body discovery (`self.up_count = self.up_count + 1` works without a declaration; first read yields 0). Collections don't because:

- Auto-creating `[]` would need element-type inference at first-access time (is `self.nq_highs[0] = 1.5` a list of decimals? of ints? RaamCode can't tell).
- The class-body declaration makes the initial value explicit. `nq_highs = [0.0]*5` reads as "five-slot rolling buffer" much more clearly than implicit allocation.
- Walk-forward reset needs a known initial state to re-apply. The class-body literal IS that state.

## Related

- [Persistent State](../language/persistent-state)
- [`RC2_STATE_EMPTY_LIST`](./rc2-state-empty-list) / [`RC2_STATE_EMPTY_DICT`](./rc2-state-empty-dict) — bare empty literals need the `[<lit>]*0` idiom.
- [`RC2_STATE_AUGASSIGN_UNINIT`](./rc2-state-augassign-uninit) — same idea, augmented assignment.
