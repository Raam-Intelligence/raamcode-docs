# Custom Indicators

Built-in indicators (`SMA`, `EMA`, `RSI`, etc.) cover most needs. When they don't, write your own as a subclass of `Indicator`.

```raamcode
class MySMA(Indicator):
    """Simple moving average."""
    period = Param(20, min=2, max=200)
    buffer = Series(period)

    def compute(self, close):
        self.buffer.add(close)
        if not self.is_ready:
            return 0
        return sum(self.buffer) / len(self.buffer)
```

A custom indicator is a class that:

- Inherits from `Indicator` (not `Strategy`).
- Declares `Param()`s and `Series()` buffers at class level.
- Implements `compute(self, <input1>, <input2>, ...)` — the parameter names declare what the indicator consumes.

## `compute()` signature

The parameter names in `compute()` determine the input. Allowed names:

| Name | Maps to |
|---|---|
| `close` | Source's close price. |
| `open` | Source's open. |
| `high` | Source's high. |
| `low` | Source's low. |
| `volume` | Source's volume. |

```raamcode
def compute(self, close):                 # consumes close
def compute(self, high, low):             # consumes high and low
def compute(self, open, high, low, close, volume):  # full OHLCV
```

Any other parameter name → `RC2_IND_COMPUTE_SIG`.

## `Series(capacity)` — rolling buffers

A `Series` is a fixed-size, FIFO buffer. Sized by a `Param` (so the capacity is optimizable), optionally offset by an integer literal:

```raamcode
buffer = Series(period)         # capacity = self.period
window = Series(period + 1)     # capacity = self.period + 1
```

The buffer is bounded by the param's `max` (plus any offset), not its `default` — the platform pre-allocates worst-case to avoid resizing.

### Sizing for aggregates vs. differences

Match the capacity to what you actually measure — this is the most common subtle bug in a custom indicator:

- **Aggregate over N values** — an average, sum, min/max, or standard deviation of the last N closes — uses `Series(period)`. You want exactly N values.
- **Change across N periods** — `close - buffer[0]` (momentum, rate-of-change, an N-period return) — uses `Series(period + 1)`. A change over N periods is the gap between two prices N bars apart, so the buffer must hold **N + 1** values: today's close *and* the one N bars back. With `Series(period)`, the oldest value (`buffer[0]`) is only N − 1 bars old, so the result spans one period too few.

```raamcode
class Momentum(Indicator):
    period = Param(14, min=1, max=200)
    buffer = Series(period + 1)        # +1 so buffer[0] is exactly N bars back

    def compute(self, close):
        self.buffer.add(close)
        if not self.is_ready:
            return 0
        return close - self.buffer[0]  # change over the full N periods
```

### Series API

| Method | Returns | Notes |
|---|---|---|
| `series.add(value)` | None | Append a new value. Drops oldest if at capacity. |
| `series[i]` | value | Index from oldest (0) to newest. |
| `len(series)` | int | Current size. |
| `sum(series)` | decimal | Sum of all values. |
| `series.stddev()` | decimal | Sample standard deviation. |
| `series.bars_since_max()` | int | Bars since the highest value. |
| `series.bars_since_min()` | int | Bars since the lowest value. |

## `self.is_ready`

True once **all** Series in the indicator have reached capacity. Most indicators return `0` (or a sentinel) until ready; the platform suppresses signals during the indicator's own warmup phase regardless.

```raamcode
def compute(self, close):
    self.buffer.add(close)
    if not self.is_ready:
        return 0
    return sum(self.buffer) / len(self.buffer)
```

## Single-value vs multi-value

Return a number to make the indicator single-valued (`SMA`, `RSI`, etc.) — usable with `>`, `<`, `crossed_above`, `crossed_below`:

```raamcode
return sum(self.buffer) / len(self.buffer)
```

Return a dict to make it multi-valued (like the built-in `DMI`). Field names become attributes you access from a strategy:

```raamcode
return {"up": up_value, "down": down_value, "oscillator": up_value - down_value}
```

**Mixing** scalar and dict returns in the same `compute()` is `RC2_IND_MIXED_RETURN`. Pick one shape per indicator.

## Where custom indicators live

You can use a custom indicator inline in a strategy file (same file) or publish it to your organization's catalog so other strategies can `SMA`-style import it by name. Org catalog publishing is covered in the platform docs.

## Example: TR (True Range)

```raamcode
class TR(Indicator):
    """True Range — max of (high-low), |high-prev_close|, |low-prev_close|."""
    prev_close_buffer = Series(2)

    def compute(self, high, low, close):
        self.prev_close_buffer.add(close)
        if not self.is_ready:
            return 0
        prev_close = self.prev_close_buffer[0]
        return max(high - low, abs(high - prev_close), abs(low - prev_close))
```

Use it from a strategy:

```raamcode
def execute(self):
    tr = TR(on=self.trade)
    if tr.value > self.trade.close * 0.03 and self.trade.is_flat:
        ...   # high-volatility entry
```

## Common diagnostics

| Code | What it means |
|---|---|
| `RC2_IND_NO_COMPUTE` | Indicator class missing `compute()` method. |
| `RC2_IND_COMPUTE_SIG` | `compute()` has an invalid parameter name. |
| `RC2_IND_COMPUTE` | `compute()` body contains a disallowed construct. |
| `RC2_IND_BODY` | Class body contains something other than `Param`, `Series`, or allowed declarations. |
| `RC2_IND_PARAM` | Param used incorrectly inside an indicator. |
| `RC2_IND_SERIES` | `Series()` capacity must be a `Param`, optionally offset by an integer literal (e.g. `Series(period + 1)`). |
| `RC2_IND_SERIES_CAPACITY` | `Series` capacity isn't a `Param`. |
| `RC2_IND_MIXED_RETURN` | `compute()` returns both scalar and dict in different paths. |
| `RC2_IND_INCONSISTENT_OUTPUTS` | Dict returns have inconsistent key sets across paths. |
| `RC2_IND_METHOD` | Disallowed method defined on an `Indicator`. |
