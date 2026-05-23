# RC2_NO_TRADE

> Multiple Symbols declared; mark exactly one as `trade=True` to designate the trading symbol.

## What it means

When a strategy declares two or more `Symbol()` slots, RaamCode can't infer which one orders should target. You must mark exactly one with `trade=True`.

The other slots become **data feeds** — read-only OHLCV streams. You can read `self.spy.close`, but `self.spy.is_flat` and `self.buy(self.spy)` are errors.

## How to fix it

Mark the slot you trade against:

```raamcode
class SPYFiltered(Strategy):
    trade = Symbol(session="USEquityDaily", trade=True)   # ✅ explicit trading slot
    spy = Symbol(ticker="SPY")                            # data feed
    sizing = FixedCapital()

    def execute(self):
        spy_sma = SMA(50, on=self.spy)
        if self.spy.close > spy_sma.value and self.trade.is_flat:
            self.buy(self.trade)
```

## Single-symbol shortcut

In **single-symbol** strategies the marker is optional — the lone Symbol is implicitly the trading symbol:

```raamcode
class Simple(Strategy):
    trade = Symbol()       # ✅ no trade=True needed
    sizing = FixedCapital()
```

## Related

- [`Symbol()`](../language/symbols)
- [`RC2_NO_SYMBOL`](./rc2-no-symbol)
- `RC2_MULTI_TRADE` — more than one Symbol has `trade=True`.
