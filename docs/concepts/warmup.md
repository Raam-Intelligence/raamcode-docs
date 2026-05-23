# Warmup

Warmup is the period at the start of every run during which indicators are calculating their first valid output and the strategy is settling into its operating state. Your strategy doesn't need to handle warmup explicitly — the platform suppresses `execute()` until everything is ready — but understanding it helps reason about backtest start times and walk-forward boundaries.

## Two flavors of warmup

| Flavor | Purpose | User-controlled? |
|---|---|---|
| **Indicator warmup** | Each indicator needs `N` bars before its math produces a valid value. | Implicit — derived from `period`. |
| **Strategy warmup** | Some strategies need a lead-in period where signals fire but trades don't count. | Opt-in via `strategyWarmupBars`. |

## Indicator warmup

Every indicator declares the minimum bars it needs. The platform fetches that much history before your `execute()` runs:

- `SMA(20)` → 20 bars.
- `RSI(14)` → 15 bars.
- `DMI(14)` → 28 bars.

When a strategy uses multiple indicators, the warmup is the maximum across all of them. The platform auto-resolves this — you don't compute it yourself.

By the time your first `execute()` is invoked, every indicator returns a valid value. You never see the "indicator is warming up" phase from inside the strategy.

## Strategy warmup (three-phase model)

Some strategies benefit from a lead-in period beyond the indicator warmup — for example:

- Strategies with persistent state that needs to converge (counters, running statistics).
- Strategies tuned in optimization where the first few trades on a fresh state are atypical.

The three-phase model lets you declare this explicitly:

| Phase | `execute()` | Trades | Metrics | Duration |
|---|---|---|---|---|
| Phase 1 — Indicator warmup | Dormant | None | None | `indicatorWarmupBars` (auto) |
| Phase 2 — Strategy warmup | Runs | Flagged non-live (paper-only) | Excluded | `strategyWarmupBars` (user) |
| Phase 3 — Live measurement | Runs | Real | Counted | Run length |

During Phase 2, `execute()` fires normally and signals are processed, but the resulting trades are flagged non-live and excluded from fitness metrics. The strategy "warms up" by running.

To skip side effects during Phase 2 (e.g. don't increment a counter), read `self.is_in_strategy_warmup`:

```raamcode
def execute(self):
    rsi = RSI(14, on=self.trade)

    if self.is_in_strategy_warmup:
        # don't touch persistent state during warmup
        return

    if rsi.crossed_above(30) and self.trade.is_flat:
        self.trade_count = self.trade_count + 1
        self.buy(self.trade)
```

## Walk-forward and warmup

In walk-forward analysis, each window runs end-to-end as a separate "mini-run" — including its own warmup. The platform stitches windows with **shadow fills**: indicators continue to receive bars at window boundaries so they don't restart from cold, but persistent state resets per window.

| Resets between WFA windows? |
|---|
| **Indicators** — No (shadow fills preserve state) |
| **Persistent state** — Yes (resets to zero values) |
| **Position** — Yes (each window starts flat) |
| **Capital** — Depends on sizing model (Compounding chains, others reset) |

[More on sizing and WFA →](../language/sizing#three-models)
