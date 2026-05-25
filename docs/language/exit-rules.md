# Exit Rules

Exit rules are **function calls**, not assignments. They register a price-based exit that the platform checks tick-by-tick — not just on bar close.

```raamcode
self.stop_loss(2.0)          # exit if drawdown ≥ 2% from entry (percent is the default)
self.take_profit(5.0)        # exit if gain ≥ 5% from entry
self.trailing_stop(1.5)      # trail 1.5% from peak (long) or trough (short)
```

A bare value is a **percent** from entry. To use another unit, name it as a keyword — `points=` for a price distance from entry, or `price=` for an absolute price level:

```raamcode
self.take_profit(points=40)     # take profit 40 points from entry
self.stop_loss(price=18_000)    # stop at the exact price 18,000
self.take_profit(percent=5.0)   # explicit — same as take_profit(5.0)
```

Pass **exactly one** threshold per call: a bare percent, `percent=`, `points=`, or `price=`.

::: warning Not an assignment
```raamcode
self.stop_loss = 2.0   # ❌ — RC2_ASSIGN_LHS
self.stop_loss(2.0)    # ✅
```
Exit rules are calls because they're _registered_, not _set_. The platform tracks each one as a live condition between bars.
:::

## Units

The unit changes only the **level** — the direction is fixed (a long's stop is always below entry, its take-profit above):

| Form | Meaning | Long stop level | Long take-profit level |
|---|---|---|---|
| bare / `percent=` | percent from entry | entry × (1 − p/100) | entry × (1 + p/100) |
| `points=` | price distance from entry | entry − p | entry + p |
| `price=` | absolute price level | p | p |

`points=` accepts a **negative** value to put the level on the profit side of entry — `self.stop_loss(points=-15)` sets a long's stop 15 points _above_ entry to lock in a gain.

`trailing_stop` is always a percent of the peak (long) or trough (short) — it takes a bare value or `percent=` only.

## When they fire

Exit rules are checked tick-by-tick by the platform — not just on bar close. That means your stop fires the **moment** price touches its level, not at the next bar's open.

| Rule | Triggers when | Fills at |
|---|---|---|
| `stop_loss` | Long: low ≤ the stop level. Short: high ≥ the stop level. | The trigger price. |
| `take_profit` | Long: high ≥ the take-profit level. Short: low ≤ the level. | The trigger price. |
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

The same applies to `points=` and `price=`. A `price=` stop is the natural way to build a **stepped / ratcheting stop** — recompute the absolute level each bar (e.g. moving it up toward price as a long runs) and re-register it; the latest value wins.

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
| `RC2_EXIT_UNIT` | More than one threshold given, or an unrecognized unit keyword. Use one of: a bare percent, `percent=`, `points=`, or `price=` (`trailing_stop` is percent-only). |
| `RC2_ASSIGN_LHS` | Used `self.stop_loss = 2.0` instead of `self.stop_loss(2.0)`. |
