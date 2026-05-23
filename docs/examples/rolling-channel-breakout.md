# Rolling Channel Breakout (Sessions H/L)

End-to-end example exercising the persistent-state collection features added in v1: class-body **list** and **dict** declarations, **for-loop** iteration, **subscript reads/writes**, **augmented assignment**, and **helper-method** index writes.

The strategy tracks the high and low of every 3-minute bar that falls into one of five global trading sessions (Asian, London, NY-overlap, NY-afternoon, NY-close), then trades breakouts of the all-session range.

```raamcode
class GlobalSessionsBreakout(Strategy):
    """Track H/L of 5 global trading sessions and trade breakouts of the all-session range."""
    trade = Symbol()
    sizing = FixedCapital()

    # ── Per-session highs and lows — parallel lists indexed by session ──
    # idx 0 = asian        (03:00 - 07:00)
    # idx 1 = london       (09:00 - 12:00)
    # idx 2 = ny_overlap   (16:30 - 18:00)
    # idx 3 = ny_afternoon (19:00 - 20:00)
    # idx 4 = ny_close     (20:30 - 23:00)
    session_highs = [0.0]*5
    session_lows  = [999999.0]*5

    # ── Per-session trade counters — dict keyed by name for readable logs ──
    trade_counts = {
        "asian":        0,
        "london":       0,
        "ny_overlap":   0,
        "ny_afternoon": 0,
        "ny_close":     0,
    }

    def execute(self):
        # Convert wall-clock to minutes-since-midnight so window checks are one comparison each.
        t = self.trade.timestamp.hour * 60 + self.trade.timestamp.minute

        # ── Update per-session H/L through a helper ──
        # Helper methods can mutate collection state via index writes (P5 — propagates through
        # the shared slot reference). Scalar rebinding inside helpers is still rejected.
        self.update_session_extremes(t)

        # ── Aggregate H-of-Hs and L-of-Ls via for-x-in-list iteration ──
        max_high = 0.0
        min_low = 999999.0
        for h in self.session_highs:
            if h > max_high:
                max_high = h
        for lo in self.session_lows:
            if lo < min_low:
                min_low = lo

        # ── Break above all-session high → long ──
        if self.trade.close > max_high and self.trade.is_flat and max_high > 0.0:
            # Tag the trade with whichever session we're in. Each branch increments the
            # dict counter via augmented assignment (key evaluated once per write).
            if t >= 180 and t < 420:
                self.trade_counts["asian"] += 1
                self.buy(self.trade, reason=f"Asian breakout above {max_high:.2f}")
            elif t >= 540 and t < 720:
                self.trade_counts["london"] += 1
                self.buy(self.trade, reason=f"London breakout above {max_high:.2f}")
            elif t >= 990 and t < 1080:
                self.trade_counts["ny_overlap"] += 1
                self.buy(self.trade, reason=f"NY overlap breakout above {max_high:.2f}")
            elif t >= 1140 and t < 1200:
                self.trade_counts["ny_afternoon"] += 1
                self.buy(self.trade, reason=f"NY afternoon breakout above {max_high:.2f}")
            elif t >= 1230 and t < 1380:
                self.trade_counts["ny_close"] += 1
                self.buy(self.trade, reason=f"NY close breakout above {max_high:.2f}")

        # ── Break below all-session low → exit ──
        if self.trade.close < min_low and self.trade.is_long:
            self.sell(self.trade, self.trade.position,
                      reason=f"Break below all-session low {min_low:.2f}")

    # ── Helpers ──────────────────────────────────────────────────────────────

    def update_session_extremes(self, t):
        # asian: 03:00-07:00 → idx 0
        if t >= 180 and t < 420:
            if self.trade.high > self.session_highs[0]:
                self.session_highs[0] = self.trade.high       # ✅ index write — propagates
            if self.trade.low < self.session_lows[0]:
                self.session_lows[0] = self.trade.low

        # london: 09:00-12:00 → idx 1
        if t >= 540 and t < 720:
            if self.trade.high > self.session_highs[1]:
                self.session_highs[1] = self.trade.high
            if self.trade.low < self.session_lows[1]:
                self.session_lows[1] = self.trade.low

        # ny_overlap: 16:30-18:00 → idx 2
        if t >= 990 and t < 1080:
            if self.trade.high > self.session_highs[2]:
                self.session_highs[2] = self.trade.high
            if self.trade.low < self.session_lows[2]:
                self.session_lows[2] = self.trade.low

        # ny_afternoon: 19:00-20:00 → idx 3
        if t >= 1140 and t < 1200:
            if self.trade.high > self.session_highs[3]:
                self.session_highs[3] = self.trade.high
            if self.trade.low < self.session_lows[3]:
                self.session_lows[3] = self.trade.low

        # ny_close: 20:30-23:00 → idx 4
        if t >= 1230 and t < 1380:
            if self.trade.high > self.session_highs[4]:
                self.session_highs[4] = self.trade.high
            if self.trade.low < self.session_lows[4]:
                self.session_lows[4] = self.trade.low

        return 0   # helpers return decimal; return value unused here
```

## Walkthrough

### Why two parallel collections

`session_highs` and `session_lows` are **lists** indexed by integer (0..4 → session). `trade_counts` is a **dict** keyed by string. Both are valid; the choice depends on the access pattern:

- **List + integer index**: fastest, smallest memory; the index → meaning mapping lives in a comment. Best when the position is the natural identifier (rolling buffer, fixed-size grid).
- **Dict + string key**: self-documenting at every access site (`self.trade_counts["asian"]`). Slightly more memory, slightly slower (still nanoseconds at this scale). Best when the names matter — e.g., when you want them to appear in log strings.

