# Strategy Properties

Read-only properties exposed on `self`. All are updated by the platform before each `execute()` call.

| Property | Type | What it is |
|---|---|---|
| `self.capital` | `decimal` | Current equity. Updated after every fill. |
| `self.initial_capital` | `decimal` | Starting capital for this run. Constant. |
| `self.bar_count` | `int` | Bars processed since warmup ended. Starts at 0 on the first `execute()`. |
| `self.entry_bar` | `int` | The `bar_count` value when the current position was opened. 0 if flat. |
| `self.ready` | `bool` | All indicators warmed up. Rarely needed — `execute()` only runs after this is True. |
| `self.run_mode` | `str` | One of `"backtest"`, `"paper"`, `"live"`, `"optimization"`. |
| `self.is_in_strategy_warmup` | `bool` | True during the strategy warmup phase of the three-phase warmup. |

## Reading them

```raamcode
def execute(self):
    # How many bars since I opened my position?
    bars_held = self.bar_count - self.entry_bar

    # Drawdown from peak — useful for adaptive sizing
    drawdown_pct = (self.initial_capital - self.capital) / self.initial_capital * 100

    if self.trade.is_long and bars_held > 30 and rsi.value < 50:
        self.sell(self.trade, self.trade.position, reason="Time-based exit")
```

## Read-only

You cannot assign to any of these:

```raamcode
self.capital = 100000   # ❌ RC2_ASSIGN_LHS — capital is computed
self.bar_count = 0      # ❌ — bar_count is read-only
```

For your own counters, [persistent state](./persistent-state) (`self.my_counter = 0`) is the right tool.

## Mode-aware logic

`self.run_mode` lets you tweak behaviour per run type — useful for live-only logging or backtest-only assumptions:

```raamcode
def execute(self):
    self.stop_loss(2.0)

    if self.run_mode == "live":
        # Pad stop in live to absorb slippage
        self.stop_loss(2.5)
```

Use sparingly — divergent backtest/live logic defeats the determinism guarantee. Most strategies don't need to read `run_mode`.

## Three-phase warmup

Strategies can opt into a separate strategy-warmup phase: during this phase, `execute()` runs and signals fire, but resulting trades are flagged non-live and excluded from fitness metrics. Inspect `self.is_in_strategy_warmup` to skip side effects during the lead-in:

```raamcode
def execute(self):
    if self.is_in_strategy_warmup:
        return   # don't pollute persistent state during warmup
    ...
```

See [Warmup →](../concepts/warmup) for the full lifecycle.
