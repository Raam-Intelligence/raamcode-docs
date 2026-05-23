# Examples

Six complete, runnable RaamCode strategies. Each one is annotated end to end — paste, read, then tune.

| Strategy | Pattern | Concepts shown |
|---|---|---|
| [Buy and Hold](./buy-and-hold) | Minimal | The simplest valid strategy. |
| [MA Cross](./ma-cross) | Trend-following | Two indicators, crossover signals, stop loss + take profit. |
| [RSI Mean Reversion](./rsi-mean-reversion) | Mean reversion | Single oscillator, threshold crossings, f-string reasons. |
| [Bollinger Bounce](./bollinger-bounce) | Mean reversion + state | Composed indicator, persistent state, partial-exit alternatives. |
| [Rolling Channel Breakout](./rolling-channel-breakout) | Time-of-day + state | Class-body **list** + **dict** persistent state, for-loops, helper-method index writes, augmented assignment. |
| [SPY-Filtered Entries](./multi-symbol-spy-filter) | Multi-symbol filter | Data feed, regime gating, `Compounding` sizing. |

## How to use them

1. **Copy** the full source into the strategy editor.
2. **Backtest** with default parameters first — confirms it compiles and runs.
3. **Tune** by clicking Optimize — every `Param()` becomes an optimizer dimension automatically.
4. **Read** the walkthrough below each strategy — explains every nontrivial line and the design choices behind it.

The examples are intentionally small. They are starting points, not production strategies. Each one is a launchpad for ideas.
