# Symbol()

A `Symbol()` is a slot for a market instrument. The subscriber binds a real ticker (SPY, AAPL, TA35) to the slot when they deploy the strategy. The strategy itself never hard-codes ticker symbols.

## Single-symbol strategies

When a strategy has exactly one `Symbol()`, it's implicitly the trading symbol — no need for `trade=True`.

```raamcode
# Fully open — subscriber picks broker, session, and ticker
trade = Symbol()

# Broker-locked
trade = Symbol(broker="tradestation")

# Session-locked
trade = Symbol(session="USEquityDaily")

# Fully specified
trade = Symbol("SPY", broker="tradestation", session="USEquityDaily")
```

The more you specify, the more constrained the subscriber's choice. Leave fields unset to maximize reusability.

## Multi-symbol strategies (data feeds)

When you declare two or more Symbols, exactly **one** must be marked `trade=True` — that's the only slot orders can target. The rest are data feeds.

```raamcode
class SPYFiltered(Strategy):
    trade = Symbol(session="USEquityDaily", trade=True)  # required marker
    spy = Symbol(ticker="SPY")                           # data feed
    vix = Symbol(ticker="VIX")                           # data feed
    sizing = FixedCapital()

    def execute(self):
        spy_sma = SMA(50, on=self.spy)
        ...
```

Data feeds expose OHLCV (`self.spy.close`, `self.vix.high`, etc.) but **no position helpers** — `self.spy.is_flat` is an error. You cannot place orders against a data feed.

## Constructor arguments

| Argument | Type | Notes |
|---|---|---|
| `ticker` | string (optional, positional or kwarg) | Hard-codes a specific ticker. Subscribers cannot change it. |
| `broker` | string (optional) | Lock to a single broker (e.g. `"tradestation"`). |
| `session` | string (optional) | Lock to a named session (e.g. `"USEquityDaily"`). Sessions are declared globally. |
| `trade` | bool (optional) | Required `True` on exactly one symbol in multi-symbol strategies. |

## OHLCV access

Once declared, the slot exposes price data on every bar:

```raamcode
self.trade.close    # current bar close
self.trade.open     # current bar open
self.trade.high     # current bar high
self.trade.low      # current bar low
self.trade.volume   # current bar volume
```

All return `decimal` (financial precision — never `float`).

[More on OHLCV access →](./ohlcv)

## Position helpers (trading symbol only)

```raamcode
self.trade.is_flat       # position == 0
self.trade.is_long       # position > 0
self.trade.is_short      # position < 0
self.trade.has_position  # position != 0
self.trade.position      # current quantity (int)
```

These exist **only on the trading symbol**, not on data feeds. `self.spy.is_flat` → `RC2_DATAFEED_HELPER`.

[More on position helpers →](./position-helpers)

## Common diagnostics

| Code | What it means |
|---|---|
| [`RC2_NO_SYMBOL`](../errors/rc2-no-symbol) | No `Symbol()` declared. |
| [`RC2_NO_TRADE`](../errors/rc2-no-trade) | Multi-symbol strategy without `trade=True`. |
| `RC2_MULTI_TRADE` | More than one `Symbol(trade=True)`. |
| `RC2_SYMBOL_TICKER` | Invalid ticker literal. |
| `RC2_SYMBOL_BROKER` | Unknown broker name. |
| `RC2_UNKNOWN_SESSION` | Session name does not resolve. |
| `RC2_DATAFEED_HELPER` | Position helper used on a data feed. |
