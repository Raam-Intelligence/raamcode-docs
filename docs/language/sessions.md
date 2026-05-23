# Sessions

A `Session` declares **when the market is open and how bars are sliced**. Strategies reference sessions by name via `Symbol(session="...")`; the platform uses the session to fetch broker data and align bar timestamps across venues.

```raamcode
class USEquityHourly(Session):
    """US Equities — hourly bars during the regular session."""
    timezone = "America/New_York"
    days = ["mon", "tue", "wed", "thu", "fri"]
    bars = [
        ("09:30", "10:30"),
        ("10:30", "11:30"),
        ("11:30", "12:30"),
        ("12:30", "13:30"),
        ("13:30", "14:30"),
        ("14:30", "15:30"),
        ("15:30", "16:00"),
    ]
    broker = {
        "tradestation": {"sessionTemplate": "Default", "unit": "Minute", "interval": "60"},
    }
```

## Required fields

| Field | Type | Notes |
|---|---|---|
| `timezone` | string | IANA timezone name (e.g. `"America/New_York"`, `"Asia/Jerusalem"`). |
| `days` | list of strings | Lowercase 3-letter abbreviations: `"mon"`, `"tue"`, `"wed"`, `"thu"`, `"fri"`, `"sat"`, `"sun"`. |
| `bars` | list of `(start, end)` tuples | Each bar's open and close times in `"HH:MM"` format, in the session's timezone. |

## Optional fields

| Field | Type | Notes |
|---|---|---|
| `broker` | dict | Broker-specific parameters used when fetching data. Keys are broker names (`"tradestation"`, etc.). |

The `broker` dict is a pass-through to the broker's data API. Different brokers want different fields — consult the broker's documentation.

## The `every(...)` helper

For regular intraday intervals, `every(minutes, start, end)` generates the `bars` list for you:

```raamcode
bars = every(5, "09:30", "16:00")     # 78 five-minute bars 09:30 → 16:00
bars = every(15, "09:30", "16:00")    # 26 fifteen-minute bars
bars = every(60, "09:30", "16:00")    # 7 hourly bars (last bar is 30 minutes)
```

The helper places the start of each bar on the requested interval and truncates the last bar at `end`.

## Daily and longer

For daily bars, use a single tuple:

```raamcode
class USEquityDaily(Session):
    """US Equities — one daily bar."""
    timezone = "America/New_York"
    days = ["mon", "tue", "wed", "thu", "fri"]
    bars = [("09:30", "16:00")]
    broker = {"tradestation": {"sessionTemplate": "Default", "unit": "Daily", "interval": "1"}}
```

Weekly and monthly bars are broker pass-through — the session declares the trading calendar and the `broker` dict tells the broker to return aggregated bars.

## Why declare sessions at all?

Two reasons.

1. **Determinism.** A backtest needs to know "what counts as a bar" without depending on broker-specific defaults that can change.
2. **Cross-venue alignment.** When two symbols on different brokers share a session, their bars are aligned to the same wall-clock timestamps — multi-symbol strategies work consistently.

The session is the universal bar-timing contract. Strategies stay broker-agnostic; sessions resolve to broker-specific fetch parameters at deploy time.

## Where sessions live

Sessions are declared once in your organization's catalog and referenced by name. You don't redeclare them in every strategy — `trade = Symbol(session="USEquityDaily")` is a lookup, not a declaration.

## Common diagnostics

| Code | What it means |
|---|---|
| `RC2_UNKNOWN_SESSION` | Session name in `Symbol(session=...)` doesn't resolve to a declared session. |
