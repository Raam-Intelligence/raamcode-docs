# Param()

A `Param()` is a tunable strategy input. It has a default, an optional range, and optional optimizer hints. Every `Param()` is visible to the user in the UI and to the optimizer as a search dimension.

## Signature

```text
Param(default, *, min=None, max=None, opt_min=None, opt_max=None, opt_step=None)
```

| Argument | Required | Notes |
|---|---|---|
| `default` | Yes | Type inferred: `7` = int, `2.0` = float, `True` = bool. |
| `min` / `max` | No | Hard bounds. Boundary violations are rejected before your strategy runs (no silent clamping). |
| `opt_min` / `opt_max` | No | Optimizer grid range. Must be within `min`/`max`. Defaults to `min`/`max`. |
| `opt_step` | No | Grid step. Defaults to `1` (int) or `0.01` (float). |

## Examples

```raamcode
# Integer with hard bounds
fast_period = Param(7, min=2, max=50)

# Float
sl_pct = Param(2.0, min=0.1, max=20.0)

# Boolean
fractional = Param(False)

# Separate optimization bounds — sweep 15..100 step 5, but the user can still type 10..200
slow = Param(21, min=10, max=200, opt_min=15, opt_max=100, opt_step=5)

# Plain literal — declares a scalar [persistent state](./persistent-state) slot with
# the literal as its initial value. Available inside execute() as `self.position_size`
# and reset to 100 at the start of every walk-forward window.
position_size = 100
```

> **Param vs. plain literal.** `Param()` is a *tunable* input that participates in optimization
> and is exposed in the UI. A plain literal (`position_size = 100`) declares a *persistent state*
> slot whose initial value is the literal — see [Persistent State](./persistent-state) for the
> full mechanics.

## Supported types

`int`, `float`, `bool` — that's it. Strings, lists, dicts, tuples are not supported.

```raamcode
mode = Param("aggressive")  # ❌ — string Params not supported
filters = Param([1, 2, 3])  # ❌ — collections not supported
```

For string-keyed behaviour, use a `bool` switch or split into multiple strategies.

## How Params reach you

Inside `execute()` (or any helper method) every Param is exposed as `self.<name>`:

```raamcode
class MACross(Strategy):
    fast = Param(7, min=2, max=50)
    trade = Symbol()
    sizing = FixedCapital()

    def execute(self):
        ma = SMA(self.fast, on=self.trade)   # self.fast reads the Param's current value
```

## Optimizer integration

Every Param with `min`/`max` (or `opt_min`/`opt_max`) automatically becomes a dimension in the optimizer grid. There is no separate "optimizer schema" to maintain.

```raamcode
fast = Param(7, min=2, max=50)                          # 49 values, step 1 = 49 dims
slow = Param(21, min=10, max=200, opt_step=5)           # 39 values, step 5 = 39 dims
sl_pct = Param(2.0, min=0.5, max=5.0, opt_step=0.5)     # 10 float steps
```

To **freeze** a Param (keep it in the UI but exclude from optimization), set `opt_min == opt_max`:

```raamcode
slippage = Param(0.5, min=0.0, max=5.0, opt_min=0.5, opt_max=0.5)
```

## Naming rules

A Param name cannot:

- Shadow a strategy-level property (`capital`, `bar_count`, `ready`, etc.) → `RC2_PARAM_RESERVED`
- Collide with a `Symbol` name in the same class → `RC2_STATE_PARAM_CLASH`
- Be assigned a value other than a `Param()` call or a plain literal in the class body → `RC2_CLASS_BODY`

## Common diagnostics

| Code | What it means |
|---|---|
| [`RC2_PARAM_DEFAULT`](../errors/rc2-class-body) | `Param()` called without a default value. |
| `RC2_PARAM_RESERVED` | Param name shadows a reserved property. |
| `RC2_STATE_PARAM_CLASH` | Param name collides with a Symbol or persistent state variable. |
