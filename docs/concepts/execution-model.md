# Execution Model

How bars flow through your strategy. This is the timing contract — read it once and you can reason about any RaamCode strategy.

## A single bar, end to end

For every closed bar the platform:

1. **Updates OHLCV.** The bar's open, high, low, close, volume are final.
2. **Feeds indicators.** Every indicator declared at the top of `execute()` receives this bar's input and updates its internal state.
3. **Checks exit rules.** `stop_loss`, `take_profit`, `trailing_stop` registered on a previous bar are checked tick-by-tick (intra-bar, not just at close). If one fires, the position closes at the trigger price and `execute()` **does not run** for this bar.
4. **Runs `execute()`.** If no exit rule fired, your per-bar logic runs.
5. **Resolves orders.** Any `self.buy` / `self.sell` / `self.order` registered during `execute()` gets queued.
6. **Fills on the next bar.** Queued market orders fill at the next bar's open; stop/limit orders fill at their trigger price when reached.

The cycle then repeats.

## What "current bar" means inside `execute()`

When `execute()` is called, `self.trade.close`, `self.trade.high`, etc. are the **just-closed** bar's values. The bar is final — its OHLC will not change. Indicators have already been updated with that bar's data.

You cannot place an order that fills on the current bar. The earliest fill timing is the **next** bar's open (T+1).

## Why fills happen on T+1

Two reasons:

1. **No look-ahead bias.** If a strategy could fill on the bar it signals, it would implicitly use the bar's close to make a decision and the bar's close as the execution price — which doesn't exist in reality (close prices are determined by the last trade of the bar, after your hypothetical order would have hit the book).
2. **Matches reality.** Real exchanges don't fill orders during a bar's formation. Orders submitted at 9:30am US Equity hourly fill into the 10:30am open.

## Closed-bar discipline

Strategies see only **closed** bars. There is no concept of "the current forming bar." This is deliberate:

- Determinism — closed bars are immutable. A backtest cannot disagree with a live run about what a bar looked like.
- Cross-mode parity — backtest, paper, and live all wait for the same bar to close before invoking `execute()`.

Some strategies (especially intraday scalping) want to react sooner. RaamCode's answer is **shorter bars** — choose a 1-minute or 5-minute session instead of relying on partial-bar data.

## Multiple signals in one bar

You can register **at most one signal per execution path per bar.** Two consecutive `self.buy()` calls in the same branch are silently merged — the first wins.

```raamcode
def execute(self):
    if condition:
        self.buy(self.trade, reason="A")
        self.buy(self.trade, reason="B")    # silently ignored — first one wins
```

If you need both an entry and an exit to be considered in the same bar, structure your `if` / `elif` so only one branch runs.

## Position lifecycle

```
flat → (entry verb signals) → long/short → (exit signal or rule) → flat
```

The platform tracks position state transitions. Position helpers (`is_flat`, `is_long`, etc.) read from this state.

- **Entry while already in the same direction** is silently skipped. `self.buy()` when long is a no-op (no error, no fill).
- **Entry in the opposite direction while in a position** does **not** flip the position automatically. You must exit first (`self.sell(self.trade, self.trade.position)`) on one bar, then enter (`self.sell_short(self.trade)`) on the next.
- **Exit when flat** fills 0 units — silent no-op.

## How `execute()` differs by mode

| Mode | `execute()` runs on… | Notes |
|---|---|---|
| Backtest | Every historical bar in range | Sequential, deterministic. |
| Optimization | Every bar of every parameter combination | Same as backtest, run many times. |
| Paper | Every newly-closed bar (live data) | Live broker data, simulated fills. |
| Live | Every newly-closed bar (live data) | Real orders go to the broker. |

Your `execute()` is **identical across all four modes**. The platform handles bar delivery and order routing differently; your logic doesn't.

## Three-phase warmup

RaamCode runs three execution phases per backtest:

| Phase | What runs | Trades | Metrics |
|---|---|---|---|
| Phase 1 — Indicator warmup | Indicators only | None | None |
| Phase 2 — Strategy warmup | `execute()` runs, signals fire | Flagged non-live | Excluded |
| Phase 3 — Live measurement | Full execution | Real | Counted |

The transition is invisible to your code unless you opt in. Read `self.is_in_strategy_warmup` to skip side effects during Phase 2:

```raamcode
def execute(self):
    if self.is_in_strategy_warmup:
        return   # don't write persistent state during warmup
    ...
```

[More on warmup →](./warmup)
