# RC2_IND_IN_BODY

> Indicators must be declared at the top of `execute()`, before any other statement.

## What it means

An indicator must receive **every** bar's data to compute correctly. If you declare it inside an `if` block or a `for` loop, it would only receive bars where the branch fires — its internal state would skip bars and produce wrong values.

RaamCode hoists indicator declarations from the top of `execute()` so they always run. Anywhere else is an error.

## Why it happens

```raamcode
def execute(self):
    if self.trade.is_flat:
        rsi = RSI(14, on=self.trade)   # ❌ — RC2_IND_IN_BODY
        if rsi.value < 30:
            self.buy(self.trade)
```

The `RSI` here would only update on bars where `self.trade.is_flat` is true — so the moment you enter a position, RSI stops receiving data and its values stale.

## How to fix it

Move every indicator to the top of `execute()`:

```raamcode
def execute(self):
    rsi = RSI(14, on=self.trade)   # ✅ — always at the top

    if self.trade.is_flat and rsi.value < 30:
        self.buy(self.trade)
```

## Same rule for chained indicators

```raamcode
def execute(self):
    rsi = RSI(14, on=self.trade)
    smooth = EMA(3, on=rsi)        # ✅ chained — also at the top

    if smooth.value < 30:
        ...
```

## Related

- [Indicators](../language/indicators)
- [Execution Model](../concepts/execution-model)
