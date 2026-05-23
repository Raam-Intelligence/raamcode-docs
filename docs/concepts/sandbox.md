# Sandbox

RaamCode only lets you express trading logic. Anything outside that — file access, network calls, imports, arbitrary system access — simply isn't part of the language. There's nothing to escape, because the capability was never there.

## What "sandbox" means here

A typical sandbox restricts what code can do while it runs — file access blocked, network calls intercepted, system calls denied. RaamCode is different: the unsafe constructs aren't part of the language at all. If you write one, your strategy is rejected before it ever runs, with a clear error pointing at the line.

## What's not allowed

| Category | Examples |
|---|---|
| **External code** | `import` anything (stdlib or third-party). |
| **I/O** | `print()`, `open()`, file reads, file writes. |
| **Network** | No HTTP, no sockets, no DNS. |
| **Dynamic code** | `eval()`, `exec()`, `compile()`. |
| **Error handling** | `try`, `except`, `finally`, `raise`. |
| **Concurrency** | `async`, `await`, `yield`, threading, multiprocessing. |
| **Context managers** | `with` statements. |
| **Closures and lambdas** | `lambda` expressions, nested function definitions. |
| **Scope escape** | `global`, `nonlocal`, `del`. |
| **Mutable collections as state** | `list`, `dict`, `set`, `tuple` as persistent state. |
| **Platform internals** | Reaching into restricted platform APIs (via SDK010 / SDK011). |

Each blocked construct produces a specific error with a line number. See the [Error Reference](../errors/).

## Why these restrictions

Three reasons, in priority order:

### 1. Determinism

A strategy must produce identical results across backtest, paper, and live. Anything that can vary with the environment violates this.

- Network calls → return different data depending on when you run.
- File I/O → depends on what's on disk, which differs per host.
- Randomness → varies per invocation.
- Threading → introduces ordering nondeterminism.

By refusing all of these, RaamCode can guarantee: same inputs, same outputs, every time. Without this, walk-forward and live replay break down.

### 2. Isolation

Thousands of strategies run on shared infrastructure. The platform's reputation hinges on one strategy not affecting another.

- No file I/O → can't poison another strategy's data.
- No network → can't make outbound calls that violate rate limits or expose credentials.
- No reaching into internals → a strategy stays inside its own logic.
- No `import` → can't pull in code with its own escape hatches.

Because these capabilities aren't part of the language, isolation is guaranteed by construction — not patched in after the fact.

### 3. Reviewability

A strategy that's a few classes, a few methods, and arithmetic is auditable in five minutes. A strategy that pulls in third-party packages is auditable in five days. The platform's published-strategy market depends on auditability.

## What you can still do

The subset is large enough that almost every trading idea fits:

- Arithmetic, comparison, logical operators.
- Control flow: `if`, `elif`, `else`, `for ... in range(n)`.
- Built-in functions: `int`, `float`, `bool`, `abs`, `min`, `max`, `round`, `len`, `sum`.
- F-strings with format specs.
- Ternary expressions.
- Helper methods, custom indicators, sessions.
- Persistent state (`int`, `float`, `bool`, `str`).
- All built-in indicators and order verbs.

[See Python Subset →](../language/python-subset) for the full list.

## "I really need X"

If a blocked construct seems necessary, there's almost always a platform primitive that replaces it:

| You want | RaamCode answer |
|---|---|
| `import numpy` for math | Built-in `min`, `max`, `abs`, `sum`, and indicators cover the cases that matter. |
| `print()` for debugging | `reason="..."` on every order — saved to the trade log. |
| Read a file | Sessions and Symbols handle data delivery. Files are not a thing here. |
| Persistent list of recent values | `Series` inside a custom indicator. |
| Long-lived storage | Persistent state — within a run. For cross-run memory, use the optimizer (parameters are the persistent thing). |

If you find a case that genuinely doesn't fit, [open an issue](https://github.com/Raam-Intelligence/raamcode-docs/issues). Most of them turn out to fit through an existing primitive once we look together.

## Related diagnostics

| Code | Cause |
|---|---|
| [`RC2_IMPORT_BLOCKED`](../errors/rc2-import-blocked) | `import` statement. |
| [`SDK010`](../errors/sdk010) | Reference to a restricted platform type. |
| [`SDK011`](../errors/sdk011) | Reference to a restricted platform namespace. |
| [`SDK012`](../errors/sdk012) | Blocked builtin (e.g. `print`, `open`, `eval`). |
| `RC2_EXEC_STMT` | Disallowed statement type (`try`, `with`, `raise`, etc.). |
