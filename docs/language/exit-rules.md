# Exit Rules

Exit rules are **function calls**, not assignments. They register a price-based exit that the platform checks tick-by-tick — not just on bar close.

```raamcode
self.stop_loss(2.0)          # exit if drawdown ≥ 2% from entry
self.take_profit(5.0)        # exit if gain ≥ 5% from entry
self.trailing_stop(1.5)      # trail 1.5% from peak (long) or trough (short)
```

Each rule takes exactly one positional argument — the percentage threshold.

::: warning Not an assignment
```raamcode
self.stop_loss = 2.0   # ❌ — RC2_ASSIGN_LHS
self.stop_loss(2.0)    # ✅
```
Exit rules are calls because they're _registered_, not _set_. The platform tracks each one as a live condition between bars.
:::

## When they fire

Exit rules are checked tick-by-tick by the platform — not just on bar close. That means your stop fires the **moment** price touches it, not at the next bar's open.

| Rule | Triggers when | Fills at |
|---|---|---|
| `stop_loss(p)` | Long: low ≤ entry × (1 − p/100). Short: high ≥ entry × (1 + p/100). | The trigger price. |
| `take_profit(p)` | Long: high ≥ entry × (1 + p/100). Short: low ≤ entry × (1 − p/100). | The trigger price. |
| `trailing_stop(p)` | Long: low ≤ peak × (1 − p/100). Short: high ≥ trough × (1 + p/100). | The trigger price. |

When an exit rule fires, the position closes at the trigger price and `execute()` **does not run** for that bar (the exit happened mid-bar — there's no closed bar to react to yet).

## Dynamic exits

Exit rules can be re-registered every bar with different values. The most recent call wins.

```raamcode
def execute(self):
    rsi = RSI(14, on=self.trade)

    # Tighten the trailing stop after 20 bars in position
    bars_in_pos = self.bar_count - self.entry_bar
    if self.trade.is_long and bars_in_pos > 20:
        self.trailing_stop(1.0)
    elif self.trade.is_long:
        self.trailing_stop(2.0)

    self.stop_loss(3.0)   # always active
```

Exit rules registered on bar T take effect from bar T+1 onward.

## Multiple rules

You can register all three at once. The first to trigger wins.

```raamcode
self.stop_loss(2.0)
self.take_profit(5.0)
self.trailing_stop(1.5)
```

If two trigger on the same tick (extremely rare; usually requires a gap), the order is: `stop_loss` → `trailing_stop` → `take_profit`.

## Manual exits vs. rule exits

Rule exits (`stop_loss`, etc.) fire intra-bar at the trigger price. Manual exits (`self.sell()`, `self.buy_to_cover()`) fire at the next bar's open. Use rules for risk management, manual exits for indicator-driven decisions.

```raamcode
def execute(self):
    rsi = RSI(14, on=self.trade)

    # Risk management — always on
    self.stop_loss(3.0)

    # Indicator-driven exit
    if self.trade.is_long and rsi.crossed_below(70):
        self.sell(self.trade, self.trade.position, reason="RSI exit")
```

## Common diagnostics

| Code | What it means |
|---|---|
| `RC2_EXIT_ARG` | Exit rule called with wrong number / type of args. |
| `RC2_EXIT_UNIT` | Threshold value isn't a numeric Param or literal. |
| `RC2_ASSIGN_LHS` | Used `self.stop_loss = 2.0` instead of `self.stop_loss(2.0)`. |
