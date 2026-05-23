# Sizing

Every strategy must declare exactly one `sizing` property at class level. It tells entry verbs (`buy`, `sell_short`) how to compute quantity. Missing `sizing` → `RC2_NO_SIZING`.

## Three models

### `FixedQuantity(n)` — n contracts/shares

```raamcode
sizing = FixedQuantity()                                       # default: 1 contract
sizing = FixedQuantity(5)                                      # always 5
sizing = FixedQuantity(contracts=Param(1, min=1, max=100))     # user-tunable
```

- **Compute:** `quantity = n`. Capital and price are ignored.
- **Walk-forward:** constant — no equity chaining.

### `FixedCapital(percent)` — percent of **initial** capital

```raamcode
sizing = FixedCapital()                                        # 100% of initial capital
sizing = FixedCapital(
    percent=Param(80, min=10, max=100),
    fractional=Param(False),
)
```

- **Compute:** `floor(initial_capital * percent / 100 / execution_price)` — exact division if `fractional=True`.
- **Defaults:** `percent=100`, `fractional=False`.
- **Walk-forward:** constant — initial capital is fixed per window.

### `Compounding(percent)` — percent of **current** equity

```raamcode
sizing = Compounding()                                         # 100% of current equity
sizing = Compounding(
    percent=Param(95, min=10, max=100),
    fractional=Param(False),
)
```

- **Compute:** `floor(capital * percent / 100 / execution_price)`.
- **Defaults:** `percent=100`, `fractional=False`.
- **Walk-forward:** compounding — equity chains across windows.

## When each model fits

| Model | Use when |
|---|---|
| `FixedQuantity` | Futures / options where contract size is intrinsic. Risk-based sizing (compute quantity manually, override with `qty=`). |
| `FixedCapital` | Equity strategies you want to compare on equal footing — every backtest starts from the same dollar amount. |
| `Compounding` | Long-horizon strategies where you want winners to grow the position. The realistic "let it run" model. |

## Sizing params are optimizable

Any `Param()` inside a sizing model behaves like any other Param — the optimizer sweeps it.

```raamcode
sizing = Compounding(percent=Param(95, min=50, max=100, opt_step=5))
```

To freeze a sizing param, set `min == max` (or `opt_min == opt_max`).

## Override per signal

Entry verbs accept override kwargs that **replace** the class-level setting for that one trade.

| Sizing model | `qty=` | `percent=` |
|---|---|---|
| `FixedQuantity` | Allowed | `RC2_OVERRIDE_INVALID` |
| `FixedCapital` | `RC2_OVERRIDE_INVALID` | Allowed |
| `Compounding` | `RC2_OVERRIDE_INVALID` | Allowed |

```raamcode
# FixedQuantity: override contract count
sizing = FixedQuantity(5)
self.buy(self.trade, qty=10, stop=price)                # 10 contracts instead of 5

# FixedCapital: override allocation percent (replaces 80, not multiplied)
sizing = FixedCapital(percent=80)
self.buy(self.trade, percent=50, stop=price)            # 50% of initial_capital

# Compounding: override allocation percent
sizing = Compounding(percent=95)
self.sell_short(self.trade, percent=50, stop=price)     # 50% of current equity
```

`percent=` is always a **replacement**, not multiplicative. The class-level value is ignored for that trade.

## Quantity resolution timing

Entry verbs do **not** resolve quantity at signal time. The platform computes the final quantity at **fill time** using the execution price:

- **Market orders** — quantity computed from the next bar's open.
- **Stop / limit orders** — quantity computed from the stop or limit price.

If the computed quantity is 0 (insufficient capital for even 1 unit), the trade is silently skipped. The order does not appear in fills.

## Common diagnostics

| Code | What it means |
|---|---|
| [`RC2_NO_SIZING`](../errors/rc2-no-sizing) | No `sizing = …` in the class body. |
| `RC2_SIZING_UNKNOWN` | Unrecognized sizing model name. |
| [`RC2_OVERRIDE_INVALID`](../errors/rc2-override-invalid) | Override kwarg not allowed for this sizing model. |
