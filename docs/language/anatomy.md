# Strategy Anatomy

Every RaamCode strategy follows the same shape. RaamCode enforces it.

```raamcode
class StrategyName(Strategy):
    """Description shown in the catalog."""

    # ── Class body: Param(), Symbol(), sizing, persistent state ──
    fast_period = Param(7, min=2, max=50)
    slow_period = Param(21, min=10, max=200)
    trade = Symbol()
    sizing = FixedCapital()

    # Persistent state declarations (optional) — initial values seeded at warmup-complete
    # and re-applied at every walk-forward window boundary.
    position_size = 100              # scalar persistent state
    recent_highs = [0.0]*5           # list of decimals — 5-slot rolling buffer
    counts = {"up": 0, "down": 0}    # dict of string → int

    def execute(self):
        # ── 1. Indicators at the top (RaamCode hoists them) ──
        fast = SMA(self.fast_period, on=self.trade)
        slow = SMA(self.slow_period, on=self.trade)

        # ── 2. Exit rules (optional, can be dynamic) ──
        self.stop_loss(2.0)

        # ── 3. Order logic ──
        if fast.crossed_above(slow) and self.trade.is_flat:
            self.buy(self.trade, reason="Bullish crossover")

        if fast.crossed_below(slow) and self.trade.is_long:
            self.sell(self.trade, self.trade.position, reason="Bearish crossover")
```

## Required pieces

| Piece | Required? | Notes |
|---|---|---|
| Inherit from `Strategy` | Yes | The only valid base class. |
| Class name | Yes | Becomes the strategy name in the catalog. **One class per file.** |
| Docstring | Recommended | Shown as the catalog description. |
| At least one `Symbol()` | Yes | Otherwise: `RC2_NO_SYMBOL`. |
| One `sizing = …` declaration | Yes | Otherwise: `RC2_NO_SIZING`. |
| `def execute(self)` | Yes | Otherwise: `RC2_NO_EXECUTE`. |
| `def initialize(self)` | Optional | Runs once when warmup completes. |
| Helper methods | Optional | `def name(self, args)`, callable from `execute()`. |

## Class body rules

The class body may contain **only**:

- `Param(...)` assignments
- `Symbol(...)` assignments
- A single `sizing = ...` assignment
- [Persistent state](./persistent-state) literal declarations — scalars (`x = 100`), lists (`xs = [0.0]*5`), or dicts (`m = {"k": 0}`)

Anything else — function calls (other than `Param/Symbol/Sizing`), control flow, arithmetic, expressions — emits `RC2_CLASS_BODY`.

```raamcode
class Bad(Strategy):
    trade = Symbol()
    sizing = FixedCapital()
    threshold = 30 + 5  # ❌ RC2_CLASS_BODY — no expressions
    if True:            # ❌ RC2_CLASS_BODY — no control flow
        x = 1
```

```raamcode
class Good(Strategy):
    trade = Symbol()
    sizing = FixedCapital()
    threshold = 35              # ✅ scalar persistent state
    period = Param(14)          # ✅ Param call
    rolling = [0.0]*5           # ✅ list persistent state
    counts = {"up": 0}          # ✅ dict persistent state
```

## Execution order inside `execute()`

RaamCode hoists every indicator declaration to the top of `execute()` so each indicator receives **every** bar — even when your `if` branch is False. The rest of the body runs in declaration order.

If `execute()` finishes without firing a signal, the strategy holds its current position. There is no implicit "do nothing else" — holding is the default.

## Mode-specific entry points

| Method | When it runs | Common use |
|---|---|---|
| `initialize(self)` | Once, after warmup completes | Seed persistent state, log start banners. |
| `execute(self)` | Every bar after warmup | The trading logic. |
| Helper methods | When called by `execute()` | Risk-sizing math, signal helpers. |

`initialize()` cannot place orders — warmup is still settling on the first bar. Use it only for state setup.

## Multiple symbols

When a strategy declares more than one `Symbol()`, exactly one must be marked `trade=True` — that symbol is the only one orders can be placed against. The others are data feeds (read-only OHLCV).

```raamcode
class SPYFiltered(Strategy):
    trade = Symbol(session="USEquityDaily", trade=True)  # the trading slot
    spy = Symbol(ticker="SPY")                            # data feed
    sizing = FixedCapital()

    def execute(self):
        ...
```

[More on `Symbol()` →](./symbols)

## Common diagnostics

| Code | What it means |
|---|---|
| [`RC2_NO_SYMBOL`](../errors/rc2-no-symbol) | No `Symbol()` declared in the class body. |
| [`RC2_NO_TRADE`](../errors/rc2-no-trade) | Multiple symbols but none marked `trade=True`. |
| [`RC2_NO_SIZING`](../errors/rc2-no-sizing) | Missing `sizing = ...` assignment. |
| [`RC2_NO_EXECUTE`](../errors/rc2-no-execute) | Strategy has no `def execute(self)`. |
| [`RC2_CLASS_BODY`](../errors/rc2-class-body) | Disallowed construct in the class body. |
