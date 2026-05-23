# Quickstart

Build, backtest, and read the results of your first RaamCode strategy. Five minutes end to end.

## 1. The strategy

We'll write a moving-average crossover — buys when a fast moving average crosses above a slow one, exits when it crosses back below. The classic "golden cross."

```raamcode
class MACross(Strategy):
    """Golden-cross trend follower."""

    fast = Param(7, min=2, max=50)
    slow = Param(21, min=10, max=200)
    trade = Symbol()
    sizing = FixedCapital()

    def execute(self):
        fast = SMA(self.fast, on=self.trade)
        slow = SMA(self.slow, on=self.trade)

        self.stop_loss(2.0)

        if fast.crossed_above(slow) and self.trade.is_flat:
            self.buy(self.trade, reason="Bullish crossover")

        if fast.crossed_below(slow) and self.trade.is_long:
            self.sell(self.trade, self.trade.position, reason="Bearish crossover")
```

## 2. Line by line

### Class header

```raamcode
class MACross(Strategy):
    """Golden-cross trend follower."""
```

Every strategy is a class that inherits from `Strategy`. The class name is what appears in the strategy catalog. The docstring is the catalog description — keep it short and human.

### Parameters

```raamcode
fast = Param(7, min=2, max=50)
slow = Param(21, min=10, max=200)
```

Each `Param()` is a tunable value with a default and a valid range. `min`/`max` are hard bounds — the platform rejects anything outside them before your strategy runs. These same params drive the optimizer: it sweeps `fast` from 2–50 and `slow` from 10–200 to find the configuration with the best fit.

[More on `Param()` →](./language/params)

### Symbol slot

```raamcode
trade = Symbol()
```

A `Symbol()` is a placeholder for "the instrument the subscriber will pick." When somebody deploys this strategy, they bind a real ticker (SPY, AAPL, TA35) to `trade`. The strategy itself doesn't know or care.

[More on `Symbol()` →](./language/symbols)

### Sizing model

```raamcode
sizing = FixedCapital()
```

How each `self.buy()` sizes its position. `FixedCapital()` means "use 100% of starting capital." Other options: `FixedQuantity(n)` (always n contracts) or `Compounding()` (use 100% of _current_ equity, so winners grow your position).

`sizing` is **required** — every strategy must declare one.

[More on sizing models →](./language/sizing)

### Per-bar logic

```raamcode
def execute(self):
    fast = SMA(self.fast, on=self.trade)
    slow = SMA(self.slow, on=self.trade)
    ...
```

`execute()` runs once per bar after warmup completes. Inside, you declare your indicators **at the top** — RaamCode hoists them so they receive every bar's data, not just the ones where your `if` branch fires.

[More on indicators →](./language/indicators)

### Exit rule

```raamcode
self.stop_loss(2.0)
```

A 2% stop loss on every position. Exit rules are **function calls**, not assignments. They're checked tick-by-tick, not just on bar boundaries — your stop fires the moment the price touches it.

[More on exit rules →](./language/exit-rules)

### Entry signal

```raamcode
if fast.crossed_above(slow) and self.trade.is_flat:
    self.buy(self.trade, reason="Bullish crossover")
```

Two conditions both have to be true: the fast SMA just crossed above the slow one **on this bar**, and you're not already in a position. If they are, place a market `buy`. The first argument is always the symbol slot. The `reason` string is saved with the order and shows up in your trade log.

### Exit signal

```raamcode
if fast.crossed_below(slow) and self.trade.is_long:
    self.sell(self.trade, self.trade.position, reason="Bearish crossover")
```

Exit verbs (`sell`, `buy_to_cover`) require an explicit quantity. `self.trade.position` is "everything I currently hold." You can also exit half (`self.trade.position / 2`) or a fixed number (`50`).

## 3. Run it

In Raamtrade:

1. Open **Workspaces → New strategy**.
2. Paste the code above into the editor. Diagnostics light up the moment you stop typing — green means it compiled.
3. Pick a ticker (try SPY) and a date range (try the last two years).
4. Click **Backtest**.

The result appears as an equity curve, a list of every trade, and summary metrics (return, drawdown, Sharpe).

## 4. Try the optimizer

Once a baseline backtest succeeds, click **Optimize**. The platform sweeps `fast` and `slow` across their `min`–`max` ranges and returns the best-performing combinations. Because `fast` and `slow` are already `Param()` declarations, no extra setup is needed.

## What to read next

<NextUp
  :links="[
    { href: '/docs/language/anatomy', title: 'Strategy anatomy', sub: 'The exact shape every class must follow.' },
    { href: '/docs/examples/', title: 'Examples gallery', sub: 'RSI, Bollinger, multi-symbol, more.' },
    { href: '/docs/concepts/execution-model', title: 'Execution model', sub: 'How bars flow through your strategy.' }
  ]"
/>
