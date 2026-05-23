# Bollinger Bounce

Composed indicator (SMA + StdDev = Bollinger Bands), mean-reversion entry, and persistent state to count trades. Demonstrates how RaamCode lets you build derived indicators inline without writing a custom class.

```raamcode
class BollingerBounce(Strategy):
    """Mean reversion on Bollinger Band touches with trade counting."""
    period = Param(20, min=10, max=50)
    num_std = Param(2, min=1, max=3)
    trade = Symbol()
    sizing = FixedCapital()

    def execute(self):
        sma = SMA(self.period, on=self.trade)
        sd = StdDev(self.period, on=self.trade)

        lower_band = sma.value - self.num_std * sd.value
        upper_band = sma.value + self.num_std * sd.value

        if self.trade.close < lower_band and self.trade.is_flat:
            self.trade_count = self.trade_count + 1
            self.buy(self.trade, reason=f"Touch lower band (trade #{self.trade_count})")

        if self.trade.close > upper_band and self.trade.is_long:
            self.sell(self.trade, self.trade.position, reason="Touch upper band")
```

## Walkthrough

### Composed indicator

There is no `BollingerBands` built-in. You don't need one — `SMA` for the midline and `StdDev` for the width compose cleanly:

```raamcode
sma = SMA(self.period, on=self.trade)
sd = StdDev(self.period, on=self.trade)

lower_band = sma.value - self.num_std * sd.value
upper_band = sma.value + self.num_std * sd.value
```

This pattern generalizes — any derived band (Keltner, Donchian, etc.) builds from primitives the same way.

### Persistent state

```raamcode
self.trade_count = self.trade_count + 1
```

First reference auto-initializes to `0`. Each entry increments. The counter persists across bars but resets when the strategy restarts (e.g., between WFA windows).

### F-string with state

```raamcode
reason=f"Touch lower band (trade #{self.trade_count})"
```

Every fill's reason includes its trade number. Pulling up the trade log later, you can correlate "trade #47 was the loss" with the specific entry conditions.

## What to tune

| Param | Typical range | Effect |
|---|---|---|
| `period` | 10..50 | Lower = bands react faster, more signals. |
| `num_std` | 1..3 | Lower = tighter bands, more touches; 2 is the classic Bollinger setting. |

## Common modifications

### Exit at the midline

Instead of waiting for the upper band, exit when price reverts to the mean:

```raamcode
if self.trade.is_long and self.trade.close >= sma.value:
    self.sell(self.trade, self.trade.position, reason="Reverted to mean")
```

Smaller wins, but more of them — and tighter risk.

### Scale in / scale out

Add a second entry at a deeper drop and a partial exit at the midline:

```raamcode
def execute(self):
    sma = SMA(self.period, on=self.trade)
    sd = StdDev(self.period, on=self.trade)

    lower_1 = sma.value - 2 * sd.value
    lower_2 = sma.value - 3 * sd.value

    if self.trade.close < lower_1 and self.trade.is_flat:
        self.buy(self.trade, percent=50, reason="First touch")

    if self.trade.close < lower_2 and self.trade.is_long:
        self.order(self.trade, qty=self.trade.position, direction=Buy, reason="Double down")

    if self.trade.is_long and self.trade.close > sma.value:
        self.sell(self.trade, self.trade.position / 2, reason="Half out at mean")

    if self.trade.is_long and self.trade.close > sma.value + sd.value:
        self.sell(self.trade, self.trade.position, reason="Full exit at upper")
```

### Volatility filter

Bollinger bands shrink in low volatility (sd → 0), so band touches become meaningless. Filter for some minimum width:

```raamcode
if sd.value > self.trade.close * 0.005:    # at least 0.5% volatility
    if self.trade.close < lower_band and self.trade.is_flat:
        self.buy(self.trade)
```
