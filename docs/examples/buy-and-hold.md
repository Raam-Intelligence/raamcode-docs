# Buy and Hold

The minimal valid RaamCode strategy. Enters on the first bar, never exits. Useful as a benchmark.

```raamcode
class BuyAndHold(Strategy):
    """Buy once, hold forever."""
    trade = Symbol()
    sizing = FixedCapital()

    def execute(self):
        if self.trade.is_flat:
            self.buy(self.trade, reason="Buy and hold entry")
```

## Walkthrough

`execute()` runs on every bar. The very first bar, `self.trade.is_flat` is True, so the buy fires. Every subsequent bar `is_flat` is False (you're holding), so nothing happens.

There's no exit logic — the position holds for the entire run.

## Why this is the minimal valid strategy

You need:

- A class inheriting from `Strategy`.
- A `Symbol()` (otherwise `RC2_NO_SYMBOL`).
- A `sizing` declaration (otherwise `RC2_NO_SIZING`).
- An `execute(self)` method (otherwise `RC2_NO_EXECUTE`).

That's the floor. Anything less doesn't compile.

## Variations

### Always 100% invested (with rebalancing)

If you want the position to keep all available cash invested (e.g., after a stop or other exit fires), drop the `is_flat` guard:

```raamcode
def execute(self):
    self.buy(self.trade, reason="Stay invested")  # silently no-op if already long
```

The platform's "entry while already in same direction is a silent no-op" rule (see [Order Verbs](../language/order-verbs)) means this is safe.

### Buy and hold with a hard stop

```raamcode
class BuyAndHoldWithStop(Strategy):
    """Buy on first bar, exit only on a 20% drawdown."""
    trade = Symbol()
    sizing = FixedCapital()

    def execute(self):
        self.stop_loss(20.0)

        if self.trade.is_flat:
            self.buy(self.trade, reason="Buy and hold entry")
```

The stop runs intra-bar, so a 20% drop closes the position even within a single trading day.

## Why benchmark with buy-and-hold

Any strategy you write should be compared against this baseline. If your strategy can't beat buy-and-hold on a given instrument over a given period, the strategy is removing value rather than adding it. Run the same backtest with `BuyAndHold` and compare returns, Sharpe, and max drawdown.