Mixing both in one strategy is fine. Use whichever reads better at each call site.

### Class-body declaration form

```raamcode
session_highs = [0.0]*5
session_lows  = [999999.0]*5
trade_counts = {
    "asian":        0,
    "london":       0,
    "ny_overlap":   0,
    "ny_afternoon": 0,
    "ny_close":     0,
}
```

Three things to notice:

1. **`[0.0]*5`** is the `[<literal>]*N` shortcut — equivalent to `[0.0, 0.0, 0.0, 0.0, 0.0]`. The literal element fixes the element type as `decimal`; `*5` produces the initial length. Use whichever form reads better — they produce the same five-element list of decimals.
2. **`[999999.0]*5`** uses a sentinel high value so any real price is lower on the first bar in-session. (`0.0` wouldn't work for tracking minimums — every real price would beat it.)
3. **Dict literal** with explicit string keys and `int` values. Mixed-type values raise `RC2_STATE_MIXED`; nested values raise `RC2_STATE_NESTED`; non-string keys raise `RC2_STATE_DICT_KEY`.

### Helper-method index writes propagate

`update_session_extremes` writes to `self.session_highs[i]` from inside a helper:

```raamcode
def update_session_extremes(self, t):
    if t >= 180 and t < 420:
        if self.trade.high > self.session_highs[0]:
            self.session_highs[0] = self.trade.high     # ✅ propagates
        ...
```

This works because the slot holds a reference to the same list that `execute()` and the helper both see. Index writes mutate that shared list — the change is visible to the next caller bar.

If the helper instead tried `self.session_highs = [0.0, 0.0, 0.0, 0.0, 0.0]` (a rebind), it would raise `RC2_STATE_REBIND_COLLECTION` — and even if rebinding were allowed, the rebind would only affect the helper's local copy of `state`, not the caller's. The index-write rule lets helpers do useful collection mutation without that footgun.

### Iteration to compute the aggregate range

```raamcode
max_high = 0.0
for h in self.session_highs:
    if h > max_high:
        max_high = h
```

`for h in self.session_highs:` iterates the **values** of the list. The loop variable `h` is a fresh local — it doesn't conflict with anything declared elsewhere.

For dicts, the same form iterates **keys** (Python default):

```raamcode
for session_name in self.trade_counts:
    count = self.trade_counts[session_name]
    ...
```

### Augmented assignment on dict values

```raamcode
self.trade_counts["asian"] += 1
```

RaamCode evaluates the **key expression once** before the read-modify-write. The "evaluated once" guarantee matters when the key expression has side effects — rare in straight-line strategy code, but RaamCode is defensive about it.

## What this example exercises

| Feature | Where in the code |
|---|---|
| Class-body list literal (`[0.0]*5`) | `session_highs`, `session_lows` |
| Class-body dict literal | `trade_counts` |
| List subscript read | `self.session_highs[0]` |
| List subscript write | `self.session_highs[0] = self.trade.high` |
| Dict subscript write (augmented) | `self.trade_counts["asian"] += 1` |
| `for x in self.list` | `for h in self.session_highs` |
| Helper-method collection mutation | `update_session_extremes` writes through `self.session_highs[i]` |
| `self.trade.timestamp.hour / .minute` | The `t = ...` computation at the top of `execute()` (already supported) |

## Common modifications

### Reset H/L per day

The version above accumulates lifetime per-session H/L — the asian-session high keeps climbing across days. For "today's H/L only," add a `last_minute` scalar and reset when the clock crosses each session start:

```raamcode
last_minute = 0   # scalar persistent state

def execute(self):
    t = self.trade.timestamp.hour * 60 + self.trade.timestamp.minute

    # Detect transition into the asian session window and clear that slot.
    if t >= 180 and self.last_minute < 180:
        self.session_highs[0] = 0.0
        self.session_lows[0] = 999999.0

    # (... same pattern for the other four sessions)

    self.last_minute = t

    # ... rest of execute()
```

### Trade only the first breakout per session

Add a `dict[str, bool]` to track which sessions already triggered a trade:

```raamcode
already_traded = {
    "asian":        False,
    "london":       False,
    "ny_overlap":   False,
    "ny_afternoon": False,
    "ny_close":     False,
}

def execute(self):
    ...
    if self.trade.close > max_high and self.trade.is_flat and max_high > 0.0:
        if t >= 180 and t < 420 and not self.already_traded["asian"]:
            self.already_traded["asian"] = True
            self.buy(self.trade, reason="First asian breakout")
        # (... same pattern for other sessions)
```

## Common diagnostics

| If you see | … the most likely cause |
|---|---|
| [`RC2_STATE_DECL_REQUIRED`](../errors/rc2-state-decl-required) | You tried to write `self.list[i] = ...` without declaring the list in the class body. |
| [`RC2_STATE_REBIND_COLLECTION`](../errors/rc2-state-rebind-collection) | You wrote `self.list = [...]` or `self.dict = {...}` inside `execute()`. Mutate via index/key writes instead. |
| [`RC2_STATE_EMPTY_LIST`](../errors/rc2-state-empty-list) | You wrote `name = []` in the class body. Use `[0.0]*0` (or the explicit element type literal) to pin the element type. |
| `RC2_HELPER_STATE_WRITE` | A helper tried to rebind a *scalar* — move the assignment to `execute()`. Collection index/key writes from helpers are allowed and do not trigger this. |
