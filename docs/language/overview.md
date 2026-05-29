# Language Overview

RaamCode is a strict subset of Python for writing trading strategies on Raamtrade. It reads like Python, runs in a fully sandboxed, deterministic environment, and rejects anything outside the language before your strategy ever runs.

Treat this section as the canonical contract. Every primitive, verb, and rule documented here is enforced by RaamCode and verified by tests.

## The ten things you'll get wrong if you treat it as Python

Every row below has been a real bug. Skim this once before you write your first strategy.

| # | Python instinct | RaamCode reality | Why |
|---|----------------|------------------|-----|
| 1 | `self.is_flat` | `self.trade.is_flat` | Position helpers live on the **symbol slot**, not on self. |
| 2 | `self.buy(stop=price)` | `self.buy(self.trade, stop=price)` | Order verbs require the target symbol as the first arg. |
| 3 | `self.sell(self.trade, stop=p)` | `self.sell(self.trade, self.trade.position, stop=p)` | Exit verbs require an explicit quantity. |
| 4 | `self.stop_loss = 2.0` | `self.stop_loss(2.0)` | Exit rules are function calls, not assignments. |
| 5 | `import pandas` | blocked | No imports. No external code. Ever. |
| 6 | `print(x)` | `print(x)` | Allowed. Each call emits one row to the Console / Log tab on your board. |
| 7 | `try: ... except:` | blocked | Error handling is the platform's job. |
| 8 | `my_list = [1,2,3]` as state | blocked | Persistent state is `int`, `float`, `bool`, `str` only. |
| 9 | Indicator anywhere | Indicators at top of `execute()` only | They need every bar's data to compute correctly. |
| 10 | `def execute(self):` returns value | Implicit hold | If execute() finishes without a signal, the position holds. |

## How to read these pages

Each language page covers one primitive end to end: signature, every valid invocation, every error RaamCode can report, and a minimal working example. They are not tutorials — they are a contract.

If you want to learn by doing, start with the [Quickstart](../getting-started) or the [Examples gallery](../examples/). Come back here when you need an answer.

## What happens when you publish

When you save a strategy, RaamCode:

1. Checks your code — types, structure, indicator placement, and order-verb usage.
2. Surfaces any problems inline in the editor, each with a line number and an error code.
3. Once it's clean, registers the strategy so every backtest, paper, and live run uses it.

You only ever interact with step 2 — the diagnostics panel flags issues as you write. See the [Error Reference](../errors/) for every code.

## Where the truth lives

This site is the contract for what the language guarantees. If a page here disagrees with how RaamCode actually behaves, the behavior wins and the page is a bug — please [report it](https://github.com/Raam-Intelligence/raamcode-docs/issues).
