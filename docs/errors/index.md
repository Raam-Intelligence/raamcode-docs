# Error Reference

Every error message RaamCode can report. Each page explains what the error means, the most common causes, and how to fix it with a before/after example.

## By prefix

| Prefix | Area | Scope |
|---|---|---|
| `RC2_*` | Structure & language | Structural errors — class shape, indicator placement, order verb misuse, state types. |
| `SDK*` | Publish & sandbox | Publish-time checks (`SDK001`–`SDK003`, `SDK014`) and sandbox rejections (`SDK010`–`SDK012`). |
| `CS*` | Low-level | Surfaced as-is — rare, typically only when a strategy bypasses the normal authoring path. |

## Most common errors

Start here. These five account for the majority of authoring errors.

| Code | Symptom | Fix |
|---|---|---|
| [`RC2_NO_SIZING`](./rc2-no-sizing) | "Strategy must declare a sizing model." | Add `sizing = FixedCapital()` (or `FixedQuantity` / `Compounding`) to the class body. |
| [`RC2_NO_SYMBOL`](./rc2-no-symbol) | "Strategy needs at least one Symbol." | Add `trade = Symbol()`. |
| [`RC2_EXIT_NO_QTY`](./rc2-exit-no-qty) | "qty required on sell." | Pass quantity: `self.sell(self.trade, self.trade.position)`. |
| [`RC2_IND_IN_BODY`](./rc2-ind-in-body) | "Indicator declared inside a conditional or loop." | Move indicator declaration to the top of `execute()`. |
| [`RC2_CLASS_BODY`](./rc2-class-body) | "Class body assignment X is not allowed." | Class body only takes `Param()`, `Symbol()`, `sizing`, and plain literals. |

## Structural — class body and required pieces

- [`RC2_CLASS_BODY`](./rc2-class-body) — class body contains a disallowed construct.
- [`RC2_NO_SYMBOL`](./rc2-no-symbol) — no `Symbol()` declared.
- [`RC2_NO_TRADE`](./rc2-no-trade) — multi-symbol strategy without `trade=True`.
- [`RC2_NO_SIZING`](./rc2-no-sizing) — no `sizing = ...` declared.
- [`RC2_NO_EXECUTE`](./rc2-no-execute) — no `def execute(self)`.

## Indicators

- [`RC2_IND_IN_BODY`](./rc2-ind-in-body) — indicator declaration inside a conditional or loop.
- [`RC2_UNKNOWN_INDICATOR`](./rc2-unknown-indicator) — unknown indicator name.
- [`RC2_CROSS_MULTIVALUE`](./rc2-cross-multivalue) — `crossed_above` / `crossed_below` on a multi-value indicator.

## Order verbs

- [`RC2_EXIT_NO_QTY`](./rc2-exit-no-qty) — exit verb missing the quantity positional.
- [`RC2_ENTRY_EXTRA_ARG`](./rc2-entry-extra-arg) — entry verb with more than one positional arg.
- [`RC2_OVERRIDE_INVALID`](./rc2-override-invalid) — override kwarg doesn't match the sizing model.

## State and helpers

- [`RC2_STATE_SYMBOL_CLASH`](./rc2-state-symbol-clash) — persistent state name collides with a Symbol.
- [`RC2_STATE_MIXED`](./rc2-state-mixed) — list elements (or dict values) have mixed types.
- [`RC2_STATE_NESTED`](./rc2-state-nested) — nested collections in a persistent-state literal.
- [`RC2_STATE_DICT_KEY`](./rc2-state-dict-key) — dict keys must be string literals.
- [`RC2_STATE_EMPTY_LIST`](./rc2-state-empty-list) — bare `[]` can't infer an element type. Use `[0.0]*0`.
- [`RC2_STATE_EMPTY_DICT`](./rc2-state-empty-dict) — bare `{}` can't infer a value type. Declare with one entry.
- [`RC2_STATE_REBIND_COLLECTION`](./rc2-state-rebind-collection) — can't reassign a class-body list/dict; mutate via index/key writes.
- [`RC2_STATE_DECL_REQUIRED`](./rc2-state-decl-required) — collections need a class-body declaration.
- [`RC2_STATE_AUGASSIGN_UNINIT`](./rc2-state-augassign-uninit) — augmented assignment on an undeclared slot.

## Sandbox

- [`RC2_IMPORT_BLOCKED`](./rc2-import-blocked) — `import` statement.
- [`SDK010`](./sdk010) — reference to a restricted platform type.
- [`SDK011`](./sdk011) — reference to a restricted platform namespace.
- [`SDK012`](./sdk012) — blocked builtin (`open`, `eval`, etc.).

## What if my error code isn't here?

Every error code comes with a human-readable message in the editor. If the message is enough, you don't need a page here. If you'd like a page written, [open an issue](https://github.com/Raam-Intelligence/raamcode-docs/issues) with the code and the snippet that triggered it — we add pages as cases come up.
