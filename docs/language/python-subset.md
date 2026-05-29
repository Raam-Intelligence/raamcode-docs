# Python Subset

RaamCode is a strict subset of Python. Most everyday constructs work. A handful of categories don't — and they don't for specific reasons.

## What works

### Control flow

```raamcode
if condition:
    ...
elif other:
    ...
else:
    ...

for i in range(n):
    ...
```

No `while`, no `for x in some_list` (you can't construct a list anyway).

### Arithmetic and comparison

```raamcode
x = a + b * c / d
y = (a + b) % c
z = a ** 2
result = max(a, min(b, c))

# Comparisons
a == b, a != b, a < b, a > b, a <= b, a >= b
```

All arithmetic on indicator values and OHLCV happens in `decimal` precision — never `float`. Mixing types (e.g., `decimal * float`) is allowed; the result stays in `decimal`.

### Logical operators

```raamcode
a and b
a or b
not a
```

Short-circuit semantics are preserved (same as Python).

### Built-in functions

```raamcode
int(x), float(x), bool(x)
abs(x), min(a, b, ...), max(a, b, ...), round(x[, ndigits])
len(series), sum(series)
```

`len()` and `sum()` work on `Series` objects (custom indicator buffers). They do not work on arbitrary collections — there are no arbitrary collections.

### F-strings

```raamcode
reason = f"RSI is {rsi.value:.1f}, position={self.trade.position}"
self.buy(self.trade, reason=reason)
```

Format specs (`:.1f`, `:.3%`, `:>10`) work the same as in Python.

### Ternary expressions

```raamcode
size = 100 if self.trade.close > 50 else 50
```

## What's blocked

| Construct | Why |
|---|---|
| `import` anything | No external code. RaamCode can't reason about what's inside someone else's module. |
| `try`, `except`, `finally`, `raise` | Error handling is the platform's responsibility. Letting strategies catch and suppress errors hides bugs. |
| `async`, `await`, `yield` | Strategies are pure functions of bar data. Concurrency doesn't belong here. |
| `with` (context managers) | All resources are platform-managed. There's nothing user-level to enter / exit. |
| `lambda` | Eliminates entire classes of escape mechanism (callable values capturing scope). |
| `global`, `nonlocal`, `del` | State management is bounded. These three break that bound. |
| `eval()`, `exec()`, `open()` | Dynamic-code execution and file I/O are out of scope. |
| Mutable collections as state | Lists, dicts, tuples can't be persisted across bars. Use a `Series` in a custom indicator. |

Each blocked construct produces a specific error. See the [Error Reference](../errors/).

### `print(...)` is allowed

Use `print(...)` in your strategy code exactly like in plain Python — `print(*objects, sep=' ', end='\n')` (the `file=` and `flush=` kwargs are accepted for paste compatibility and ignored). Captured output appears in the **Console** tab on your board (during a backtest) or the **Log** tab (on a live runner). One `print(...)` call = one row.

```python
def execute(self):
    if self.rsi.crossed_above(70):
        print("RSI overbought at", self.trade.close)
        self.sell()
```

`print(...)` works in `execute()` and `on_update_indicators()`. Inside a custom indicator's `compute()` method it is suppressed (that body is cached, so the call would not re-fire). Each captured row carries the bar timestamp it fired on.

## Why a subset?

Three reasons:

1. **Determinism.** A strategy must produce identical results in backtest, paper, and live. Anything that can vary based on the environment (network, files, randomness) breaks that.
2. **Isolation.** Thousands of strategies run on shared infrastructure. Nothing escapes its own sandbox — and the easiest way to guarantee that is to leave imports and I/O out of the language entirely.
3. **Reviewability.** A strategy that's a few classes, a few methods, and arithmetic is easy to read. A strategy that pulls in arbitrary dependencies is not.

The subset is large enough that almost any trading idea fits. If yours doesn't, [open an issue](https://github.com/Raam-Intelligence/raamcode-docs/issues) — most "I need X" requests turn out to fit through an existing primitive once we look together.

## Common diagnostics

| Code | What it means |
|---|---|
| [`RC2_IMPORT_BLOCKED`](../errors/rc2-import-blocked) | `import` statement found. |
| [`SDK012`](../errors/sdk012) | Blocked built-in called (`eval`, `open`, etc.). |
| [`SDK010`](../errors/sdk010) | Reference to a restricted platform type. |
| [`SDK011`](../errors/sdk011) | Reference to a restricted platform namespace. |
| `RC2_EXEC_STMT` | Disallowed statement type in `execute()` (e.g. `try`, `with`, `raise`). |
| `RC2_FSTRING_SPEC` | F-string format spec RaamCode can't translate. |
