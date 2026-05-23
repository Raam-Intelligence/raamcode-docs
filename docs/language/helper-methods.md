# Helper Methods

You can define your own methods on the strategy class and call them from `execute()`. Helpers keep `execute()` readable when the logic gets dense.

```raamcode
class RiskManaged(Strategy):
    risk_pct = Param(1.0, min=0.5, max=5.0)
    stop_distance = Param(2.0, min=0.5, max=10.0)
    trade = Symbol()
    sizing = FixedQuantity()

    def execute(self):
        sma = SMA(20, on=self.trade)
        self.stop_loss(self.stop_distance)

        if self.trade.close > sma.value and self.trade.is_flat:
            shares = self.position_size_for_risk(self.risk_pct, self.stop_distance)
            self.buy(self.trade, qty=shares, reason="Risk-managed entry")

    def position_size_for_risk(self, risk_pct, stop_pct):
        risk_amount = self.capital * risk_pct / 100
        stop_amount = self.trade.close * stop_pct / 100
        if stop_amount > 0:
            return int(risk_amount / stop_amount)
        return 0
```

## Signature rules

- First argument must be `self` (`RC2_HELPER_SIGNATURE`).
- All other arguments are positional and untyped.
- Default argument values are allowed.

```raamcode
def my_helper(self, period, multiplier=1.5):     # ✅
    ...
```

## What helpers can access

| Available | Notes |
|---|---|
| Params | `self.fast`, `self.risk_pct`, etc. |
| Symbols and OHLCV | `self.trade.close`, `self.spy.high`. |
| Position helpers | `self.trade.is_long`, etc. |
| Persistent state | Read freely. Scalar **rebinding** is rejected (`RC2_HELPER_STATE_WRITE` — see below). Collection **index/key writes** are allowed. |
| Strategy properties | `self.capital`, `self.bar_count`. |
| Other helpers | Call them like any method. |
| Order verbs | `self.buy(...)`, `self.sell(...)` work from helpers too. |
| Exit rules | `self.stop_loss(...)` works from helpers. |

## What helpers cannot access

**Indicator locals.** Indicators live in `execute()`'s local scope. Helpers don't see them.

```raamcode
def execute(self):
    rsi = RSI(14, on=self.trade)
    self.check_signal(rsi)            # ✅ pass it in explicitly

def check_signal(self, rsi):
    if rsi.value < 30:                # ✅ — passed-in indicator works fine
        return True
    return False
```

```raamcode
def execute(self):
    rsi = RSI(14, on=self.trade)
    self.check_signal()               # tries to read rsi from helper scope

def check_signal(self):
    if rsi.value < 30:                # ❌ — rsi is not in scope here
        return True
```

If a helper needs an indicator value, pass it as an argument. Same for any other local variable from `execute()`.

## Helpers and persistent state

Reading state always works. Writing splits by mechanism:

| Write shape | In helpers? | Why |
|---|---|---|
| `self.scalar = expr` | ❌ `RC2_HELPER_STATE_WRITE` | Helpers get `state` by value — a rebind mutates a local copy that doesn't propagate to the caller. Silent footgun. |
| `self.scalar += expr` | ❌ `RC2_HELPER_STATE_WRITE` | Augmented scalar reduces to the same rebind shape. |
| `self.list[i] = expr` | ✅ allowed | Mutates through the shared slot reference. The change propagates. |
| `self.dict[k] = expr` | ✅ allowed | Same — shared reference. |
| `self.list[i] += expr` | ✅ allowed | Same. |
| `self.dict[k] += expr` | ✅ allowed | Same. |

Concretely:

```raamcode
class Bad(Strategy):
    trade = Symbol()
    sizing = FixedQuantity()
    counter = 0

    def execute(self):
        self.bump()

    def bump(self):
        self.counter = self.counter + 1     # ❌ RC2_HELPER_STATE_WRITE
```

The rebind in `bump()` mutates a local copy of `state`; the caller's `state` is unchanged. Move the assignment to `execute()`:

```raamcode
class Good(Strategy):
    trade = Symbol()
    sizing = FixedQuantity()
    counter = 0

    def execute(self):
        if self.should_bump():
            self.counter = self.counter + 1     # ✅ — rebind happens in execute()

    def should_bump(self):
        return self.trade.close > self.trade.open
```

For collections, helpers are fine — element / key writes propagate via the shared reference:

```raamcode
class HelperOK(Strategy):
    trade = Symbol()
    sizing = FixedCapital()
    recent_highs = [0.0]*5
    counts = {"up": 0, "down": 0}

    def execute(self):
        self.shift_in_high()                    # ✅ — list mutation propagates
        if self.trade.close > self.trade.open:
            self.bump_up()                       # ✅ — dict mutation propagates

    def shift_in_high(self):
        for i in range(4):
            self.recent_highs[i] = self.recent_highs[i+1]
        self.recent_highs[4] = self.trade.high

    def bump_up(self):
        self.counts["up"] += 1                  # ✅ — propagates through shared dict reference
```

## Common diagnostics

| Code | What it means |
|---|---|
| `RC2_HELPER_SIGNATURE` | First arg isn't `self`. |
| `RC2_HELPER_ARITY` | Helper called with wrong number of args. |
| `RC2_HELPER_STATE_WRITE` | Helper tried to rebind scalar state (`self.x = …`). Move it to `execute()`, or use collection index / key writes if appropriate. |
