# MA Cross

The classic trend-following pattern. Long when a fast moving average crosses above a slow one; exit when it crosses back below. Two stop layers protect each trade.

```raamcode
class MACross(Strategy):
    """Trend following with stop loss and take profit."""
    fast_period = Param(7, min=2, max=50)
    slow_period = Param(21, min=10, max=200)
    trade = Symbol()
    sizing = FixedCapital()

    def execute(self):
        fast = SMA(self.fast_period, on=self.trade)
        slow = SMA(self.slow_period, on=self.trade)

        self.stop_loss(2.0)
        self.take_profit(5.0)

        if fast.crossed_above(slow) and self.trade.is_flat:
            self.buy(self.trade, reason="Bullish crossover")

        if fast.crossed_below(slow) and self.trade.is_long:
            self.sell(self.trade, self.trade.position, reason="Bearish crossover")
```

## Walkthrough

### Parameters

`fast_period` and `slow_period` define the two SMAs. Both have hard bounds — the optimizer will respect them. Defaults of 7 and 21 are common starting points for daily bars.

### Indicators

Both SMAs are declared at the top of `execute()`. Even when the buy/sell branches don't fire, the SMAs receive each bar's close and stay in sync.

### Exit rules

Two rules registered every bar:

- `stop_loss(2.0)` — exit if drawdown ≥ 2% from entry.
- `take_profit(5.0)` — exit if gain ≥ 5% from entry.

The first to trigger wins. Both are checked tick-by-tick, not just at bar close.

### Entry

`crossed_above` returns True for the **single bar** where `fast` transitions from `≤ slow` to `> slow`. The `is_flat` guard prevents the strategy from re-entering when already long (which would silently no-op anyway, but the explicit check makes intent clear).

### Exit

Same pattern in reverse — `crossed_below` for one bar, exit only if currently long. The exit verb requires the explicit quantity (`self.trade.position`).

## What to tune

Run an optimization sweep. Three dimensions to play with:

- `fast_period` — usually 3..15 for daily bars, 5..30 for intraday.
- `slow_period` — usually 10..50 for daily, 20..100 for intraday. Slow must be greater than fast.
- `stop_loss(...)` / `take_profit(...)` — currently hardcoded. Promote to Params for the optimizer:

```raamcode
sl_pct = Param(2.0, min=0.5, max=5.0)
tp_pct = Param(5.0, min=1.0, max=20.0)
```

## Common modifications

### Symmetric short side

```raamcode
if fast.crossed_above(slow) and self.trade.is_flat:
    self.buy(self.trade, reason="Bullish crossover")

if fast.crossed_below(slow) and self.trade.is_flat:
    self.sell_short(self.trade, reason="Bearish crossover")

if fast.crossed_above(slow) and self.trade.is_short:
    self.buy_to_cover(self.trade, self.trade.position, reason="Cover short")

if fast.crossed_below(slow) and self.trade.is_long:
    self.sell(self.trade, self.trade.position, reason="Exit long")
```

Note: in a flat → long → flat → short pattern, you'll need two bars (one to exit, one to enter the opposite side) — positions don't flip automatically.

### EMA instead of SMA

Swap `SMA` for `EMA` to react faster:

```raamcode
fast = EMA(self.fast_period, on=self.trade)
slow = EMA(self.slow_period, on=self.trade)
```

Whipsaw will increase. Pair with a longer-period filter (`DMI` ADX, for instance) to reduce false crossovers.
