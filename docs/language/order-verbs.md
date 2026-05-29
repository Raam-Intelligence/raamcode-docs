# Order Verbs

Five verbs, each with exactly one meaning. Standard brokerage vocabulary (TradeStation lineage).

| Verb | Meaning | Auto-sized? |
|---|---|---|
| `buy` | Enter long from flat. | Yes — from sizing model. |
| `sell_short` | Enter short from flat. | Yes — from sizing model. |
| `sell` | Exit or reduce an existing long. | No — explicit quantity required. |
| `buy_to_cover` | Exit or reduce an existing short. | No — explicit quantity required. |
| `order` | Raw order, no position semantics. | No — explicit qty + direction. |

## Entry verbs: `buy`, `sell_short`

Auto-sized from the class-level `sizing` declaration. Take exactly one positional arg (the trade symbol). Additional positional args → `RC2_ENTRY_EXTRA_ARG`.

```raamcode
self.buy(self.trade, stop=price)                  # stop order, auto-sized
self.buy(self.trade, reason="Long signal")        # market order with reason
self.buy(self.trade)                              # market order

self.sell_short(self.trade, stop=price)           # short entry, auto-sized
self.sell_short(self.trade, reason="Short signal")
```

### Allowed kwargs

| Kwarg | Effect |
|---|---|
| `stop=price` | Make it a stop order instead of market. Fills at `price`. |
| `reason="..."` | Free-text annotation stored with the fill (separate from `print()`, which goes to the Console tab). |
| `qty=N` | Override sizing (only on `FixedQuantity`). |
| `percent=N` | Override sizing (only on `FixedCapital` / `Compounding`). |

Mismatching `qty=` or `percent=` to the sizing model raises [`RC2_OVERRIDE_INVALID`](../errors/rc2-override-invalid):

```raamcode
sizing = FixedCapital()
self.buy(self.trade, qty=10)        # ❌ qty= not allowed on FixedCapital
self.buy(self.trade, percent=50)    # ✅
```

## Exit verbs: `sell`, `buy_to_cover`

Explicit quantity is **always required** (positional arg). Sizing model isn't involved. No `qty=` or `percent=` kwargs.

```raamcode
self.sell(self.trade, self.trade.position, stop=price)        # full exit long
self.sell(self.trade, self.trade.position / 2)                # partial exit
self.sell(self.trade, 50)                                     # fixed partial exit

self.buy_to_cover(self.trade, self.trade.position, stop=price)       # full cover
self.buy_to_cover(self.trade, self.trade.position / 2)               # partial cover
```

Forgetting the quantity → [`RC2_EXIT_NO_QTY`](../errors/rc2-exit-no-qty):

```raamcode
self.sell(self.trade, stop=price)   # ❌ — qty is required on sell
```

Passing `qty=` or `percent=` to an exit verb → `RC2_EXIT_NO_KWARGS`.

## Raw verb: `order`

The escape hatch for pyramiding, hedging, or manual sizing. Both `qty` and `direction` are required.

```raamcode
self.order(self.trade, qty=5, direction=Buy, stop=price)
self.order(self.trade, qty=5, direction=Sell, stop=price)
```

`direction` uses the action terms `Buy` / `Sell` — these are language constants, not strings. Missing `qty` or `direction` → `RC2_ORDER_MISSING`.

## Fill timing

| Order type | Fills at |
|---|---|
| Market | The **next bar's open** (T+1). |
| Stop | The **stop price**, the bar the stop triggers on. |
| Limit | The **limit price**, the bar the limit triggers on. |

You never fill on the same bar you signal — that prevents look-ahead bias and matches how real exchanges work.

## Hard rules

- The **first positional argument** is always the symbol slot (`self.trade`). `self.buy(stop=price)` without it is `RC2_SIG_SYMBOL`.
- Orders can only target the **trading symbol**. `self.buy(self.spy, ...)` against a data feed is `RC2_SIG_DATAFEED`.
- **At most one signal per execution path per bar.** Two consecutive `self.buy()` calls in the same branch are silently merged into the first.
- An **entry verb when already in the same direction** is silently skipped. `self.buy()` while long is a no-op.
- An **exit verb when flat** fills 0 shares — also a no-op.

## Common diagnostics

| Code | What it means |
|---|---|
| [`RC2_ENTRY_EXTRA_ARG`](../errors/rc2-entry-extra-arg) | Entry verb got more than one positional arg. |
| [`RC2_EXIT_NO_QTY`](../errors/rc2-exit-no-qty) | Exit verb missing the quantity positional. |
| `RC2_EXIT_NO_KWARGS` | Exit verb received `qty=` or `percent=`. |
| [`RC2_OVERRIDE_INVALID`](../errors/rc2-override-invalid) | Override kwarg doesn't match the sizing model. |
| `RC2_SIG_SYMBOL` | First arg isn't a symbol slot. |
| `RC2_SIG_DATAFEED` | Order targets a data feed. |
| `RC2_SIG_UNKNOWN` | Verb name isn't a recognized order verb. |
| `RC2_ORDER_MISSING` | `order()` missing `qty=` or `direction=`. |
