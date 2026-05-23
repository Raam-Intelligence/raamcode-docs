# RC2_STATE_REBIND_COLLECTION

> Cannot rebind a class-body-declared list or dict. Mutate via index/key writes instead.

## What it means

The slot for a persistent-state list or dict is set up once at warmup (and re-applied at every walk-forward window start). Inside `execute()`, the contract is *mutate*, not *re-assign* — index writes (`self.list[i] = …`) and key writes (`self.dict[k] = …`) update the slot's contents; re-assignment would drop the existing buffer and replace it with a fresh one every bar.

## Why it happens

```raamcode
class Bad(Strategy):
    trade = Symbol()
    sizing = FixedCapital()
    nq_highs = [0.0]*5

    def execute(self):
        self.nq_highs = [1.0, 2.0, 3.0, 4.0, 5.0]   # ❌ — re-assignment in execute()
```

This is almost always a bug. The user thinks state persists across bars; the rebind silently overwrites it every bar.

## How to fix it

Mutate elements via subscript:

```raamcode
class Good(Strategy):
    trade = Symbol()
    sizing = FixedCapital()
    nq_highs = [0.0]*5

    def execute(self):
        # Shift the buffer left, then write the newest high at the right edge.
        for i in range(4):
            self.nq_highs[i] = self.nq_highs[i+1]
        self.nq_highs[4] = self.trade.high
```

If you genuinely want to clear the buffer to a known initial state, do it explicitly via a loop:

```raamcode
def execute(self):
    if self.trade.is_flat and self.bar_count > 1000:
        for i in range(5):
            self.nq_highs[i] = 0.0     # ✅ — element-by-element reset
```

## Scalars are different

Re-assignment of scalar state IS allowed:

```raamcode
class ScalarOK(Strategy):
    trade = Symbol()
    sizing = FixedCapital()
    up_count = 0

    def execute(self):
        self.up_count = 0          # ✅ — scalar re-assignment is fine
        if self.trade.close > self.trade.open:
            self.up_count = self.up_count + 1
```

The asymmetry is intentional: `self.scalar = value` has unambiguous meaning ("set the slot to `value`"); `self.list = [...]` mid-execute almost always means the user forgot the buffer was supposed to persist.

## Related

- [Persistent State](../language/persistent-state)
- [`RC2_STATE_DECL_REQUIRED`](./rc2-state-decl-required) — collections must be declared in the class body.
- [For Loops](../language/for-loops) — for-loop + subscript idioms.
